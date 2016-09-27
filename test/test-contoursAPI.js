var request = require('supertest');
var server = require('../app.js');

describe('Contours API test', function() {

    describe('/lat/lon/nradial/rcamsl/erp/channel/field/curve/tv_or_fm', function(done) {
        it('should return contour based on lat, lon, nradial, rcamsl, erp, channel, field, curve, tv_or_fm', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('features');
                    done();
                });
        });
	
	    it('should not return contour if lat input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing lat');
                    done();
                });
        });
		
		it('should not return contour if lon input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing lon');
                    done();
                });
        });
		
		it('should not return contour if nradial input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing nradial');
                    done();
                });
        });
		
		it('should not return contour if rcamsl input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing rcamsl');
                    done();
                });
        });
		
		it('should not return contour if erp input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing erp');
                    done();
                });
        });
		
		it('should not return contour if field input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing field');
                    done();
                });
        });
		
		it('should not return contour if channel input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing channel');
                    done();
                });
        });
		
		it('should not return contour if curve input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing curve');
                    done();
                });
        });
		
		it('should not return contour if tv_or_fm input is missing', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('missing tv_or_fm');
                    done();
                });
        });
		
		it('should not return contour if lat value is invalid', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=xxx&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('invalid lat value');
                    done();
                });
        });
		
		it('should not return contour if lon value is invalid', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=xxx&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('invalid lon value');
                    done();
                });
        });
		
		it('should not return contour if nradial value is invalid', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=xxx&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('invalid nradial value');
                    done();
                });
        });
		
		it('should not return contour if rcamsl value is invalid', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=xxx&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('invalid rcamsl value');
                    done();
                });
        });
		
		it('should not return contour if erp value is invalid', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=xxx&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('invalid erp value');
                    done();
                });
        });
		
		it('should not return contour if channel value is invalid', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=xxx&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('invalid channel value');
                    done();
                });
        });
		
		it('channel can be omitted if tv_or_fm=tv', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&field=28&erp=52&curve=0&tv_or_fm=tv')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('features');
                    done();
                });
        });
		
		it('should not return contour if lat value is out of range [-90, 90]', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=99&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('lat value out of range');
                    done();
                });
        });
		
		it('should not return contour if lon value is out of range [-180, 180]', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-181&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('lon value out of range');
                    done();
                });
        });
		
		it('should not return contour if nradial value is out of range [3, 360]', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=2&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('nradial value out of range [3, 360]');
                    done();
                });
        });
		
		it('should not return contour if curve value is out of range [0, 2]', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=3&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('curve value out of range [0, 2]');
                    done();
                });
        });
		
		it('should not return contour if lat has more then 10 decimal places', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.1234567890123&lon=-77.07942&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('number of decimal places for lat is larger than 10');
                    done();
                });
        });
		
		it('should not return contour if lon has more then 10 decimal places', function(done) {
            this.timeout(10000);

            request(server)
                .get('/contours.json?lat=38.95039&lon=-77.1234567890123&src=ned_1&rcamsl=309&nradial=360&unit=m&channel=9&field=28&erp=52&curve=0&tv_or_fm=fm')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

					res.body.should.have.property('statusCode').be.equal('400');
                    res.body.should.have.property('statusMessage').be.equal('number of decimal places for lon is larger than 10');
                    done();
                });
        });

	});

});	


        