import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";

export class TimeBlobStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = "blob.christinarees.com";
    const zoneName = "christinarees.com";

    // Look up existing hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: zoneName,
    });

    // ACM certificate (must be us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // S3 bucket for static website
    const bucket = new s3.Bucket(this, "TimeBlobBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      domainNames: [domainName],
      certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Route53 A record pointing to CloudFront
    new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      recordName: "blob",
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
    });

    // Deploy index.html to S3
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../"))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
      exclude: ["cdk/*", "cdk", "*.md", "deploy.sh", ".git/*", ".git"],
    });

    // Outputs
    new cdk.CfnOutput(this, "BucketName", {
      value: bucket.bucketName,
      description: "S3 bucket name",
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "CloudFront distribution ID",
    });

    new cdk.CfnOutput(this, "DistributionDomain", {
      value: distribution.distributionDomainName,
      description: "CloudFront distribution domain",
    });

    new cdk.CfnOutput(this, "WebsiteUrl", {
      value: `https://${domainName}`,
      description: "Website URL",
    });
  }
}
