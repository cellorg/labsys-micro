# labsys-micro

API Gateway -> VPC Link -> Cloud Map (i.e. Service Discovery) -> ECS -> fargate services 

### Initial manual steps that AWS administrator needs to take.
There are three tasks that need to be carried out by the AWS administrator before using this project's Github Actions. 
1. **Create the VPC**: The infrastructure team prefers to having all non prod environments, i.e. d1, d2, t3, etc.
  to be deployed in the same nonprod AWS account to share the same VPC, etc. in order to reduce the cost.
  Therefore, the vpc should be created first. Please let the application developers know the vpc name for both nonprod and prod.
  The application developer needs to make sure the vpcId matches to what infrastructure team created in the 
  cdk-infra/githu-deploy-infra/common/cdkUtil.ts. This allows our application to import the existing VPC.
2. **Create the Secrets**: We are using AWS Secrets Manager to store the database passwords, etc.
  Therefore, the AWS administrator should create these secrets first. This can be done via the following aws-cli command. 
  Note: in order to run aws-cli, you will need to do aws config (use the profiles for nonprod and prod AWS accounts). 
   * aws secretsmanager create-secret --name PDP_OWNER_PASSWORD --secret-string `secretValue` --profile `awsEnv` <br>
     examples:
      * `aws secretsmanager create-secret --name d1_PDP_OWNER_PASSWORD --secret-string "pdpOwnerPasswordFromSecret-d1" --profile nonprod`
      * `aws secretsmanager create-secret --name d2_PDP_OWNER_PASSWORD --secret-string "pdpOwnerPasswordFromSecret-d2" --profile nonprod`
      * `aws secretsmanager create-secret --name t3_PDP_OWNER_PASSWORD --secret-string "pdpOwnerPasswordFromSecret-t3" --profile nonprod`
      * `aws secretsmanager create-secret --name prod_PDP_OWNER_PASSWORD --secret-string "pdpOwnerPasswordFromSecret-prod" --profile prod`
3. **Configure the OpenID Connect provider**: We are using OpenID Connect to authenticate the Github Actions with AWS,
  so that we can deploy the application from Github Actions to AWS. 
  The following steps shows how the AWS administrator can configure it in AWS using the cdk deployment we created.
  * Install NodeJS
  * Install AWS CDK `npm install -g aws-cdk`
  * Install Typescript `npm install -g typescript`
  * clone this repository
  * `cd cdk-infra/admin-init-infra/cdk-init-oidc`
  * `npm install`
  * `npm run build`
  * `cdk bootstrap --profile <env>` (note: run this for both nonprod and prod environment)
  * `cdk deploy --profile <env>` (note: run this for both nonprod and prod environment)

Note: please let the application developers know the AWS account numbers for nonprod and prod, 
so that we can set them in the Github secrets.
