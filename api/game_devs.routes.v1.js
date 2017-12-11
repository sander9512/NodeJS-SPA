var express = require('express');
var neo4j = require('../config/neo4j.db');
var routes = express.Router();
const GameDeveloper = require('../model/game_developer.model');
const Game = require('../model/game.model');

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
    neo4j.cypher({
            query: 'CREATE (developer: Developer { name: $name, companyDescription: $companyDescription, location: $location})'
            + 'RETURN developer',
            params: { name: name, companyDescription: companyDescription, location: location}
        },
        function (err, result) {
            if(err) {
                res.status(401).json(err);
            } else {
                res.status(200).json({message: 'developer created'});
            }
        });
});

routes.put('/developers/:name/game/neo', function (req, res) {
   const name = req.params.name;
   const title = req.body._title;
   const release_date = req.body._release_date;
   const description = req.body._description;

   neo4j.cypher({
       query: 'CREATE (game: Game { title: $title, release_date: $release_date, description: $description})'
       + 'MATCH(developer :Developer{name: $name})'
       + 'CREATE (game)-[c:CREATED BY]->(developer'
       + 'RETURN developer',
       params: { title: title, release_date: release_date, description: description, name: name}
   }, function (err, result) {
       if(err) {
           res.status(400).json(err);
       } else {
           res.status(200).json({message: 'succes'});
       }
   });
});

routes.delete('/developers/:name/neo', function (req, res) {
    res.contentType('application/json');
    console.log(req.headers);
    const name = req.params.name;
    neo4j.cypher({
        query: 'MATCH (developer :Developer {name: $name})'
        + 'DETACH DELETE developer',
        params: { name: name }
    }, function (err, result) {
        if(err) {
            res.status(400).json(err);
        } else {
            res.status(200).json({message: 'developer ' + name + ' was deleted'});
        }
    }
    );
});

routes.put('/developers/:id/game', function (req, res) {
    const gameProps = req.body;
    const game = new Game({ 'title': gameProps._title, 'description': gameProps._description, 'release_date': gameProps._release_date, 'gameCharacters': gameProps.gameCharacters})
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
        .then((developer) => {
        res.send(developer);
        })
});

routes.delete('/developers/:id', function (req, res) {
    GameDeveloper.findOne({'_id': req.params.id})
        .then((developer) => {
        developer.remove()
            .then(() => {
            res.status(200).json('developer removed');
            })
        })
});

module.exports = routes;