import { IdentityPool, UserPoolAuthenticationProvider } from "@aws-cdk/aws-cognito-identitypool-alpha";
import { AccountRecovery, Mfa, UserPool, UserPoolClient, UserPoolClientIdentityProvider } from "aws-cdk-lib/aws-cognito";
import { FederatedPrincipal, IRole, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface WriterIdentityPoolProps {
  roles: {
    writerInvoker: Role,
  }
}

export class WriterIdentityPool extends IdentityPool {
  readonly userPool: UserPool;
  readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, {
    roles
  }: WriterIdentityPoolProps) {
    const userPool = new UserPool(scope, "WriterUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      mfa: Mfa.OPTIONAL,
    });

    const userPoolClient = new UserPoolClient(scope, "WriterUserPoolClient", {
      userPool,
      authFlows: {
        userSrp: true,
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
      ]
    });

    super(scope, "WriterIdentityPool", {
      authenticationProviders: {
        userPools: [ new UserPoolAuthenticationProvider({ userPool, userPoolClient }) ],
      },
      authenticatedRole: roles.writerInvoker,
    });

    roles.writerInvoker.assumeRolePolicy?.addStatements(new PolicyStatement({
      actions: ["sts:AssumeRole"],
      principals: [
        new FederatedPrincipal("cognito-identity.amazonaws.com", {
          'StringEquals': {
            'cognito-identity.amazonaws.com:aud': this.identityPoolId,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': "Authenticated",
          },
        }, 'sts:AssumeRoleWithWebIdentity'),
      ],
    }));

    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
  }
}