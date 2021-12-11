// global, for html page
http = require('http');

response_long_poll_state = require("../response-long-poll-state.js");

module.exports = {

	"response_long_poll_state()/state-change": function (done) {
		if (typeof window !== "undefined") throw "disable for browser";

		//http server
		var getState = function (userKey) { return "ok" };		//user-define state-callback

		var server = http.createServer((req, res) => {
			response_long_poll_state(res, getState);
		});
		server.listen();

		setTimeout(() => { response_long_poll_state.defaultEventEmitter.emit("state-change") }, 3000);
		console.log("wait 3s to get result")

		//http client
		var tm0 = new Date();

		http.get(
			"http://127.0.0.1:" + server.address().port,
			function (res) {
				var str = '';
				res.on('data', (chunk) => { str += chunk; });
				res.on('end', () => {
					console.log(str);
					console.log("tm=" + ((new Date()) - tm0));
					server.close();
					done(!(str === "//\nok"));
				});
			}
		);
	},

	"response_long_poll_state()/finish/short pulse": function (done) {
		if (typeof window !== "undefined") throw "disable for browser";

		//http server
		var getState = function (userKey) { return "ok" };		//user-define state-callback

		var server = http.createServer((req, res) => {
			response_long_poll_state(res, getState,
				{
					ACTIVE_PULSE_SECONDS: 1,		//default 20 seconds
					ACTIVE_PULSE_SECONDS_DELAY: 2,		//default 35 seconds
					ACTIVE_PULSE_MAX_COUNT: 3		//default 1000 times
				});
		});
		server.listen();

		console.log("wait 3s to get result")

		//http client
		var tm0 = new Date();

		http.get(
			"http://127.0.0.1:" + server.address().port,
			function (res) {
				var str = '';
				res.on('data', (chunk) => { str += chunk; });
				res.on('end', () => {
					console.log(str);
					console.log("tm=" + ((new Date()) - tm0));
					server.close();
					done(!(str === ("//" + "///" + "\nok")));
				});
			}
		);
	},

	".getCurrent()": function (done) {
		if (typeof window !== "undefined") throw "disable for browser";

		//http server
		var getState = function (userKey) { return {ret:"ok"} };		//user-define state-callback

		var server = http.createServer((req, res) => {
			//get current state instantly.
			//getCurrent(res, stateStringCallback, options)
			response_long_poll_state.getCurrent(res, getState);
		});
		server.listen();

		//http client
		var tm0 = new Date();

		http.get(
			"http://127.0.0.1:" + server.address().port,
			function (res) {
				var str = '';
				res.on('data', (chunk) => { str += chunk; });
				res.on('end', () => {
					console.log(str);
					console.log("tm=" + ((new Date()) - tm0));
					server.close();
					done(!(str === '//\n{"ret":"ok"}'));
				});
			}
		);
	},

	".getCurrent()/format string": function (done) {
		if (typeof window !== "undefined") throw "disable for browser";

		var server = http.createServer((req, res) => {
			//a string as `stateStringCallback`
			response_long_poll_state.getCurrent(res, "check");
		});
		server.listen();

		//http client
		var tm0 = new Date();

		http.get(
			"http://127.0.0.1:" + server.address().port,
			function (res) {
				var str = '';
				res.on('data', (chunk) => { str += chunk; });
				res.on('end', () => {
					console.log(str);
					console.log("tm=" + ((new Date()) - tm0));
					server.close();
					done(!(str === "//\ncheck"));
				});
			}
		);
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('mocha-test', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
