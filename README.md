# response-long-poll-state
http response tool for long polling state

# Install
```
npm install response-long-poll-state
```

# Usage & Api
```javascript

//http server
var http = require('http');
var response_long_poll_state = require("response-long-poll-state");

var getState = function () { return "ok" };		//user-define state-callback

var server = http.createServer((req, res) => {
	//longPollingState(res, stateStringCallback, options)
	response_long_poll_state(res, getState);
});
server.listen();
setTimeout(() => { 
	response_long_poll_state.defaultEventEmitter.emit("state-change")	//emit state-change event
}, 3000);

//http client
http.get(
	"http://127.0.0.1:" + server.address().port,
	function (res) {
		var str = '';
		res.on('data', (chunk) => { str += chunk; });
		res.on('end', () => {
			console.log(str);
			/*
				str === "//\nok"	// "//" + (n pulses times of "/") + "\n" + "state-string"
			*/
		});
	}
);

```
