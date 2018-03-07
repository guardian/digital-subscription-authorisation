const AWS = require('aws-sdk')
const moment = require('moment')

AWS.config.update({
    region: "eu-west-1"
})

const stages = ['CODE', 'PROD', 'DEV']
let stage = stages.find((stage) => {
    return stage === process.env.Stage
})
const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const dynamoTableName = `cas-auth-${stage}`

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

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false
    }
    return true
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
    if (isEmpty(dynamoResponse)) {
        return null //todo what's a nice way of doing something like options in js ?
    } else {
        return dynamoResponse.Item.expiryDate.S
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

async function asyncHandler(input) {
    console.log("Starting digital subscription authorisation lambda...")
    if (!stage) {
        throw new Error(`invalid stage ${process.env.Stage}, please check the stage env variable. Allowed values: ${stages}`)
    }
    console.log(`using table ${dynamoTableName}`)
    let json = JSON.parse(input.body)
    let appId = json.appId
    let deviceId = json.deviceId
    console.log(`getting expiry from dynamo for appId: ${appId} deviceId: ${deviceId}`)
    let expiryFromDynamo = await getExpiryFromDynamo(appId, deviceId)
    if (expiryFromDynamo) {
        console.log(`returning expiry from dynamo: ${expiryFromDynamo} for appId: ${appId} deviceId: ${deviceId}`)
        return getResponse(expiryFromDynamo)
    } else {
        console.log(`expiry not found in dynamo for appId: ${appId} deviceId: ${deviceId}, putting new item`)
        let newExpiry = moment().add(1, 'week').format('YYYY-MM-DD')
        let TTLTimestamp = moment().add(1, 'year').unix().toString()
        await  setInDynamo(appId, deviceId, newExpiry, TTLTimestamp)
        console.log(`returning new expiry  ${newExpiry} for appId: ${appId} deviceId: ${deviceId}`)
        return getResponse(newExpiry)
    }
}

exports.handler = function (input, context, callback) {

    asyncHandler(input).then(res => callback(null, res)).catch(e => {
        console.log("error: " + e)
        callback(e)
    })
}