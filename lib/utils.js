var fs = require('fs');
var q = require('q');
var path = require('path');
var exec = require('child-process-promise').exec;

function findSymLinks(dirPath) {
    var subDirectories = fs.readdirSync(dirPath);
    var symLinks = [];

    subDirectories.forEach(function (subDirectory) {
        var stats = fs.lstatSync(dirPath + '/' + subDirectory);

        if (stats.isSymbolicLink()) {
            symLinks.push(subDirectory);
        }
    });

    return q.when(symLinks);
}

function getGlobalRootDir() {
    return exec('npm root -g').then(function (process) {
        return path.join(process.stdout.trim());
    });
}

function getLocalRootDir() {
    return exec('npm root').then(function (process) {
        console.log(path.join(process.stdout.trim()));
        return path.join(process.stdout.trim());
    });
}

function getGloballyLinkedPackages() {
    return getGlobalRootDir().then(findSymLinks);
}

function getLocallyLinkedPackages() {
    return getLocalRootDir().then(findSymLinks);
}

module.exports = {
    findSymLinks: findSymLinks,
    getGloballyLinkedPackages: getGloballyLinkedPackages,
    getLocallyLinkedPackages: getLocallyLinkedPackages
};