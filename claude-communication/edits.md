Documentation for simple Claude prompts given directly without using plans.

## Edit 1

Add a test mode that will allow me to view different states of the blob. Base the test mode off of a config setting. When test mode is on, the following controls should be viewable on the page:

1. A slider for viewing the blob at any UTC time, from 0 to 24.
2. A "Generate new blob" button for similating a "new" day.

## Edit 2

In the existing test mode UI, add options to change all the "MeshPhysicalMaterial" options

## Edit 3

update @README.md and create an .env.example file to document what env
variables need to exist in order for the cdk scripts to run properly.
Reference the @cdk/ directory.

## Edit 4

Clean up scripts by moving @cdk/package.json to @package.json so there is only 1 package file. Also clearly document and distinguish between deploying the cdk infastructure and deploying to the s3 bucket. Update @readme.md and @claude.md to reflect these changes.
