const recorder = require('watchtower-recorder');

const botConfig = JSON.parse(require('fs').readFileSync('./src/config.json'));
const resultsTableName = botConfig.botName + botConfig.dynamoDb.suffixResultsTable;


// Loading modules that fail when required via vm2
const aws = require('aws-sdk');

const getProxyConditions = [];
const putProxyConditions = [
    {
	cond: (target, thisArg, argumentsList) => argumentsList[0].TableName === resultsTableName,
	opInSucc: (argumentsList) => (response) => {
            eventPublisher({name: "CHECKED_TARGET", params: {target_uuid: argumentsList[0].Item.uuid}},
			   lambdaExecutionContext);
	},
    },
];
const deleteProxyConditions = [];
const queryProxyConditions = [];

const mock = {
    'aws-sdk' : recorder.createDDBDocClientMock(getProxyConditions, putProxyConditions, deleteProxyConditions, queryProxyConditions),
};

module.exports.handler = recorder.createRecordingHandler('src/pingbot-health-checker.js', 'handler', mock, false);
