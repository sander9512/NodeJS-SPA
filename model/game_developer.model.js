const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameDeveloperSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A name is required']
    },
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