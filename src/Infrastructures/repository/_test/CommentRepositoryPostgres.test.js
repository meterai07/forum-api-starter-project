const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('CommentRepositoryPostgres', () => {
    const mockIdGenerator = () => '123';
    let commentRepository;
    let mockPool;

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        };
        commentRepository = new CommentRepositoryPostgres(mockPool, mockIdGenerator);
    });

    describe('addComment', () => {
        it('should persist new comment and return the added comment correctly', async () => {
            const newComment = {
                content: 'test comment',
                threadId: 'thread-123',
            };
            const owner = 'user-abc';

            mockPool.query.mockResolvedValue({
                rows: [{ id: 'comment-123', content: 'test comment', owner }],
            });

            const result = await commentRepository.addComment(newComment, owner);

            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('INSERT INTO comments'),
                values: ['comment-123', 'test comment', expect.any(String), 'thread-123', owner],
            }));

            expect(result).toEqual({ id: 'comment-123', content: 'test comment', owner });
        });

        it('should throw InvariantError when insert fails', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(
                commentRepository.addComment({ content: 'abc', threadId: 'thread-1' }, 'user-1')
            ).rejects.toThrow(InvariantError);
        });
    });

    describe('getCommentsByThreadId', () => {
        it('should call correct SQL and return all comments', async () => {
            mockPool.query.mockResolvedValue({
                rows: [
                    { id: 'comment-1', content: 'abc', date: '2023-01-01', is_deleted: false, thread_id: 'thread-1', username: 'user1' },
                ],
            });

            const result = await commentRepository.getCommentsByThreadId('thread-1');

            expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
                text: expect.stringContaining('SELECT comments.id'),
                values: ['thread-1'],
            }));

            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: 'comment-1', content: 'abc', username: 'user1' }),
            ]));
        });
    });
});
