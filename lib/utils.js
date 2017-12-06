var fs = require('fs');
var q = require('q');
var path = require('path');
var exec = require('child-process-promise').exec;

function findSymLinks(dirPath) {
    var subDirectories;

    try {
        subDirectories = fs.readdirSync(dirPath);
    } catch (e) {
        return q.when(null);
    }
    var symLinks = [];

    subDirectories.forEach(function (subDirectory) {
        if (subDirectory.startsWith('@')) {
            let nestedSymLinks = findSymLinks(path.join(dirPath, subDirectory));

            nestedSymLinks = nestedSymLinks.map(symLink => `${subDirectory}/${symLink}`);

            symLinks.push(nestedSymLinks);
        }

        var stats = fs.lstatSync(path.join(dirPath, subDirectory));

        if (stats.isSymbolicLink()) {
            symLinks.push(subDirectory);
        }
    });

    return symLinks;
}

function getGlobalRootDir() {
    return exec('npm root -g').then(function (process) {
        return path.join(process.stdout.trim());
    });
}

function getLocalRootDir() {
    return exec('npm root').then(function (process) {
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