const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortId = require('shortid');

const GameCharacterSchema = new Schema({
    shortId: {type: String, unique: true, default: shortId.generate},
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    bio: String
});

const GameCharacter = mongoose.model('game_character', GameCharacterSchema);

module.exports = GameCharacter;