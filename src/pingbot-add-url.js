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
	Item: {uuid: uuidv4(),
	       displayName: body.desc,
	       protocol: "https",
	       host: body.host,
	       port: 443,
	       path: body.path,
	      },
    }
    console.log(params);

    const resp = await dynamodb.put(params).promise();
    // const resp = "Nothing"

    return {
	statusCode: 200,
	headers: {
	    'Access-Control-Allow-Origin': '*',
	    'Access-Control-Allow-Credentials': true
	},
	body: JSON.stringify({uuid: params.Item.uuid, resp}, null, 2),
    }
}
