// const mongoose = require('mongoose');
// const supertest = require('supertest');
// const app = require('../../server');
// const users = require('../../data/UserDao');
// const { hash } = require('../../utils/hash');
// const { createToken } = require('../../utils/token');

// const request = supertest(app);

// describe('Test /api/users', () => {
//   const user = {
//     name: 'testclient',
//     email: 'tclient@jhu.edu',
//     password: 'testclient',
//   };

//   beforeAll(async () => {
//     await mongoose.connect(global.__MONGO_URI__);

//     // Create user
//     user.doc = await users.create({
//       name: user.name,
//       email: user.email,
//       password: await hash(user.password),
//     });
//   });

//   describe('Test authentication endpoints', () => {
//     /* BEGIN LOGIN TESTS */
//     describe('Test user login', () => {
//       test('Return 400 when email is missing', async () => {
//         const res = await request
//           .post('/api/users/login')
//           .send({ password: user.password });
//         expect(res.status).toBe(400);
//       });

//       test('Return 400 when password is missing', async () => {
//         const res = await request
//           .post('/api/users/login')
//           .send({ email: user.email });
//         expect(res.status).toBe(400);
//       });

//       test('Return 401 when email is incorrect', async () => {
//         const res = await request
//           .post('/api/users/login')
//           .send({ email: 'oops@jhu.edu', password: user.password });
//         expect(res.status).toBe(401);
//       });

//       test('Return 401 when password is incorrect', async () => {
//         const res = await request
//           .post('/api/users/login')
//           .send({ email: user.email, password: 'oops' });
//         expect(res.status).toBe(401);
//       });

//       test('Return 200 when login is successful', async () => {
//         const res = await request
//           .post('/api/users/login')
//           .send({ email: user.email, password: user.password });
//         expect(res.body.token).toBeTruthy();
//       });

//       test('Return a JWT when login is successful', async () => {
//         const res = await request
//           .post('/api/users/login')
//           .send({ email: user.email, password: user.password });
//         expect(res.body.token).toBeTruthy();
//       });
//     });
//     /* END LOGIN TESTS */

//     /* BEGIN SIGNUP TESTS */
//     describe('Test /api/users/signup', () => {
//       const newClient = {
//         name: 'newclient',
//         email: 'newclient@jhu.edu',
//         password: 'newclient',
//       };

//       test('Return 200 when user is signed up', async () => {
//         const res = await request.post('/api/users/signup').send(newClient);
//         expect(res.status).toBe(200);
//       });

//       test('Return a JWT when signup is successful', async () => {
//         const res = await request.post('/api/users/signup').send({
//           name: 'newclient1',
//           email: 'newclient1@jhu.edu',
//           password: 'newclient1',
//         });
//         expect(res.body.token).toBeTruthy();
//       });

//       test('Return 400 when email is missing', async () => {
//         const res = await request
//           .post('/api/users/signup')
//           .send({ name: 'testclient', password: 'testclient' });
//         expect(res.status).toBe(400);
//       });

//       test('Return 400 when password is missing', async () => {
//         const res = await request
//           .post('/api/users/signup')
//           .send({ name: 'testclient', email: 'invalid@jhu.edu' });
//         expect(res.status).toBe(400);
//       });

//       test('Return 400 when name is missing', async () => {
//         const res = await request
//           .post('/api/users/signup')
//           .send({ password: 'testclient', email: 'invalid@jhu.edu' });
//         expect(res.status).toBe(400);
//       });

//       test('Return 400 when email already exists', async () => {
//         const res = await request.post('/api/users/signup').send({
//           name: 'newclient',
//           email: newClient.email,
//           password: 'testclient',
//         });
//         expect(res.status).toBe(400);
//       });
//     });
//     /* END SIGNUP TESTS */

//     /* BEGIN UPDATE PASSWORD TESTS */
//     describe('Test update user password', () => {
//       test('Return 401 when Bearer token is missing', async () => {});
//       test('Return 401 when old password is incorrect', async () => {});
//       test('Return 200 with valid Bearer token and correct old password', async () => {});
//       test(
//        'Updates user password with valid Bearer token and correct old password',
//        async () => {}
//       );
//     });
//     /* END UPDATE PASSWORD TESTS */
//   });

//   /* BEGIN USERS ENDPOINTS TESTS */
//   describe('Test users endpoints', () => {
//     const token = {};
//     beforeAll(async () => {
//       // Get sample user token
//       await createToken(user.doc, '5 days', (err, tok) => {
//         if (err) throw err;
//         token.valid = tok;
//       });
//     });
//     describe('Test PATCH /users/updateMe', () => {
//       test('Return 401 when Bearer token is missing', async () => {
//         const res = await request.patch('/api/users/updateMe').send({
//           phoneNumber: '(123)-456-7890',
//         });
//         expect(res.status).toBe(401);
//       });

//       test('Return 200 when Bearer token is included', async () => {
//         const res = await request
//           .patch('/api/users/updateMe')
//           .send({
//             phoneNumber: '(987)-654-3210',
//           })
//           .set('Authorization', `Bearer: ${token.valid}`);
//         expect(res.status).toBe(200);
//       });

//       test('Update user phone number then getting user gives updated information', async () => {
//         await request
//           .patch('/api/users/updateMe')
//           .send({
//             phoneNumber: '(987)-654-3210',
//           })
//           .set('Authorization', `Bearer: ${token.valid}`);
//         const res = await request
//           .get('/api/users/me')
//           .set('Authorization', `Bearer: ${token.valid}`);
//         expect(res.body.phoneNumber).toBe('(987)-654-3210');
//       });
//     });

//     describe('Test GET users', () => {
//       test('Return 401 when Bearer token is missing', async () => {
//         const res = await request.get('/api/users/me');
//         expect(res.status).toBe(401);
//       });

//       test('Return 200 when Bearer token is included', async () => {
//         const res = await request
//           .get('/api/users/me')
//           .set('Authorization', `Bearer: ${token.valid}`);
//         expect(res.status).toBe(200);
//       });

//       test('Return name and email with proper authentication', async () => {
//         const res = await request
//           .get('/api/users/me')
//           .set('Authorization', `Bearer: ${token.valid}`);
//         expect(res.body.name).toBe(user.name);
//         expect(res.body.email).toBe(user.email);
//       });
//     });
//   });
//   /* END USERS ENDPOINTS TESTS */

//   afterAll(async () => {
//     await mongoose.connection.close();
//   });
// });
