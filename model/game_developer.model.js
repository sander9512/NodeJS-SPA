const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortId = require('shortid');


const GameDeveloperSchema = new Schema({
    shortId: {type: String, unique: true, default: shortId.generate},
    name: {
        type: String,
        required: [true, 'A name is required']
    },
    location: String,
    companyDescription: String,
    games: [{
        type: Schema.Types.ObjectId,
        ref: 'game'
    }]
});

GameDeveloperSchema.pre('remove', function (next) {
    const Game = mongoose.model('game');
    console.log('pre remove triggered on developer');
    Game.remove({ _id: { $in: this.games}})
        .then(() => next())
});

const GameDeveloper = mongoose.model('game_developer', GameDeveloperSchema);

module.exports = GameDeveloper;