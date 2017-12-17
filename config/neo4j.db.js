var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://hobby-dpdolclecffdgbkedbmcdial.dbs.graphenedb.com:24786", neo4j.auth.basic("gamecentre-dev", "b.w20HjhFm7cwL.8zTjRkBGIciQS8r6"));


module.exports = driver;