const recorder = require('watchtower-recorder');
const eventsStreamName = process.env['WATCHTOWER_EVENT_KINESIS_STREAM'];
const eventPublisher = recorder.createEventPublisher(eventsStreamName);
const debug = process.env.DEBUG_WATCHTOWER;

const botConfig = JSON.parse(require('fs').readFileSync('./src/config.json'));
const targetsTableName = botConfig.botName + botConfig.dynamoDb.suffixTargetsTable;

const getProxyConditions = [];
const putProxyConditions = [];
const deleteProxyConditions = [
    {
	cond: (target, thisArg, argumentsList) => argumentsList[0].TableName === targetsTableName,
	opInSucc: (argumentsList) => (response) => {
            eventPublisher({name: "REMOVED_TARGET", params: {target_uuid: argumentsList[0].Key.uuid}},
			   lambdaExecutionContext);
	},
    },
];
const queryProxyConditions = [];

const mock = {
    'aws-sdk' : recorder.createDDBDocClientMock(getProxyConditions, putProxyConditions, deleteProxyConditions, queryProxyConditions),
};

module.exports.handler = recorder.createRecordingHandler('src/pingbot-remove-url.js', 'handler', mock, false, () => {});
