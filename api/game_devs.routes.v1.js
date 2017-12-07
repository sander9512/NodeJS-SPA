var express = require('express');
var routes = express.Router();
const GameDeveloper = require('../model/game_developer.model');
const Game = require('../model/game.model');

routes.get('/developers', function (req, res) {
    GameDeveloper.find({})
        .populate({
            path: 'games',
            populate: {
                path: 'game_characters',
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
                path: 'game_characters',
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

routes.post('/developers', function (req, res) {
    const developerProps = req.body;

    GameDeveloper.create(developerProps)
        .then(developer => {
            developer.save();
            res.send(developer)
        })
        .catch((error) => {
        res.status(400).json(error);
        });
});

routes.put('/developers/:id/game', function (req, res) {
    const gameProps = req.body;
    const game = new Game({ title: gameProps.title, description: gameProps.description, gameCharacters: gameProps.gameCharacters})
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
    GameDeveloper.findByIdAndUpdate({'_id': req.params.id}, developerProps)
        .then((developer) => {
        res.send(developer);
        })
});

routes.delete('/developers/:id', function (req, res) {
    GameDeveloper.findOne({'_id': req.params.id})
        .then((developer) => {
        developer.remove()
            .then(() => {
            res.send('Developer removed')
            })
        })
});

module.exports = routes;