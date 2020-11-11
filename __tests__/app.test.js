require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns todos', async() => {

      const expectation = [
        {
          'id': 1,
          'todo': 'wash the dishes',
          'completed': false,
          'owner_id': 1
        },  
        {
          'id': 2,
          'todo': 'clean the bathroom',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 3,
          'todo': 'fold the laundry',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 4,
          'todo': 'take out the trash',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 5,
          'todo': 'stretch',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 6,
          'todo': 'do my homework',
          'completed': false,
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns single todo for one user', async() => {

      const expectation = 
        {
          'id': 7,
          'todo': 'wash the dishes',
          'completed': false,
          'owner_id': 2
        };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send({
          'todo': 'wash the dishes',
          'completed': false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('updates single todo for one user', async() => {

      const expectation = [
        {
          'id': 7,
          'todo': 'wash the dishes',
          'completed': true,
          'owner_id': 2
        }];

      const data = await fakeRequest(app)
        .put('/api/todos/7')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
