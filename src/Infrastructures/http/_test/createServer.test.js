const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('HTTP server', () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_KEY = 'super_secret_key_for_test';
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should response 401 when accessing protected endpoint with invalid token', async () => {
    const server = await createServer({});
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'Judul', body: 'Isi thread' },
      headers: {
        Authorization: 'Bearer invalidtoken',
      },
    });
    expect(response.statusCode).toBe(401);
  });

  it('should response 401 when accessing protected endpoint without token', async () => {
    const server = await createServer({});
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'Judul', body: 'Isi thread' },
    });
    expect(response.statusCode).toBe(401);
  });
});
