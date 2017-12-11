var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase("https://gamecentre-dev:b.w20HjhFm7cwL.8zTjRkBGIciQS8r6@hobby-dpdolclecffdgbkedbmcdial.dbs.graphenedb.com:24780");

module.exports = db;