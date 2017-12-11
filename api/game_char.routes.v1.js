var express = require('express');
var routes = express.Router();
var GameCharacter = require('../model/game_character.model');
var neo4j = require('../config/neo4j.db');
var session = neo4j.session();

routes.get('/characters', function (req, res) {
    GameCharacter.find({})
        .then((characters) => {
            res.status(200).json(characters);
        })
        .catch((error) => {
            res.status(400).json(error);
        })
});

routes.get('/characters/:id', function (req, res) {
    GameCharacter.findOne({'_id': req.params.id})
        .then((character) => {
            res.status(200).json(character);
        })
        .catch((error) => {
            res.status(400).json(error);
        })
});

routes.post('/characters', function (req, res) {
    const charProps = req.body;
    console.log('post reached');
    GameCharacter.create(charProps)
        .then(character => {
            character.save();
            res.send(character)
        })
        .catch((error) => {
            res.status(400).json(error)
        })
});

routes.put('/characters/:id', function (req, res) {
    const charProps = req.body;
    const editedChar = {'name': charProps._name, 'bio': charProps._bio};
    GameCharacter.findByIdAndUpdate({'_id': req.params.id}, editedChar)
        .then((character) => {
            res.send(character);
        })
});
routes.put('/characters/:name/neo', function (req, res) {
    res.contentType('application/json');
    const name = req.params.name;
    const newName = req.body._name;
    const newBio = req.body._bio;
    session
        .run("MATCH (char :Character {name: {nameParam}})"
            + " SET char.name = {newNameParam}, char.bio = {bioParam}"
            + " RETURN char", {nameParam: name, newNameParam: newName, bioParam: newBio})
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

routes.delete('/characters/:id', function (req, res) {
    GameCharacter.findOne({'_id': req.params.id})
        .then((character) => {
            character.remove()
                .then(() => {
                    res.send('Character removed')
                })
        })
});
routes.delete('/characters/:name/neo', function (req, res) {
    res.contentType('application/json');
    const name = req.params.name;
    session
        .run("MATCH(:Game)<-[i:IS_IN]-(char :Character {name: {nameParam}})"
            + " DELETE i, char", {nameParam: name})
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

module.exports = routes;