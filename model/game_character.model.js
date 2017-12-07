const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameCharacterSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    bio: String
});

const GameCharacter = mongoose.model('game_character', GameCharacterSchema);

module.exports = GameCharacter;