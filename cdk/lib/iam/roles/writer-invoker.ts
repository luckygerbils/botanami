import { AccountPrincipal, AccountRootPrincipal, CfnRole, FederatedPrincipal, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class WriterInvokerRole extends Role {
  constructor(scope: Construct) {
    super(scope, "WriterInvokerRole", {
      // Dummy. Will be replaced by actual policy when the identity pool is created
      assumedBy: new AccountRootPrincipal(),
    });
    // Delete the dummy policy
    (this.node.defaultChild as CfnRole)
      .addPropertyDeletionOverride('AssumeRolePolicyDocument.Statements.0');
  }
}