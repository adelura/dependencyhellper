#!/usr/bin/env node

var q = require("q");
var path = require('path');
var inquirer = require("inquirer");
var program = require('commander');
var exec = require('child-process-promise').exec;
var utils = require('./lib/utils');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

program.version('0.1.0');

program
    .command('list')
    .description('Show all globally linked packages')
    .action(function () {
        var linkedModules = utils.findSymLinks('./node_modules');

        console.log('Currently linked modules to this one\n');
        console.log(linkedModules.join('\n'));
    });

program
    .command('link')
    .description('Link chosen globally available modules')
    .action(function () {
        var globalLinkedModules = utils.findSymLinks(path.join(home, '/AppData/Roaming/npm/node_modules'));

        inquirer.prompt({
            message: 'Which repository you want to link?',
            type: 'checkbox',
            name: 'modules',
            choices: globalLinkedModules
        }, function (answer) {
            if (answer.modules.length == 0) {
                return;
            }

            q.all(answer.modules.map(function (module) {
                return exec('npm link ' + module);
            })).then(function () {
                console.log('done');
            }).catch(function (err) {
                console.log('err', err);
            });
        });
    });

program
    .command('unlink')
    .description('Unlink already linked modules')
    .action(function () {
        var linkedModules = utils.findSymLinks('./node_modules');

        inquirer.prompt({
            message: 'Which repository you want to unlink?',
            type: 'checkbox',
            name: 'modules',
            choices: linkedModules
        }, function (answer) {
            if (answer.modules.length == 0) {
                return;
            }

            q.all(answer.modules.map(function (module) {
                return exec('npm unlink ' + module);
            })).then(function () {
                console.log('done');
            }).catch(function (err) {
                console.log('err', err);
            });
        });
    });

program.parse(process.argv);