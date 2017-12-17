var express = require('express');
var neo4j = require('../config/neo4j.db');
var routes = express.Router();
const GameDeveloper = require('../model/game_developer.model');
const Game = require('../model/game.model');
var session = neo4j.session();

routes.get('/developers', function (req, res) {
    GameDeveloper.find({})
        .populate({
            path: 'games',
            populate: {
                path: 'gameCharacters',
                model: 'game_character'
            }
        })
        .then((developers) => {
        res.status(200).json(developers);
        })
        .catch((error) => {
        res.status(400).json(error);
        })
});

routes.get('/developers/:id', function (req, res) {
    GameDeveloper.findOne({'_id': req.params.id})
        .populate({
            path: 'games',
            populate: {
                path: 'gameCharacters',
                model: 'game_character'
            }
        })
        .then((developer) => {
            res.status(200).json(developer);
        })
        .catch((error) => {
            res.status(400).json(error);
        })
});

routes.get('/developers/games/:gameId', function (req, res) {
    GameDeveloper.findOne({ 'games': { $eq: { '_id': req.params.gameId }}})
        .populate({
            path: 'games',
            populate: {
                path: 'gameCharacters',
                model: 'game_character'
            }
        })
        .then((developer) => {
        console.log(req.params);
        console.log(developer);
        res.status(200).json(developer);
        })
        .catch((error) => {
        res.status(400).json(error);
        })
});

routes.post('/developers', function (req, res) {
    console.log(req.body);
    const newDev = new GameDeveloper({ 'name': req.body._name,
        'companyDescription': req.body._companyDescription, 'location': req.body._location});
    GameDeveloper.create(newDev)
        .then(developer => {
            console.log(developer);
            developer.save();
            res.send(developer)
        })
        .catch((error) => {
        res.status(400).json(error);
        });
});

routes.post('/developers/neo', function (req, res) {
    const name = req.body._name;
    const companyDescription = req.body._companyDescription;
    const location = req.body._location;
    session.
        run("CREATE (developer :Developer { name: {nameParam}, companyDescription: {descParam}, location: {locationParam}})" + " RETURN developer",
        {nameParam: name, descParam: companyDescription, locationParam: location})
        .then(function (result) {
            result.records.forEach(function (record) {
                res.status(200).json(record)
            });
            session.close();
        })
        .catch(function (error) {
            res.status(400).json(error);
            console.log(error);
        })
});

routes.put('/developers/:name/game/neo', function (req, res) {
    const name = req.params.name;
    const title = req.body._title;
    const release_date = req.body._release_date;
    const description = req.body._description;
    const genres = req.body._genres;
    let query = "";
    console.log(genres.length);
    if(genres.length === 0) {
        console.log('executing query with no genres');
        query = "CREATE (game :Game { title: {titleParam}, release_date: {releaseParam}, description: {descParam}})"
            + " WITH game"
            + " MATCH(developer :Developer{name: {nameParam}})"
            + " CREATE (game)-[c:CREATED_BY]->(developer)"
            + " RETURN developer";
    }
    else if(genres.length === 1) {
        console.log('executing query with 1 genres');
        query = "CREATE (game :Game { title: {titleParam}, release_date: {releaseParam}, description: {descParam}})"
            + " WITH game"
            + " MATCH(developer :Developer{name: {nameParam}})"
            + " CREATE (game)-[c:CREATED_BY]->(developer)"
            + " WITH game"
            + " MATCH(genre :Genre{name: {genreParam1}})"
            + " WITH game, genre"
            + " CREATE (game)-[r:HAS_GENRE]->(genre)"
            + " RETURN game";
    }
    else if(genres.length === 2) {
        console.log('executing query with 2 genres');
        query = "CREATE (game :Game { title: {titleParam}, release_date: {releaseParam}, description: {descParam}})"
            + " WITH game"
            + " MATCH(developer :Developer{name: {nameParam}})"
            + " CREATE (game)-[c:CREATED_BY]->(developer)"
            + " WITH game"
            + " MATCH(genre :Genre{name: {genreParam1}})"
            + " CREATE (game)-[r:HAS_GENRE]->(genre)"
            + " WITH game"
            + " MATCH(genre2 :Genre{name: {genreParam2}})"
            + " CREATE (game)-[r2:HAS_GENRE]->(genre2)"
            + " RETURN game";
    }
    else if(genres.length === 3) {
        console.log('executing query with 3 genres');
        query = "CREATE (game :Game { title: {titleParam}, release_date: {releaseParam}, description: {descParam}})"
            + " WITH game"
            + " MATCH(developer :Developer{name: {nameParam}})"
            + " CREATE (game)-[c:CREATED_BY]->(developer)"
            + " WITH game"
            + " MATCH(genre :Genre{name: {genreParam1}})"
            + " CREATE (game)-[r:HAS_GENRE]->(genre)"
            + " WITH game"
            + " MATCH(genre2 :Genre{name: {genreParam2}})"
            + " CREATE (game)-[r2:HAS_GENRE]->(genre2)"
            + " WITH game"
            + " MATCH(genre3 :Genre{name: {genreParam3}})"
            + " CREATE (game)-[r3:HAS_GENRE]->(genre3)"
            + " RETURN game";
    }

    session
        .run(query, {titleParam: title, releaseParam: release_date, descParam: description, nameParam: name, genreParam1: genres[0], genreParam2: genres[1], genreParam3: genres[2]})
                .then(function (result) {
                    result.records.forEach(function (record) {
                        console.log(record);
                        res.status(200).json(record);
                    });
                    session.close();
                })
                .catch(function (error) {
                    console.log(error);
                })
});

