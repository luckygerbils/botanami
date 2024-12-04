#!/usr/bin/env node
import 'source-map-support/register';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { App, Stack, Stage } from 'aws-cdk-lib';
import { PrimaryStack } from '../lib/stacks/primary';
import { nonNull } from "../lib/util";
import { Beta, Prod } from '../lib/instances';

const env = {
  account: nonNull(process.env.CDK_DEFAULT_ACCOUNT!, "CDK_DEFAULT_ACCOUNT is null"),
  region: "us-west-2",
};

const app = new App();
const pipelineStack = new Stack(app, "Botanami-PipelineStack", { env });
const pipeline = new CodePipeline(pipelineStack, 'Pipeline', {
  pipelineName: 'BotanamiPipeline',
  synth: new ShellStep('Synth', {
    input: CodePipelineSource.gitHub('luckygerbils/botanami', 'main'),
    commands: ['./run.sh ci:synth'],
    primaryOutputDirectory: "cdk/cdk.out",
    env: {
      CI: "true",
    },
  })
});

[
  Beta,
  Prod,
].forEach(instance => {
  const instanceStage = new Stage(pipelineStack, instance.name, { env });
  const primaryStack = new PrimaryStack(instanceStage, { instance });
  pipeline.addStage(instanceStage);
});

