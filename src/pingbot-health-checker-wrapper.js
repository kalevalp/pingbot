const recorder = require('watchtower-recorder');
const eventsStreamName = process.env['WATCHTOWER_EVENT_KINESIS_STREAM'];
const eventPublisher = recorder.createEventPublisher(eventsStreamName);

const botConfig = JSON.parse(require('fs').readFileSync('./src/config.json'));
const resultsTableName = botConfig.botName + botConfig.dynamoDb.suffixResultsTable;


// Loading modules that fail when required via vm2
const aws = require('aws-sdk');

let context;
let lambdaExecutionContext;
let lambdaInputEvent;
function updateContext(name, event, lambdaContext) {
    context = name;
    lambdaExecutionContext = lambdaContext;
    lambdaInputEvent = event;
}

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

module.exports.handler = recorder.createRecordingHandler('src/pingbot-health-checker.js', 'handler', mock, false, updateContext, true);
