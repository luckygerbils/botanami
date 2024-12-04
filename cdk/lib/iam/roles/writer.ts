import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class WriterRole extends Role {
  constructor(scope: Construct) {
    super(scope, "WriterRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
  }
}