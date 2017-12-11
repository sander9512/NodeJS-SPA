var express = require('express');
var routes = express.Router();
var Game = require('../model/game.model');
var GameCharacter = require('../model/game_character.model');
var neo4j = require('../config/neo4j.db');
var session = neo4j.session();

routes.get('/games', function (req, res) {
    Game.find({})
        .populate('gameCharacters')
        .then((games) => {
            res.status(200).json(games);
        })
        .catch((error) => {
            res.status(400).json(error);
        })
});

routes.get('/games/:id', function (req, res) {
    Game.findOne({'_id': req.params.id})
        .populate('gameCharacters')
        .then((game) => {
            res.status(200).json(game);
        })
        .catch((error) => {
            res.status(400).json(error);
        })
});

routes.post('/games', function (req, res) {
    const gameProps = req.body;
    Game.create(gameProps)
        .then(game => {
            game.save();
            res.send(game)
        })
        .catch((error) => {
        res.status(400).json(error)
        })
});

routes.delete('/games/:id', function (req, res) {
    Game.findOne({'_id': req.params.id})
        .then((game) => {
            game.remove()
                .then(() => {
                    res.status(200).json('game removed');
                })
        })
});

routes.delete('/games/:title/neo', function (req, res) {
    res.contentType('application/json');
    console.log(req.headers);
    const title = req.params.title;
    session
        .run("MATCH(:Developer)<-[c:CREATED_BY]-(game :Game {title: {titleParam}})<-[i:IS_IN]-(char :Character)"
        + " DELETE c, game, i, char", {titleParam: title})
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record);
            });
            res.status(200).json({message: 'deleted succesfully'});
            session.close();
        })
        .catch(function (error) {
            res.status(400).json(error);
            console.log(error);
        })
});

routes.put('/games/:id/characters', function (req, res) {
    const charProps = req.body;
    const char = new GameCharacter({ 'name': charProps._name, 'bio': charProps._bio});
    Game.findOne({'_id': req.params.id})
        .then((game) => {
            game.gameCharacters.push(char);
            Promise.all([char.save(), game.save()])
                .then(() => {
                    res.send(game);
                })
        })
});
routes.put('/games/:title/characters/neo', function (req, res) {
    const title = req.params.title;
    const name = req.body._name;
    const bio = req.body._bio;

    session
        .run("CREATE (character :Character { name: {nameParam}, bio: {bioParam}})"
            + " WITH character"
            + " MATCH(game :Game{title: {titleParam}})"
            + " CREATE (character)-[b:IS_IN]->(game)"
            + " RETURN game", {titleParam: title, nameParam: name, bioParam: bio})
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

routes.put('/games/:id', function (req, res) {
    const gameProps = req.body;
    const editedGame = {'title': gameProps._title, 'release_date': gameProps._release_date, 'description': gameProps._description};
    console.log(editedGame);
    Game.findByIdAndUpdate({'_id': req.params.id}, editedGame)
        .then((game) => {
            res.send(game);
        })
        .catch(error => {
            res.send(error);
            console.log(error);
        })
});

routes.put('/games/:title/neo', function (req, res) {
    res.contentType('application/json');
    const title = req.params.title;
    const newTitle = req.body._title;
    const newRelease = req.body._release_date;
    const newDesc = req.body._description;
    session
        .run("MATCH (game :Game {title: {titleParam}})"
            + " SET game.title = {newTitleParam}, game.release_date = {releaseParam}, game.description = {descParam}"
            + " RETURN game", {titleParam: title, newTitleParam: newTitle, releaseParam: newRelease, descParam: newDesc})
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

routes.delete('/games/:id/characters/:charId', function (req, res) {
    console.log(req.params);
    Game.findOne({'_id': req.params.id})
        .then((game) => {
            var idx = game.gameCharacters.indexOf(req.params.charId);
            console.log(idx);
            game.gameCharacters.splice(idx, 1);
            game.save()
                .then(() => {
                    GameCharacter.findByIdAndRemove({'_id': req.params.charId})
                        .then(() => {
                            res.send(game);
                        })
                })
        });
});


module.exports = routes;