// How come we re-require chai const for each page -- seems like wasted space?
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

// Start off with describe recipes
describe('Recipes', function() {

  // Before going further, promise to runSever before going further into the test
  before(function() {
    return runServer();
  });

  // After the test is run, be sure to close it down
  after(function() {
    return closeServer();
  });

  // Describe it for GET
  it('should list items on GET', function() {
    
    // Why is this returning something here? 
    return chai.request(app)
      // get recipes through chai, then give a 200 response
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(3);
        const expectedKeys = ['name', 'ingrediants'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  // Describe it for POST
  it('should add an item on POST', function() {
    const newItem = {name: 'coffee', ingredients: ['coffee', 'cream', 'sugar']};
    // Here's that return again...?
    return chai.request(app)
      // run post recipes through chai
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        // Don't understand this bit
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });
  
  // Describe it for PUT
  it('should update items on PUT', function() {
    // The PUT update Data to be entered, correct?
    const updateData = {
      name: 'foo',
      checked: true
    };

    return chai.request(app)
      // Why do we need to get an idea of the object to update? Isn't that already known?
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        // this will return a promise whose value will be the response
        // object, which we can inspect in the next `then` back. Note
        // that we could have used a nested callback here instead of
        // returning a promise and chaining with `then`, but we find
        // this approach cleaner and easier to read and reason about.
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      // Don't understand why this is needed. Haven't we already updated our data?
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });
  });

  // Describe it for DELETE
  it('should delete items on DELETE', function() {
    return chai.request(app)
      // Shouldn't we already know the id from the URL?
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});