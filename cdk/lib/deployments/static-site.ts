import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import * as fs from "node:fs"
import * as path from "node:path"
import { WriterIdentityPool } from "../cognito/identity-pools";

interface StaticSiteDeploymentProps {
  buckets: {
    staticSite: Bucket,
  },
  distributions: {
    primary: Distribution,
  },
  identityPool: WriterIdentityPool,
}

export class StaticSiteDeployment extends BucketDeployment {
  constructor(scope: Construct, {
    buckets,
    distributions,
    identityPool,
  }: StaticSiteDeploymentProps) {
    super(scope, "DeployStaticSite", {
      sources: [ 
        Source.data(
          "index.html",
          `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>This page is <script>document.write(location.pathname)</script></p>
    <p>User Pool Id: <code>${identityPool.userPool.userPoolId}</code></p>
    <p>Identity Pool Id: <code>${identityPool.identityPoolId}</code></p>
  </body>
</html>`
        )
        // Source.asset("../website/out"), 
        // Source.data(
        //   "config.js",
        //   `window.config = ${JSON.stringify({
        //     userPoolId: userPool.userPoolId,
        //     userPoolClientId: userPoolClient.userPoolClientId,
        //     identityPoolId: identityPool.identityPoolId,
        //     functionUrl: lambdaFunctionUrl.url,
        //   })};`
        // ),
      ],
      destinationBucket: buckets.staticSite,
      distribution: distributions.primary,
      // distributionPaths:
      //   find("../website/out", (f: string) => f !== "_next")
      //     .map((p: string) => p.replace(/^..\/website\/out/, "")),
    });
  }
}

function find(dir: string, filter: (str: string) => boolean): string[] {
  return fs.readdirSync(dir)
    .filter(filter)
    .map(file => path.join(dir, file))
    .flatMap(file => fs.statSync(file).isDirectory() ? find(file, filter) : [ file ]);
}