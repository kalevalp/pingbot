'use strict'

const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const dynamodb = new AWS.DynamoDB.DocumentClient();

let botConfig;

exports.handler = async (event) => {
    botConfig = JSON.parse(require('fs').readFileSync('./src/config.json'));
    console.log(botConfig);
    console.log(event);
    const body = JSON.parse(event.body);

    const params = {
        TableName: botConfig.botName + botConfig.dynamoDb.suffixTargetsTable,
	Key: {
	    uuid: body.uuid,
	}
    }
    console.log(params);

    const resp = await dynamodb.delete(params).promise();

    return {
	statusCode: 200,
	headers: {
	    'Access-Control-Allow-Origin': '*',
	    'Access-Control-Allow-Credentials': true
	},
	body: JSON.stringify({resp}, null, 2),
    }
}
