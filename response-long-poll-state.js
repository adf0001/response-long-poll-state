
// response-long-poll-state @ npm, http response tool for long polling state

var EventEmitter = require('events');

var defaultEventEmitter = new EventEmitter();

var ACTIVE_PULSE_SECONDS = 20;
var ACTIVE_PULSE_SECONDS_DELAY = ACTIVE_PULSE_SECONDS + 15;	//add 15s

var ACTIVE_PULSE_MAX_COUNT = 1000;

/*
	options:
		.userKey						user-defined callback key
		.ACTIVE_PULSE_SECONDS			default 20 seconds
		.ACTIVE_PULSE_SECONDS_DELAY		default 35 seconds
		.ACTIVE_PULSE_MAX_COUNT			default 1000 times
		.eventEmitter					default global event emitter
*/
function longPollingState(res, stateStringCallback, options) {
	//options
	if (!options) options = {};
	options.ACTIVE_PULSE_SECONDS = options.ACTIVE_PULSE_SECONDS || ACTIVE_PULSE_SECONDS;
	options.ACTIVE_PULSE_SECONDS_DELAY = options.ACTIVE_PULSE_SECONDS_DELAY || ACTIVE_PULSE_SECONDS_DELAY;
	options.ACTIVE_PULSE_MAX_COUNT = options.ACTIVE_PULSE_MAX_COUNT || ACTIVE_PULSE_MAX_COUNT;
	//console.log(options);

	var eventEmitter = options.eventEmitter || defaultEventEmitter;

	//long polling
	console.log("state polling start");

	res.setHeader('Connection', "Keep-Alive");
	res.setHeader('Keep-Alive', "timeout=" + options.ACTIVE_PULSE_SECONDS_DELAY);
	res.writeHead(200, { "Content-type": "text/plain;charset=UTF-8" });
	res.write("/");

	var tmid = null, evtlistener = null;

	var finalCallback = function () {
		if (tmid) { clearTimeout(tmid); tmid = false; };
		if (evtlistener) { eventEmitter.removeListener("state-change", evtlistener); evtlistener = null; };
		if (!res.writableEnded) {
			try { res.end("\n" + stateStringCallback(options.userKey)); } catch (ex) { }
		}
		console.log("state polling finished");
	}


	//connection timeout
	res.setTimeout(options.ACTIVE_PULSE_SECONDS_DELAY * 1000, finalCallback);
	res.on('close', finalCallback);
	res.on('error', finalCallback);

	//keep live pulse
	var keepLiveCount = 0;

	var keepLiveTimer = function () {
		//console.log("keep live");
		if (!tmid && tmid !== null) return;	//timer has stopped
		if (res.writableEnded) return;		//end()

		res.write("/");
		//console.log("keep live write, " + (new Date()));

		if (++keepLiveCount > options.ACTIVE_PULSE_MAX_COUNT) { finalCallback(); return; }

		if (tmid) { clearTimeout(tmid); tmid = null; }
		tmid = setTimeout(keepLiveTimer, options.ACTIVE_PULSE_SECONDS * 1000);
	}

	keepLiveTimer();

	//listen change event

	evtlistener = finalCallback;
	eventEmitter.once("state-change", evtlistener);
}

function getCurrent(res, stateStringCallback, options) {
	var stateStr = (typeof stateStringCallback === "function")
		? stateStringCallback(options && options.userKey)
		: stateStringCallback;
	res.writeHead(200, { "Content-type": "text/plain;charset=UTF-8" });
	res.end("//\n" + stateStr);
}

//module

module.exports = exports = longPollingState;

exports.longPollingState = longPollingState;
exports.defaultEventEmitter = defaultEventEmitter;

exports.getCurrent = getCurrent;
