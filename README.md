# digital-subscription-authorisation

This repo provides the api gateway infrastructure for the Content Authorisation Service (CAS). There are two endpoints defined 
- `/auth` used to support free trials for the Daily edition app - the lambda which supports this is defined in this repo in the file DigitalSubAuth.js
- `/subs` which looks up a Zuora subscription from a subscription id to allow users with a print subscription access to the apps - the lambda which supports this is defined in [support-service-lambdas](https://github.com/guardian/support-service-lambdas/tree/5daf1b31f39af60cb2663ed64c0ace58eaf1a328/handlers/digital-subscription-expiry) 

The `/auth` endpoint is no longer needed as we no longer offer free trials for the daily edition so we should move the relevant api gateway infrastructure to support-service-lambdas and decommission this repo.

The full infrastructure for this is:

- CAS domain: content-auth.guardian.co.uk - managed through NS1 DNS 
- This CNames to Fastly (guardian.map.fastly.net.) which has an origin of digital-subscription-authorisation-prod.subscriptions.guardianapis.com
- That is a api gateway [custom domain name](https://eu-west-1.console.aws.amazon.com/apigateway/main/publish/domain-names?domain=digital-subscription-authorisation-prod.subscriptions.guardianapis.com&region=eu-west-1) which points to
[digital-sub-auth-handler-PROD api gateway API](https://eu-west-1.console.aws.amazon.com/apigateway/home?region=eu-west-1#/apis/klkk16peze/resources/noq8xxox02)

There are [Blazemeter tests for both endpoints](https://www.runscope.com/radar/f862w29p8z5f). I have disabled the one which calls the `/auth` endpoint to make sure that that was the only traffic it was receiving. When I'm sure I will delete it.



## Old docs beneath this point 

This service is lambda backed api gateway api that provides authorisation for [digital subscription](https://support.theguardian.com/uk/subscribe/digital) free trials.

## How does it work?

* Looks up trial period expiration dates `expiryDate` in `daily-edition-trial-periods-{STAGE}` DynamoDB table.
* If no item is found for a given `appId` and `deviceId` pair, then a new 14 day trial period is started by creating a new item in the table.
* No API key is necessary on the POST request since `expiryDate` for given `(appId, deviceId)` pair cannot be modified after creation, that is, when it expires then it expires for good.

## How to test in CODE?

Hitting

```
POST /CODE/auth HTTP/1.1
Host: {api-gateway-url-code}
Content-Type: application/json

{
  "appId": "12",
  "deviceId": "43"
}
```
should respond with something like

```
{
    "expiry": {
        "expiryType": "free",
        "provider": "default",
        "expiryDate": "2019-11-27"
    }
}
```

Double check table [`daily-edition-trial-periods-CODE`](https://eu-west-1.console.aws.amazon.com/dynamodb/home?region=eu-west-1#tables:selected=daily-edition-trial-periods-CODE;tab=items) contains the record.

## Running the lambda locally (FIXME: Out-of-date)

Since the lambda needs to access a dynamo table AWS credentials with permission to read/write to cas-auth-DEV need to be set in the environment.

to build the lambda :
``` 
1. nvm install 6.10 
2. nvm use 6.10
3. yarn
4. yarn dist
5. yarn install
6. yarn compile
````
To run the lambda use :
 ```
 yarn run:auth
 ``` 

This will use the configuration defined in package.json. By default it will use the **cas-code-DEV** table and the lambda input defined in ***test/input/event.json***
