'use strict';

var fs          = require('fs');
var dir         = require('node-dir');
var archiver    = require('archiver');
var FtpClient   = require('ftp');
var moment      = require('moment');
var path        = require('path');
var proc        = require('child_process');

module.exports = function(options) {

    options = Object.assign({
        ftpConfig: '.ftp',
        url: '',
        directory: 'testpkg',
        destination: 'wwwtest/lppaczki',
        name: 'LP',
        dateFormat: 'YYYYMMDD_HHmmSS',
        password: 'nimda',
        zip: false
    }, options);

    var packageName = options.name + '_' + moment().format(options.dateFormat);
    var resultPath = path.join(options.destination, packageName);
    var ftpParams = JSON.parse(fs.readFileSync(options.ftpConfig, 'utf-8'));

    var ftp = new FtpClient();
    ftp.on('ready', function() {
        ftp.mkdir(resultPath, function(err) {
            if(err) throw err;
            console.log('FTP Deploying...');
            dir.readFilesStream(options.directory, function(err, stream, next) {
                if(err) throw err;

                var dirname = path.join(resultPath, path.dirname(stream.path));
                dirname = dirname.replace('/' + options.directory, '').replace('\\' + options.directory, '');
                var outputPath = path.join(dirname, path.basename(stream.path));

                ftp.mkdir(dirname, function() {
                    ftp.put(stream, outputPath, function(err) {
                        if(err) throw err;
                        next();
                    });
                });

                next();
            }, function() {
                if(!options.zip) {
                    ftp.end();
                }
            });
        });

        if(!options.zip) {
            return;
        }

        var zipfile = packageName + '.zip';

        console.log('Archive creating...');
        if(options.password) {

            proc.exec('zip --password ' + options.password + ' ' + zipfile + ' ' + options.directory + '/*',
                function(err, stdout, stderr) {
                    if(err) throw err;

                    ftp.put(zipfile, options.destination + '/' + zipfile, function(err) {
                        if(err) throw err;
                        ftp.end();
                        fs.unlinkSync(zipfile);
                    });
                });

        } else {
            var output = fs.createWriteStream(zipfile);
            var archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });

            archive.on('warning', function(err) {
                if (err.code === 'ENOENT') {
                    console.warn('Warning during packing: ' + JSON.stringify(err))
                } else {
                    // throw error
                    throw err;
                }
            });

            archive.on('error', function(err) {
                throw err;
            });

            output.on('close', function() {
                ftp.put(zipfile, options.destination + '/' + zipfile, function(err) {
                    if(err) throw err;
                    ftp.end();
                    fs.unlinkSync(zipfile);
                });
            });

            archive.pipe(output);

            archive.directory(options.directory);

            archive.finalize();
        }

    });

    ftp.on('end', function() {
        var host = options.url;
        if(host) {
            host += host.charAt(host.length-1) !== '/' ? '/' : '';
        }

        console.log('Demo: ' + host + resultPath);
        if(options.zip) {
            console.log('Paczka: ' + host + resultPath + '.zip');
            if(options.password) {
                console.log('Hasło: ' + options.password)
            }
        }

    });

    ftp.connect(ftpParams);


};
