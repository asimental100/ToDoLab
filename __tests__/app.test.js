require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  let token;

  const newChore = {
    id: 4,
    chore: 'sweep',
    completed: true,
    owner_id: 2,
  };

  beforeAll(async done => {
    execSync('npm run setup-db');

    client.connect();

    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });
    
    token = signInData.body.token;

    return done();
  });

  afterAll(done => {
    return client.end(done);
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns a new chore when creating new chore', async(done) => {

    const data = await fakeRequest(app)
      .post('/api/todos')
      .send(newChore)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(newChore);

    done();
  });

  test('returns all chores for the user when hitting GET /todos', async(done) => {
    const expected = [
      {
        id: 4,
        chore: 'sweep',
        completed: true,
        owner_id: 2
      }
    ];

    const data = await fakeRequest(app)
      .get('/api/todos')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expected);

    done();
  });

  test('returns a single chore for the user when hitting GET /todos/:id', async(done) => {
    const expected = {
      id: 4,
      chore: 'sweep',
      completed: true,
      owner_id: 2
    };

    const data = await fakeRequest(app)
      .get('/api/todos/4')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expected);

    done();
  });

  test('updates a single chore for the user when hitting PUT /todos/:id', async(done) => {
    const newChore = {
      id: 4,
      chore: 'sweep',
      completed: true,
      owner_id: 2
    };

    const expectedAllChores = [{
      id: 4,
      chore: 'sweep',
      completed: true,
      owner_id: 2
    }];

    const data = await fakeRequest(app)
      .put('/api/todos/4')
      .send(newChore)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    const allChores = await fakeRequest(app)
      .get('/api/todos')
      .send(newChore)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(newChore);
    expect(allChores.body).toEqual(expectedAllChores);

    done();
  });

});
