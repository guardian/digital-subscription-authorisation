# digital-subscription-authorisation

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
