# Week 0 — Billing and Architecture

Set up an IAM account role with admin username &pass

Set up an budget alert fo 0$ as doing for a free tier

Setting up gitpod aws cli, configuring the account settings

echo $PATH--> This Echo the path variables path added in the linux 

To set env variables
```
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_DEFAULT_REGION=""
```

TO list environment variable : env

To set gitpod ENV variable
gp env AWS_ACCOUNT_ID

--AWS Budgets

Created a budget via CLI commands

aws sts get-caller-identity --query Account --output text --> to get the caller Identity

```
aws budgets create-budget \
    --account-id $ACCOUNT_ID \
    --budget file://aws/JSON/budget.json \
    --notifications-with-subscribers file://aws/JSON/notifications-with-subscribers.json
```
Created the SNS topic via CLI
```
    aws sns create-topic --name billing-alarm
    aws sns subscribe \
    --topic-arn TopicARN \
    --protocol email \
    --notification-endpoint sonalkumar2790@email.com
```
Enabled Cloud watch for alarm monitoring (was enabled manually)

Cloud Security:
    is Safegurading the data, application & its services in the cloud from internal or external threat

AWS Organisation Unit
Enables you to create & add AWS accounts in an organisation & manage adds policies, tags resoures with thier concerned departs.
    ex:- Standby & Active
            Standby--> Finance BU --> Shursti Finace head, shrusti@gmail.com

Cloud trail
    Creates a trail to log any & every activity for every AWS account in an organisation. IT stores the logs in an S3 activity for the management events. 
Can enable for the event like unusual API calls per second

- [Architecture of Application -Lucid.App](https://lucid.app/lucidchart/fbd6c6bd-ad1b-4d71-a520-b5d3e10fad33/edit?viewport_loc=-1143%2C-3704%2C4192%2C1955%2C0_0&invitationId=inv_4a703e12-0cc7-4e71-9882-d333a9972d9c)

# Marksdown Language Writting examples
- These
- are
- bullets
1. These
2. are
3. numerals pointers

Tables Example

| Hi | My | Name|
|---| --- | --- |
| is | Sonal Kumar | Singh|
