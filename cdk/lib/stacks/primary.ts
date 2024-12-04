import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DataBucket, StaticSiteBucket } from '../s3/buckets';
import { PrimaryCloudFrontDistribution } from '../cloudfront/distributions';
import { AppInstance } from '../instances';
import { StaticSiteDeployment } from '../deployments';
import { WriterFunction } from '../lambda/functions';
import { WriterRole } from '../iam/roles';
import { WriterIdentityPool } from '../cognito/identity-pools';
import { WriterInvokerRole } from '../iam/roles/writer-invoker';

interface PrimaryStackProps {
  instance: AppInstance,
}

export class PrimaryStack extends Stack {
  readonly usEast1Stack: Stack;

  constructor(scope: Construct, {
    instance,
  }: PrimaryStackProps) {
    super(scope, `Botanami-${instance.name}-PrimaryStack`, {
      crossRegionReferences: true,
    });

    this.usEast1Stack = 
      new Stack(scope, `Botanami-${instance.name}-UsEast1Stack`, { 
        env: { region: "us-east-1" }, 
        description: `Secondary stack for resources that need to be in us-east-1`
      });

    const roles = {
      writer: new WriterRole(this),
      writerInvoker: new WriterInvokerRole(this),
    };

    const buckets = {
      data: new DataBucket(this,{ roles, }),
      staticSite: new StaticSiteBucket(this),
    };
    
    const identityPool = 
      new WriterIdentityPool(this, { roles, });

    const lambdas = {
      writer: new WriterFunction(this, { buckets, roles, }),
    };

    const distributions = {
      primary: new PrimaryCloudFrontDistribution(this, { instance, buckets, lambdas, }),
    };

    new StaticSiteDeployment(this, { buckets, distributions, identityPool, });
  }
}