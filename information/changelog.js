var Changelog = require('generate-changelog');
var Fs = require('fs');

return Changelog.generate({patch: false, repoUrl: 'https://github.com/goriunov/ClusterWS-Client-JS'})
    .then(function (changelog) {
        Fs.writeFileSync('./CHANGELOG1.md', changelog);
    });