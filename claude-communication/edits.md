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

## Edit 5

Please split the cdk infastructure deployment and the s3 deployment into 2 separate scripts

## Edit 6

instead of outputting 1 index.html in the dist folder, build an index.html, script.js, and styles.css file
instead. Update the esbuild config and the content build and deployment scripts to accomidate this change.
Also update claude.md and readme.md

## Edit 7

Please use file content
hashing for the production build of script.js and styles.css dist files.
