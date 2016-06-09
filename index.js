#!/usr/bin/env node

var q = require("q");
var inquirer = require("inquirer");
var program = require('commander');
var exec = require('child-process-promise').exec;
var utils = require('./lib/utils');

program.version('0.1.0');

program
    .command('list')
    .description('Show all globally linked packages')
    .action(function () {
        utils.findSymLinks('./node_modules').then(function (linkedModules) {
            console.log('Currently linked packages to this one\n');
            console.log(linkedModules.join('\n'));
        });
    });

program
    .command('link')
    .description('Link chosen globally available packages')
    .action(function () {
        utils.getGloballyLinkedPackages().then(function (globalLinkedModules) {
            inquirer.prompt({
                message: 'Which repository you want to link?',
                type: 'checkbox',
                name: 'packages',
                choices: globalLinkedModules
            }, function (answer) {
                if (answer.packages.length == 0) {
                    return;
                }

                q.all(answer.packages.map(function (module) {
                    return exec('npm link ' + module);
                })).then(function () {
                    console.log('Successfully linked all packages');
                }).catch(function (err) {
                    console.log('Error', err);
                });
            });
        });
    });

program
    .command('unlink')
    .description('Unlink chosen from already linked packages')
    .action(function () {
        utils.getLocallyLinkedPackages().then(function (linkedPackages) {
            inquirer.prompt({
                message: 'Which repository you want to unlink?',
                type: 'checkbox',
                name: 'packages',
                choices: linkedPackages
            }, function (answer) {
                if (answer.packages.length == 0) {
                    return;
                }

                q.all(answer.packages.map(function (module) {
                    return exec('npm unlink ' + module);
                })).then(function () {
                    console.log('done');
                }).catch(function (err) {
                    console.log('Error', err);
                });
            });
        });
    });

program.parse(process.argv);