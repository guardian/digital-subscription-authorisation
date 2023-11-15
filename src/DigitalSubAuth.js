const AWS = require('aws-sdk')
const moment = require('moment')
const stages = ['CODE', 'PROD', 'DEV']

let stage = stages.find((stage) => {
    return stage === process.env.Stage
})
const dynamo = new AWS.DynamoDB()
const dynamoTableName = `daily-edition-trial-periods-${stage}`

async function setInDynamo(appId, deviceId, expiry, TTL) {
    const params = {
        TableName: dynamoTableName,
        Item: {
            "appId": {"S": appId},
            "deviceId": {"S": deviceId},
            "expiryDate": {"S": expiry},
            "ttlTimestamp": {"N": TTL}
        }
    }
    await dynamo.putItem(params).promise()
}

async function getExpiryFromDynamo(appId, deviceId) {
    const params = {
        TableName: dynamoTableName,
        AttributesToGet: ["expiryDate"],
        Key: {
            "appId": {"S": appId},
            "deviceId": {"S": deviceId}
        }
    }
    let dynamoResponse = await dynamo.getItem(params).promise()
    if (dynamoResponse.Item) {
        let dynamoDate = moment(dynamoResponse.Item.expiryDate.S, 'YYYY-MM-DD')
        if (!dynamoDate.isValid()) {
            throw new Error(`invalid date format in dynamo table ${dynamoTableName} : '${dynamoResponse.Item.expiryDate.S}'`)
        }
        return dynamoDate.format('YYYY-MM-DD')
    } else {
        return null
    }
}

function getResponse(expiryDate) {
    var responseBody = {
        expiry: {
            expiryType: 'free',
            provider: "default",
            expiryDate: expiryDate
        }
    }
    var response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    }
    return response
}

function getMissingParamsResponse() {
    var responseBody = {
        error: {
        message: "Mandatory data missing from request",
        code: -50
        }
    }
    var response = {
        statusCode: 400,
        body: JSON.stringify(responseBody)
    }
    return response
}

async function asyncHandler(input) {
    console.log("This lambda is no longer used")
    return {statusCode: 404}
    // console.log("Starting digital subscription authorisation lambda...")
    // if (!stage) {
    //     throw new Error(`invalid stage ${process.env.Stage}, please check the stage env variable. Allowed values: ${stages}`)
    // }
    // console.log(`using table ${dynamoTableName}`)
    // let json = JSON.parse(input.body)
    // let appId = json.appId
    // let deviceId = json.deviceId
    // if (!appId || !deviceId) {
    //     return getMissingParamsResponse()
    // }
    // console.log(`getting expiry from dynamo for appId: ${appId} deviceId: ${deviceId}`)
    // let expiryFromDynamo = await getExpiryFromDynamo(appId, deviceId)
    // if (expiryFromDynamo) {
    //     console.log(`returning expiry from dynamo: ${expiryFromDynamo} for appId: ${appId} deviceId: ${deviceId}`)
    //     return getResponse(expiryFromDynamo)
    // } else {
    //     console.log(`expiry not found in dynamo for appId: ${appId} deviceId: ${deviceId}, putting new item`)
    //     let newExpiry = moment().add(2, 'week').format('YYYY-MM-DD')
    //     let TTLTimestamp = moment().add(1, 'year').unix().toString()
    //     await  setInDynamo(appId, deviceId, newExpiry, TTLTimestamp)
    //     console.log(`returning new expiry  ${newExpiry} for appId: ${appId} deviceId: ${deviceId}`)
    //     return getResponse(newExpiry)
    // }
}

exports.handler = function (input, context, callback) {
    asyncHandler(input).then(res => callback(null, res)).catch(e => {
        console.log("error: " + e)
        callback(e)
    })
}