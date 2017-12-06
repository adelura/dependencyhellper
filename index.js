#!/usr/bin/env node

var q = require("q");
var inquirer = require("inquirer");
var program = require('commander');
var exec = require('child-process-promise').exec;
var utils = require('./lib/utils');

program.version('0.1.0');

program
    .option('-r --replace', 'Replace with original packages (npm install)')
    .option('-a --all', 'Unlink all linked packages');

program
    .command('list')
    .description('Show all linked packages in your project')
    .action(function () {
        let linkedModules = utils.findSymLinks('./node_modules');

        if (linkedModules === null) {
            console.log(`It looks like it's not a valid npm package - couldn't find node_modules directory here`);
            return;
        }

        console.log('Currently linked packages to this one\n');
        console.log('  ' + linkedModules.join('\n  '));
    });

program
    .command('link')
    .description('Link chosen packages from available ones')
    .action(function () {
        utils.getGloballyLinkedPackages().then(function (globalLinkedModules) {
            inquirer.prompt({
                message: 'Which package you want to link?',
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
    .description('Unlink chosen packages from already linked ones')
    .action(function () {
        utils.getLocallyLinkedPackages()
            .then(function (linkedPackages) {
                if (program.all) {
                    return q.resolve(linkedPackages);
                } else {
                    return askForPackagesToUnlink(linkedPackages);
                }
            })
            .then(function (packages) {
                if (packages.length == 0) {
                    return;
                }

                return q.all(packages.map(function (module) {
                    return exec('npm unlink ' + module);
                })).then(function () {
                    return packages;
                });
            })
            .then(function (packages) {
                if (!program.replace) {
                    return;
                }

                return q.all(packages.map(function (module) {
                    return exec('npm install ' + module);
                }));

                console.log('ddd', packages);
            })
    });

program
    .command('reset')
    .description('Unlink all linked packages and replace with original ones (npm install)')
    .action(function () {
        return exec('dh unlink --all --replace');
    });

program.parse(process.argv);

function askForPackagesToUnlink(linkedPackages) {
    var deferred = q.defer();

    inquirer.prompt({
        message: 'Which package you want to unlink?',
        type: 'checkbox',
        name: 'packages',
        choices: linkedPackages
    }, function (answer) {
        return deferred.resolve(answer.packages);
    });

    return deferred.promise;
}
