const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
    let replyRepository;
    let mockPool;

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        };
        replyRepository = new ReplyRepositoryPostgres(mockPool);
    });

    describe('getRepliesByThreadId', () => {
        it('should execute correct SQL query and return the replies', async () => {
            const threadId = 'thread-123';
            const fakeReplies = [
                {
                    id: 'reply-1',
                    content: 'first reply',
                    date: '2023-01-01T00:00:00Z',
                    is_deleted: false,
                    comment_id: 'comment-1',
                    username: 'userA',
                },
                {
                    id: 'reply-2',
                    content: 'second reply',
                    date: '2023-01-01T00:01:00Z',
                    is_deleted: true,
                    comment_id: 'comment-2',
                    username: 'userB',
                },
            ];

            mockPool.query.mockResolvedValue({ rows: fakeReplies });

            const result = await replyRepository.getRepliesByThreadId(threadId);

            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('SELECT replies.id'),
                values: [threadId],
            }));

            expect(result).toEqual(fakeReplies);
        });
    });
});