routes.delete('/developers/:name/neo', function (req, res) {
    res.contentType('application/json');
    console.log(req.headers);
    const name = req.params.name;
    console.log('dev name =', name);
    session
        .run("MATCH(dev :Developer{name: {nameParam}})"
            + " OPTIONAL MATCH (dev)<-[c:CREATED_BY]-(game :Game)"
            + " OPTIONAL MATCH (game)<-[i:IS_IN]-(char :Character)"
            + " OPTIONAL MATCH (game)-[h:HAS_GENRE]->(:Genre)"
            + " DELETE dev, c, game, i, char, h"
            + " RETURN dev", {nameParam: name})
        .then(function (result) {
            console.log(result);
            result.records.forEach(function (record) {
                console.log(record);
                res.status(200).json({message: 'succesfully deleted'});
            });
            session.close();
        })
        .catch(function (error) {
            // res.status(400).json(error);
            console.log(error);
        })
});

routes.put('/developers/:id/game', function (req, res) {
    const gameProps = req.body;
    const game = new Game({ 'title': gameProps._title, 'description': gameProps._description, 'release_date': gameProps._release_date, 'genres': gameProps._genres})
    GameDeveloper.findOne({'_id': req.params.id})
        .then((developer) => {
        developer.games.push(game);
        Promise.all([game.save(), developer.save()])
            .then(() => {
            res.send(developer);
            })
        })
});
routes.delete('/developers/:id/game/:gameId', function (req, res) {
    console.log(req.params);
    GameDeveloper.findOne({'_id': req.params.id})
        .then((developer) => {
            var idx = developer.games.indexOf(req.params.gameId);
            console.log(idx);
            developer.games.splice(idx, 1);
            developer.save()
                .then(() => {
                    Game.findByIdAndRemove({'_id': req.params.gameId})
                        .then(() => {
                            res.send(developer);
                        })
                })
        });
});

routes.put('/developers/:id', function (req, res) {
    const developerProps = req.body;
    console.log(req.body);
    const editedDev = {'name': developerProps._name, 'location': developerProps._location,
    'companyDescription': developerProps._companyDescription};
    console.log(editedDev);
    GameDeveloper.findByIdAndUpdate({'_id': req.params.id}, editedDev)
        .then(() => {
        GameDeveloper.findOne({_id: req.params.id})
            .then((developer) => {
            res.send(developer);
            })
        })
});
routes.put('/developers/:name/neo', function (req, res) {
    res.contentType('application/json');
    const name = req.params.name;
    const newName = req.body._name;
    const newLoc = req.body._location;
    const newDesc = req.body._companyDescription;
    session
        .run("MATCH (dev :Developer {name: {nameParam}})"
            + " SET dev.name = {newNameParam}, dev.location = {locParam}, dev.companyDescription = {descParam}"
            + " RETURN dev", {nameParam: name, newNameParam: newName, locParam: newLoc, descParam: newDesc})
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record);
                res.status(200).json(result);
            });
            session.close();
        })
        .catch(function (error) {
            res.status(400).json(error);
            console.log(error);
        })
});

routes.delete('/developers/:id', function (req, res) {
    GameDeveloper.findOne({'_id': req.params.id})
        .then((developer) => {
        developer.remove()
            .then(() => {
            res.status(200).json({message:'developer removed'});
            })
        })
});

module.exports = routes;