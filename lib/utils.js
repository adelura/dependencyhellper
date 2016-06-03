var fs = require('fs');

function findSymLinks(dirPath) {
    var subDirectories = fs.readdirSync(dirPath);
    var symLinks = [];

    subDirectories.forEach(function (subDirectory) {
        var stats = fs.lstatSync(dirPath + '/' + subDirectory);

        if (stats.isSymbolicLink()) {
            symLinks.push(subDirectory);
        }
    });

    return symLinks;
}

module.exports = {
    findSymLinks: findSymLinks
};