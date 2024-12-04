import { RemovalPolicy } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface DataBucketProps {
  roles: {
    writer: IRole,
  },
}

export class DataBucket extends Bucket {
  constructor(scope: Construct, {
    roles,
  }: DataBucketProps) {
    super(scope, "DataBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.grantReadWrite(roles.writer);
  }
}