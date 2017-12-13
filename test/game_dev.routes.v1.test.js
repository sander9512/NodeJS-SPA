process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should();
const mongoose = require('mongoose');
var GameDeveloper = require('../model/game_developer.model');
const dev = new GameDeveloper({name: 'TestDeveloper', companyDescription: 'TestDescription', location: 'TestLocation'});

chai.use(chaiHttp);

    describe('Create developer', () => {
        before((next) => {
                    dev.save()
                        .then(() => {
                        next();
                        })
        })


        describe('/GET developers', () => {
            it('it should return all developers', (done) => {
                chai.request(server)
                    .get('/api/v1/developers')
                    .end((err, res) => {
                    // console.log(res.body);
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(1);
                        res.body[0].should.have.property('name').equal('TestDeveloper');
                        done();
                    });
            });

        });
        describe('/GET developer', () => {
            it('it should return a specific developer', (done) => {
                chai.request(server)
                    .get('/api/v1/developers/' + dev._id)
                    .end((err, res) => {
                        // console.log(res.body);
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('name').equal('TestDeveloper');
                        res.body.should.have.property('location').equal('TestLocation');
                        res.body.should.have.property('companyDescription').equal('TestDescription');
                        done();
                    });
            });

        });
        describe('/POST developers', () => {
            it('it should post a new developer and return it', (done) => {
                var developer = {
                    _name: 'TestDeveloper2',
                    _companyDescription: 'Description2',
                    _location: 'Testlocation2'
                };
                // console.log(developer);
                chai.request(server)
                    .post('/api/v1/developers')
                    .send(developer)
                    .end((err, res) => {
                        // console.log(res.body);
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('name').equal('TestDeveloper2');
                        done();
                    });
            });

        });
        describe('/PUT developers', () => {
            it('it should edit a developer and return it', (done) => {
                chai.request(server)
                    .get('/api/v1/developers')
                    .end((err, res) => {
                        // console.log(res.body);
                        chai.request(server)
                            .put('/api/v1/developers/' + res.body[0]._id)
                            .send({_name: 'EditedDeveloper', _companyDescription: 'EditedDesc', _location: 'EditedLoc'})
                            .end((err, response) => {
                                // console.log(res.body);
                                response.should.have.status(200);
                                response.body.should.be.a('object');
                                response.body.should.have.property('name').equal('EditedDeveloper');
                                response.body.should.have.property('location').equal('EditedLoc');
                                response.body.should.have.property('companyDescription').equal('EditedDesc');
                                done();
                            });
                    })

            });
            it('it should add a game to a developer and return it', (done) => {
                        chai.request(server)
                            .put('/api/v1/developers/' + dev._id + '/game')
                            .send({_title: 'TestGame', _release_date: '2017-12-12', _description: 'GameDescription'})
                            .end((err, response) => {
                                // console.log(response.body);
                                response.should.have.status(200);
                                response.body.should.be.a('object');
                                response.body.should.have.property('games').should.be.a('object');
                                done();
                            });
                    })

        });
        describe('/DELETE developers', () => {
            it('it should delete a developer', (done) => {
                chai.request(server)
                    .get('/api/v1/developers')
                    .end((err, res) => {
                        // console.log(res.body);
                        chai.request(server)
                            .delete('/api/v1/developers/' + dev._id)
                            .end((err, response) => {
                                // console.log(res.body);
                                response.should.have.status(200);
                                response.body.should.be.a('object');
                                response.body.should.have.property('message').equal('developer removed');
                                done();
                            });
                    })

            });
        });
        //clear collection
        after((done => {
            const { game_developers } = mongoose.connection.collections;
            game_developers.drop(() => {
                done();
            });
        }))

    });