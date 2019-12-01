const recorder = require('watchtower-recorder');

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

const mock = {
    'aws-sdk' : aws,
};

module.exports.handler = recorder.createRecordingHandler('src/pingbot-slack-notifier.js', 'handler', mock, false, updateContext);
