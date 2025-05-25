const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const Reply = require('../../../Domains/replies/entities/Reply');

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
                new Reply({
                    id: 'reply-1',
                    content: 'first reply',
                    date: '2023-01-01T00:00:00Z',
                    isDeleted: false,
                    commentId: 'comment-1',
                    username: 'userA',
                }),
                new Reply({
                    id: 'reply-2',
                    content: 'second reply',
                    date: '2023-01-01T00:01:00Z',
                    isDeleted: true,
                    commentId: 'comment-2',
                    username: 'userB',
                }),
            ];

            mockPool.query.mockResolvedValue({
                rows: fakeReplies.map(r => ({
                    id: r.id,
                    content: r.content,
                    date: r.date,
                    is_deleted: r.isDeleted,
                    comment_id: r.commentId,
                    username: r.username,
                })),
            });

            const result = await replyRepository.getRepliesByThreadId(threadId);

            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('SELECT replies.id'),
                values: [threadId],
            }));

            expect(result).toEqual(
                fakeReplies.map(r => expect.objectContaining({
                    id: r.id,
                    content: r.content,
                    date: r.date,
                    is_deleted: r.isDeleted,
                    comment_id: r.commentId,
                    username: r.username,
                }))
            );
        });
    });
});
