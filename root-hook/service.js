// Optional Home-button / boot hook for the tvOS launcher (rooted TVs only).
// No Luna service registration — uses luna-send. Reversible.
var fs = require('fs');
var {execFile} = require('child_process');

var APP_ID = process.env.TVOS_APP_ID || 'io.github.ebattistini.tvos-launcher';
var HOME_CODE = 773;
var EV_KEY = 1;
var EVENT_SIZE = 16;
var LOG = '/tmp/tvos-home-svc.log';
var ARGS = process.argv.slice(2);

function log(msg) {
	try { fs.appendFileSync(LOG, '[' + Date.now() + '] ' + msg + '\n'); } catch (e) {}
}

try { fs.writeFileSync('/tmp/tvos-home-svc.pid', String(process.pid)); } catch (e) {}
log('start pid=' + process.pid + ' args=[' + ARGS.join(' ') + ']');

var launching = false;
function launchApp(reason) {
	if (launching) return;
	launching = true;
	setTimeout(function () { launching = false; }, 1000);
	execFile('luna-send', ['-n', '1', 'luna://com.webos.applicationManager/launch', JSON.stringify({id: APP_ID})], function (err, stdout, stderr) {
		log('launch ' + reason + ': ' + String(stdout || stderr || err || '').trim());
	});
}

function bootLaunch(attempt) {
	attempt = attempt || 1;
	execFile('luna-send', ['-n', '1', 'luna://com.webos.applicationManager/launch', JSON.stringify({id: APP_ID})], function (err, stdout) {
		var out = String(stdout || '');
		var ok = out.indexOf('"returnValue":true') !== -1 || out.indexOf('"returnValue": true') !== -1;
		log('bootLaunch #' + attempt + ': ' + out.trim());
		if (!ok && attempt < 30) setTimeout(function () { bootLaunch(attempt + 1); }, 2000);
	});
}

function watchAll() {
	var files;
	try {
		files = fs.readdirSync('/dev/input').filter(function (f) { return f.indexOf('event') === 0; });
	} catch (e) {
		log('readdir: ' + e.message);
		return;
	}
	var fds = [];
	files.forEach(function (f) {
		try {
			fds.push(fs.openSync('/dev/input/' + f, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK));
		} catch (e) {}
	});
	log('watching ' + fds.length + ' devices HOME_CODE=' + HOME_CODE);
	var buf = Buffer.alloc(EVENT_SIZE * 64);
	setInterval(function () {
		for (var i = 0; i < fds.length; i++) {
			var bytes = 0;
			try { bytes = fs.readSync(fds[i], buf, 0, buf.length, null); } catch (e) { continue; }
			for (var off = 0; off + EVENT_SIZE <= bytes; off += EVENT_SIZE) {
				if (buf.readUInt16LE(off + 8) === EV_KEY && buf.readUInt16LE(off + 10) === HOME_CODE && buf.readInt32LE(off + 12) === 1) {
					launchApp('home-key');
				}
			}
		}
	}, 20);
}

var lastBeat = Date.now();
setInterval(function () {
	var now = Date.now();
	if (now - lastBeat > 15000) {
		log('wake gap ' + (now - lastBeat) + 'ms');
		launchApp('wake');
	}
	lastBeat = now;
}, 1000);

if (ARGS.indexOf('--boot') !== -1) bootLaunch(1);
if (ARGS.indexOf('--watch') !== -1) watchAll();
