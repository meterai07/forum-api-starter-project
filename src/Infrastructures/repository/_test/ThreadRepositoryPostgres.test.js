const pool = require('../../../Infrastructures/database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres (integration)', () => {
    const fakeIdGenerator = () => '123';
    const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

    beforeEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
    });

    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addThread', () => {
        it('should persist new thread and return it correctly', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-abc', username: 'user1' });

            const newThread = {
                title: 'test thread',
                body: 'this is a test thread',
            };
            const owner = 'user-abc';

            const result = await threadRepository.addThread(newThread, owner);

            expect(result).toEqual({
                id: 'thread-123',
                title: 'test thread',
                owner: 'user-abc',
            });

            const persistedThread = await ThreadsTableTestHelper.findThreadById('thread-123');
            expect(persistedThread).toHaveLength(1);
            expect(persistedThread[0]).toEqual({
                id: 'thread-123',
                title: 'test thread',
                body: 'this is a test thread',
                date: expect.any(String),
                owner: 'user-abc',
            });
        });

        it('should throw InvariantError when database constraint is violated', async () => {
            const newThread = { title: 'judul', body: 'isi' };
            const nonExistentOwner = 'user-nonexistent';

            await expect(threadRepository.addThread(newThread, nonExistentOwner))
                .rejects
                .toThrow(InvariantError);
        });
    });

    describe('getThreadById', () => {
        it('should return thread details by id', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });

            const result = await threadRepository.getThreadById('thread-1');

            expect(result).toEqual({
                id: 'thread-1',
                title: 'title',
                body: 'body',
                date: expect.any(String),
                username: 'user1',
            });

            const persistedThread = await ThreadsTableTestHelper.findThreadById('thread-1');
            expect(persistedThread).toHaveLength(1);
            expect(persistedThread[0]).toEqual({
                id: 'thread-1',
                title: 'title',
                body: 'body',
                date: expect.any(String),
                owner: 'user-1',
            });
        });

        it('should throw NotFoundError when thread not found', async () => {
            await expect(threadRepository.getThreadById('non-existing-thread-id'))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('verifyThreadAvailability', () => {
        it('should not throw any error when thread exists', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });

            await expect(threadRepository.verifyThreadAvailability('thread-1'))
                .resolves
                .not
                .toThrow();
        });

        it('should throw NotFoundError when thread does not exist', async () => {
            await expect(threadRepository.verifyThreadAvailability('non-existing-thread-id'))
                .rejects
                .toThrow(NotFoundError);
        });
    });
});