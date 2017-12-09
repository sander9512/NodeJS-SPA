var express = require('express');
var routes = express.Router();
var Game = require('../model/game.model');
var GameCharacter = require('../model/game_character.model');

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
                    res.send.json('Game removed')
                })
        })
});

routes.put('/games/:id/characters', function (req, res) {
    const charProps = req.body;
    const char = new GameCharacter({ name: charProps.name, bio: charProps.bio});
    Game.findOne({'_id': req.params.id})
        .then((game) => {
            game.gameCharacters.push(char);
            Promise.all([char.save(), game.save()])
                .then(() => {
                    res.send(game);
                })
        })
});

routes.put('/games/:id', function (req, res) {
    const gameProps = req.body;
    Game.findByIdAndUpdate({'_id': req.params.id}, gameProps)
        .then((game) => {
            res.send(game);
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