const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    const mockPool = {
        query: jest.fn(),
    };
    const mockIdGenerator = jest.fn(() => '123');

    const repository = new ThreadRepositoryPostgres(mockPool, mockIdGenerator);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addThread', () => {
        it('should persist thread and return it correctly', async () => {
            const newThread = { title: 'A Title', body: 'Some content' };
            const credentials = 'user-1';

            mockPool.query.mockResolvedValue({
                rows: [{ id: 'thread-123', title: 'A Title', owner: 'user-1' }],
            });

            const result = await repository.addThread(newThread, credentials);

            expect(mockIdGenerator).toHaveBeenCalled();
            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('INSERT INTO threads'),
                values: expect.arrayContaining(['thread-123', 'A Title', 'Some content', expect.any(String), 'user-1']),
            }));
            expect(result).toEqual({ id: 'thread-123', title: 'A Title', owner: 'user-1' });
        });

        it('should throw InvariantError when insert fails', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(repository.addThread({ title: 'fail', body: 'fail' }, 'user-1'))
                .rejects
                .toThrow(InvariantError);
        });
    });

    describe('getThreadById', () => {
        it('should return thread, comments, and replies correctly', async () => {
            const threadId = 'thread-123';

            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: threadId, title: 'T', body: 'B', date: '2022', username: 'user1' }] }) // thread
                .mockResolvedValueOnce({ rows: [{ id: 'comment-1', content: 'c', date: '2022', is_deleted: false, thread_id: threadId, username: 'user2' }] }) // comments
                .mockResolvedValueOnce({ rows: [{ id: 'reply-1', content: 'r', date: '2022', is_deleted: false, comment_id: 'comment-1', username: 'user3' }] }); // replies

            const result = await repository.getThreadById(threadId);

            expect(mockPool.query).toHaveBeenCalledTimes(3);
            expect(result.thread.id).toEqual(threadId);
            expect(result.comments).toHaveLength(1);
            expect(result.replies).toHaveLength(1);
        });

        it('should throw NotFoundError when thread is not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            await expect(repository.getThreadById('unknown')).rejects.toThrow(NotFoundError);
        });
    });

    describe('verifyThreadAvailability', () => {
        it('should not throw error if thread exists', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'thread-123' }] });

            await expect(repository.verifyThreadAvailability('thread-123')).resolves.not.toThrow();
        });

        it('should throw NotFoundError if thread does not exist', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            await expect(repository.verifyThreadAvailability('not-found')).rejects.toThrow(NotFoundError);
        });
    });
});
