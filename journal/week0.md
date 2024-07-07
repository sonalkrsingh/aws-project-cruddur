# Week 0 — Billing and Architecture

Set up an IAM account role with admin username &pass

Set up an budget alert fo 0$ as doing for a free tier

Setting up gitpod aws cli, configuring the account settings

echo $PATH--> This Echo the path variables path added in the linux 

To set env variables
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_DEFAULT_REGION=""

TO list environment variable : env

To set gitpod ENV variable
gp env AWS_ACCOUNT_ID

--AWS Budgets

Created a budget via CLI commands

aws sts get-caller-identity --query Account --output text --> to get the caller Identity

aws budgets create-budget \
    --account-id $ACCOUNT_ID \
    --budget file://aws/JSON/budget.json \
    --notifications-with-subscribers file://aws/JSON/notifications-with-subscribers.json

Created the SNS topic via CLI

    aws sns create-topic --name billing-alarm
    aws sns subscribe \
    --topic-arn TopicARN \
    --protocol email \
    --notification-endpoint sonalkumar2790@email.com

Enabled Cloud watch for alarm monitoring (was enabled manually)

Cloud Security
    Safegurading the data , application & its services in the cloud from internal or external threat
