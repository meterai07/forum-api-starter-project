const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    let threadRepository;
    let mockPool;
    let mockIdGenerator;

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        };
        mockIdGenerator = jest.fn().mockReturnValue('123');
        threadRepository = new ThreadRepositoryPostgres(mockPool, mockIdGenerator);
    });

    describe('addThread', () => {
        it('should add thread and return added thread data', async () => {
            const fakeDbResponse = {
                rows: [
                    { id: 'thread-123', title: 'title', owner: 'user-1' },
                ],
            };
            mockPool.query.mockResolvedValue(fakeDbResponse);

            const threadPayload = { title: 'title', body: 'body' };
            const owner = 'user-1';

            const result = await threadRepository.addThread(threadPayload, owner);

            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('INSERT INTO threads'),
                values: expect.arrayContaining(['thread-123', 'title', 'body', expect.any(String), owner]),
            }));
            expect(result).toEqual(fakeDbResponse.rows[0]);
        });

        it('should throw InvariantError if insertion fails', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            const threadPayload = { title: 'title', body: 'body' };
            const owner = 'user-1';

            await expect(threadRepository.addThread(threadPayload, owner))
                .rejects.toThrow(InvariantError);
        });
    });

    describe('getThreadById', () => {
        it('should return thread details when found', async () => {
            const fakeThread = {
                id: 'thread-123',
                title: 'thread title',
                body: 'thread body',
                date: '2023-01-01T00:00:00Z',
                username: 'userA',
            };
            mockPool.query.mockResolvedValue({ rows: [fakeThread] });

            const result = await threadRepository.getThreadById('thread-123');

            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('SELECT threads.id'),
                values: ['thread-123'],
            }));

            expect(result).toEqual(fakeThread);
        });

        it('should throw NotFoundError if thread not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(threadRepository.getThreadById('thread-123'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('verifyThreadAvailability', () => {
        it('should not throw error if thread exists', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'thread-123' }] });

            await expect(threadRepository.verifyThreadAvailability('thread-123'))
                .resolves.not.toThrow();
        });

        it('should throw NotFoundError if thread does not exist', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(threadRepository.verifyThreadAvailability('thread-123'))
                .rejects.toThrow(NotFoundError);
        });
    });
});
