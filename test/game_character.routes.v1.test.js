process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should();
const mongoose = require('mongoose');
var GameCharacter = require('../model/game_character.model');
const char = new GameCharacter({name: 'TestCharacter', bio: 'TestBio'});

chai.use(chaiHttp);
//test command mocha moet mogelijk eerst 1-2 keer lopen na 1e keer downloaden voordat de tests goed verlopen vanwege de before en after hooks

describe('Create character', () => {
    before((next) => {
        char.save()
            .then(() => {
                next();
            })
    })


    describe('/GET characters', () => {
        it('it should return all characters', (done) => {
            chai.request(server)
                .get('/api/v1/characters')
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('name').equal('TestCharacter');
                    res.body[0].should.have.property('bio').equal('TestBio');
                    done();
                });
        });
        it('it should return a specific character', (done) => {
            chai.request(server)
                .get('/api/v1/characters/' + char._id)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name').equal('TestCharacter');
                    res.body.should.have.property('bio').equal('TestBio');
                    done();
                });
        });

    });
    describe('/POST characters', () => {
        it('it should post a new character and return it', (done) => {
            var developer = {
                _name: 'TestCharacter2',
                _bio: 'Bio2',
            };
            console.log(developer);
            chai.request(server)
                .post('/api/v1/characters')
                .send(developer)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name').equal('TestCharacter2');
                    res.body.should.have.property('bio').equal('Bio2');
                    done();
                });
        });

    });
    describe('/PUT characters', () => {
        var character = {
            _name: 'EditedCharName',
            _bio: 'EditedBio'
        };
        it('it should edit a character and return it', (done) => {
            chai.request(server)
                .get('/api/v1/characters')
                .end((err, res) => {
                    // console.log(res.body);
                    console.log('response ' + res.body[0]._id);
                    chai.request(server)
                        .put('/api/v1/characters/' + char._id)
                        .send(character)
                        .end((err, response) => {
                            console.log('name' + response.body.name);
                            response.should.have.status(200);
                            response.body.should.be.a('object');
                            response.body.should.have.property('message').equal('character updated');
                            done();
                        });
                })

        });
    });
    describe('/DELETE characters', () => {
        it('it should delete a character', (done) => {
            chai.request(server)
                .get('/api/v1/characters')
                .end((err, res) => {
                    // console.log(res.body);
                    chai.request(server)
                        .delete('/api/v1/characters/' + char._id)
                        .end((err, response) => {
                            // console.log(res.body);
                            response.should.have.status(200);
                            response.body.should.be.a('object');
                            response.body.should.have.property('message').equal('Character removed');
                            done();
                        });
                })

        });
    });
    after((done => {
        const { game_characters } = mongoose.connection.collections;
        game_characters.drop(() => {
            done();
        });
    }))

});