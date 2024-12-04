import { IRole } from "aws-cdk-lib/aws-iam";
import { Code, Function, FunctionUrl, FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface WriterFunctionProps {
  buckets: {
    data: Bucket,
  },
  roles: {
    writer: IRole,
    writerInvoker: IRole,
  }
}

export class WriterFunction extends Function {
  readonly url: FunctionUrl;
  constructor(scope: Construct, {
    buckets,
    roles,
  }: WriterFunctionProps) {
    super(scope, "WriterFunction", {
      runtime: Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: Code.fromInline("function(){}"),
      // code: Code.fromAsset("../lambda/out"),
      role: roles.writer,
      environment: {
        DATA_BUCKET: buckets.data.bucketName,
      }
    });

    this.url = this.addFunctionUrl({
      authType: FunctionUrlAuthType.AWS_IAM,
    });

    this.grantInvoke(roles.writerInvoker);
  }
}