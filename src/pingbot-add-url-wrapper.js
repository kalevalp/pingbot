const recorder = require('watchtower-recorder');
const eventsStreamName = process.env['WATCHTOWER_EVENT_KINESIS_STREAM'];
const eventPublisher = recorder.createEventPublisher(eventsStreamName);
const debug = process.env.DEBUG_WATCHTOWER;

const botConfig = JSON.parse(require('fs').readFileSync('./src/config.json'));
const targetsTableName = botConfig.botName + botConfig.dynamoDb.suffixTargetsTable;

const getProxyConditions = [];
const putProxyConditions = [
    {
	cond: (target, thisArg, argumentsList) => argumentsList[0].TableName === targetsTableName,
	opInSucc: (argumentsList) => (response) => {
            eventPublisher({name: "ADDED_TARGET", params: {target_uuid: argumentsList[0].Item.uuid}},
			   lambdaExecutionContext);
	},
    },
];
const deleteProxyConditions = [];
const queryProxyConditions = [];

const mock = {
    'aws-sdk' : recorder.createDDBDocClientMock(getProxyConditions, putProxyConditions, deleteProxyConditions, queryProxyConditions),
};

module.exports.handler = recorder.createRecordingHandler('src/pingbot-add-url.js', 'handler', mock, false);
