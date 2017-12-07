const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortId = require('shortid');


const GameSchema = new Schema({
    shortId: {type: String, unique: true, default: shortId.generate},
    title: {
        type: String,
        required: [true, 'A game must have a title']
    },
    description: String,
    release_date: String,
    gameCharacters: [{
        type: Schema.Types.ObjectId,
        ref: 'game_character'
    }]
});

GameSchema.pre('remove', function (next) {
    const GameCharacter = mongoose.model('game_character');
    console.log('pre remove triggered on game');
    GameCharacter.remove({ _id: { $in: this.gameCharacters}})
        .then(() => next())
});
//
// GameSchema.post('remove', function (next) {
//     const GameDeveloper = mongoose.model('game_developer');
//     console.log('post remove triggered on game');
//     GameDeveloper.games.remove({ _id: this._id})
//         .then(() => next())
// });

const Game = mongoose.model('game', GameSchema);

module.exports = Game;