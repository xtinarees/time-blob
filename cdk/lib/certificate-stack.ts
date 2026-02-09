import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = "blob.christinarees.com";
    const zoneName = "christinarees.com";

    // Look up existing hosted zone
    this.hostedZone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: zoneName,
    });

    // ACM certificate (must be us-east-1 for CloudFront)
    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });
  }
}
