'use strict';

var Q = require('q'),
    path = require('path'),
    spawn = require('child_process').spawn,
    isWindows = require('os').platform().indexOf('win') === 0,
    mbPath = process.env.MB_EXECUTABLE || path.normalize(__dirname + '/../bin/mb');

function create (port) {

    function mbServer (command, options) {
        var deferred = Q.defer(),
            calledDone = false,
            mbOptions = [command, '--port', port, '--pidfile', 'test.pid'].concat(options || []),
            mb;

        if (isWindows) {
            mbOptions.unshift(mbPath);
            mb = spawn('node', mbOptions);
        }
        else {
            mb = spawn(mbPath, mbOptions);
        }

        ['stdout', 'stderr'].forEach(function (stream) {
            mb[stream].on('data', function () {
                if (!calledDone) {
                    calledDone = true;
                    deferred.resolve();
                }
            });
        });
        return deferred.promise;
    }

    return {
        port: port,
        start: function (options) { return mbServer('restart', options); },
        stop: function () { return mbServer('stop'); }
    };
}

module.exports = {
    create: create
};