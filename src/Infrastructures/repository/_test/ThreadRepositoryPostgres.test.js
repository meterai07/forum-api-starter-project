const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    const fakeIdGenerator = () => '123';
    let threadRepository;
    let mockPool;

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        };
        threadRepository = new ThreadRepositoryPostgres(mockPool, fakeIdGenerator);
    });

    describe('addThread', () => {
        it('should persist and return thread correctly', async () => {
            const threadPayload = { title: 'Test Thread', body: 'Body content' };
            const expectedResult = {
                id: 'thread-123',
                title: 'Test Thread',
                owner: 'user-123',
            };

            mockPool.query.mockResolvedValue({ rows: [expectedResult] });

            const result = await threadRepository.addThread(threadPayload, 'user-123');
            expect(result).toEqual(expectedResult);
            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('INSERT INTO threads'),
                values: expect.arrayContaining([
                    'thread-123',
                    threadPayload.title,
                    threadPayload.body,
                    expect.any(String), // ISO date string
                    'user-123',
                ]),
            }));
        });

        it('should throw InvariantError if thread insertion fails', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(threadRepository.addThread({ title: 'x', body: 'y' }, 'user-123'))
                .rejects.toThrow(InvariantError);
        });
    });

    describe('getThreadById', () => {
        it('should return structured thread with comments and replies', async () => {
            const threadId = 'thread-123';

            const threadQueryResult = {
                rows: [
                    {
                        thread_id: 'thread-123',
                        title: 'Sample Title',
                        body: 'Thread body',
                        date: '2021-08-01T00:00:00.000Z',
                        thread_owner: 'john_doe',
                        comment_id: 'comment-1',
                        comment_content: 'First comment',
                        comment_date: '2021-08-01T01:00:00.000Z',
                        comment_is_deleted: false,
                        comment_username: 'jane_doe',
                    },
                ],
            };

            const repliesQueryResult = {
                rows: [
                    {
                        reply_id: 'reply-1',
                        reply_content: 'Reply 1',
                        reply_date: '2021-08-01T02:00:00.000Z',
                        reply_is_deleted: false,
                        comment_id: 'comment-1',
                        reply_username: 'alice',
                    },
                ],
            };

            mockPool.query
                .mockResolvedValueOnce(threadQueryResult)
                .mockResolvedValueOnce(repliesQueryResult);

            const result = await threadRepository.getThreadById(threadId);

            expect(result).toEqual({
                id: 'thread-123',
                title: 'Sample Title',
                body: 'Thread body',
                date: '2021-08-01T00:00:00.000Z',
                username: 'john_doe',
                comments: [
                    {
                        id: 'comment-1',
                        content: 'First comment',
                        date: '2021-08-01T01:00:00.000Z',
                        username: 'jane_doe',
                        replies: [
                            {
                                id: 'reply-1',
                                content: 'Reply 1',
                                date: '2021-08-01T02:00:00.000Z',
                                username: 'alice',
                            },
                        ],
                    },
                ],
            });
        });

        it('should replace deleted comments and replies content with placeholder', async () => {
            const threadQueryResult = {
                rows: [
                    {
                        thread_id: 'thread-123',
                        title: 'Title',
                        body: 'Body',
                        date: '2021-08-01',
                        thread_owner: 'owner1',
                        comment_id: 'comment-1',
                        comment_content: 'Deleted comment',
                        comment_date: '2021-08-01',
                        comment_is_deleted: true,
                        comment_username: 'user1',
                    },
                ],
            };

            const repliesQueryResult = {
                rows: [
                    {
                        reply_id: 'reply-1',
                        reply_content: 'Deleted reply',
                        reply_date: '2021-08-01',
                        reply_is_deleted: true,
                        comment_id: 'comment-1',
                        reply_username: 'user2',
                    },
                ],
            };

            mockPool.query
                .mockResolvedValueOnce(threadQueryResult)
                .mockResolvedValueOnce(repliesQueryResult);

            const result = await threadRepository.getThreadById('thread-123');

            expect(result.comments[0].content).toBe('**komentar telah dihapus**');
            expect(result.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
        });

        it('should throw NotFoundError if thread does not exist', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            await expect(threadRepository.getThreadById('not-found-id')).rejects.toThrow(NotFoundError);
        });
    });
});
