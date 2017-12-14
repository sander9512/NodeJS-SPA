process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should();
const mongoose = require('mongoose');
var Game = require('../model/game.model');
const game = new Game({title: 'TestGame', release_date: '2017', description: 'GameDescription'});

chai.use(chaiHttp);
//test command mocha moet mogelijk eerst 1-2 keer lopen na 1e keer downloaden voordat de tests goed verlopen vanwege de before en after hooks

describe('Create game', () => {
    before((next) => {
        game.save()
            .then(() => {
                next();
            })
    })

    describe('/GET games', () => {
        it('it should return all games', (done) => {
            chai.request(server)
                .get('/api/v1/games')
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('title').equal('TestGame');
                    res.body[0].should.have.property('release_date').equal('2017');
                    done();
                });
        });
        it('it should return a specific game', (done) => {
            chai.request(server)
                .get('/api/v1/games/' + game._id)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('title').equal('TestGame');
                    res.body.should.have.property('release_date').equal('2017');
                    res.body.should.have.property('description').equal('GameDescription');
                    done();
                });
        });

    });
    describe('/POST games', () => {
        it('it should post a new game and return it', (done) => {
            var newgame = {
                _title: 'NewTestGame',
                _description: 'Description',
                _release_date: '2020'
            };
            console.log(newgame);
            chai.request(server)
                .post('/api/v1/games')
                .send(newgame)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('title').equal('NewTestGame');
                    res.body.should.have.property('release_date').equal('2020');
                    res.body.should.have.property('description').equal('Description');
                    done();
                });
        });

    });
    describe('/PUT games', () => {
        it('it should edit a game and return it', (done) => {
            chai.request(server)
                .get('/api/v1/games')
                .end((err, res) => {
                    // console.log(res.body);
                    chai.request(server)
                        .put('/api/v1/games/' + res.body[0]._id)
                        .send({_title: 'EditedGameTitle', _description: 'EditedDesc', _release_date: '2000'})
                        .end((err, response) => {
                            console.log(res.body);
                            response.should.have.status(200);
                            response.body.should.be.a('object');
                            response.body.should.have.property('title').equal('EditedGameTitle');
                            response.body.should.have.property('release_date').equal('2000');
                            response.body.should.have.property('description').equal('EditedDesc');
                            done();
                        });
                })

        });
        it('it should add a character to a game and return it', (done) => {
            chai.request(server)
                .put('/api/v1/games/' + game._id + '/characters')
                .send({_name: 'TestCharacter', _bio: 'CharacterBio'})
                .end((err, response) => {
                    // console.log(response.body);
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('gameCharacters').should.be.a('object');
                    done();
                });
        })

    });
    describe('/DELETE games', () => {
        it('it should delete a game', (done) => {
            chai.request(server)
                .get('/api/v1/games')
                .end((err, res) => {
                    // console.log(res.body);
                    chai.request(server)
                        .delete('/api/v1/games/' + game._id)
                        .end((err, response) => {
                            // console.log(res.body);
                            response.should.have.status(200);
                            response.body.should.be.a('object');
                            response.body.should.have.property('message').equal('game removed');
                            done();
                        });
                })

        });
    });

    //clear collection
    after((done => {
        const { games } = mongoose.connection.collections;
        games.drop(() => {
            done();
        });
    }))

});