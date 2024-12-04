import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { PrimaryStack } from "../../stacks/primary";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { AppInstance } from "../../instances";
import { ARecord, PublicHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { FunctionUrlOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { FunctionUrl, IFunction } from "aws-cdk-lib/aws-lambda";

interface PrimaryCloudFrontDistributionProps {
  instance: AppInstance,
  buckets: {
    staticSite: Bucket,
    data: Bucket,
  },
  lambdas: {
    writer: { url: FunctionUrl, },
  }
}

export class PrimaryCloudFrontDistribution extends Distribution {
  constructor(scope: PrimaryStack, { 
    instance,
    buckets,
    lambdas,
  }: PrimaryCloudFrontDistributionProps) {
    const originAccessIdentity = 
      new OriginAccessIdentity(scope, 'CloudFrontOriginAccessIdentity');
    
    // Create DNS records inside existing hosted zone
    const anastaSi = PublicHostedZone.fromHostedZoneAttributes(scope, "AnastaSi", {
        hostedZoneId: "Z3PODT6L2Y6659",
        zoneName: "anasta.si",
      });
  
    super(scope, 'CloudFrontDistribution', {
      certificate: new Certificate(scope.usEast1Stack, "StaticSiteCertificate", {
        domainName: instance.domainName,
        validation: CertificateValidation.fromDns(anastaSi),
      }),
      domainNames: [ instance.domainName ],
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(buckets.staticSite, {
            originAccessIdentity,
        }),
        // functionAssociations: [{
        //     function: new CloudFrontFunction(this, 'Function', {
        //       code: FunctionCode.fromInline((
        //         // @ts-ignore
        //         function handler(event) {
        //             var request = event.request;
        //             if (request.uri.endsWith('/')) {
        //                 request.uri += 'index.html';
        //             }
        //             return request;
        //         }).toString()
        //       ),
        //     }),
        //     eventType: FunctionEventType.VIEWER_REQUEST
        // }],
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // responseHeadersPolicy: responseHeaderPolicy
      },
      errorResponses: [
        {
          httpStatus: 403,
          responsePagePath: "/index.html",
          responseHttpStatus: 200,
        },
      ],
      additionalBehaviors: {
        "/api/*": {
          origin: new FunctionUrlOrigin(lambdas.writer.url),
          allowedMethods: AllowedMethods.ALLOW_ALL,
        },
        "/data/*": {
          origin: new S3Origin(buckets.data, {
            originAccessIdentity,
          }),
        }
      },
    });

    new ARecord(this, "BucketCname", {
      zone: anastaSi,
      recordName: instance.domainName.substring(0, instance.domainName.length - ".anasta.si".length),
      target: RecordTarget.fromAlias(new CloudFrontTarget(this)),
    });
  }
}