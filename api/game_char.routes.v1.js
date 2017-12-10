var express = require('express');
var routes = express.Router();
var GameCharacter = require('../model/game_character.model')

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

routes.delete('/characters/:id', function (req, res) {
    GameCharacter.findOne({'_id': req.params.id})
        .then((character) => {
            character.remove()
                .then(() => {
                    res.send('Character removed')
                })
        })
});

module.exports = routes;