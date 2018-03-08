# digital-subscription-authorisation

This service is lambda backed api gateway api that provides authorisation for digital subscription free trials.

## Operation

This simple application just looks up  trial period expiration dates in the ***cas-auth-[STAGE]*** table and returns them.

If no item is found for a giver user and device pair a new trial period is started by adding a new item to the table. 


## Running the lambda locally

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