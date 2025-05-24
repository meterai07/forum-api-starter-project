const { Pool } = require('pg');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
    const fakeIdGenerator = () => '123';
    let commentRepository;
    let mockPool;

    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
        };
        commentRepository = new CommentRepositoryPostgres(mockPool, fakeIdGenerator);
    });

    describe('addComment', () => {
        it('should persist and return comment correctly', async () => {
            const mockComment = { content: 'test content', threadId: 'thread-123' };
            const mockCredentials = 'user-123';
            const expectedResult = {
                id: 'comment-123',
                content: 'test content',
                owner: 'user-123',
            };

            mockPool.query.mockResolvedValue({ rows: [expectedResult] });

            const result = await commentRepository.addComment(mockComment, mockCredentials);
            expect(result).toEqual(expectedResult);
            expect(mockPool.query).toHaveBeenCalled();
        });

        it('should throw InvariantError when insert fails', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(
                commentRepository.addComment({ content: 'fail', threadId: 'thread-123' }, 'user-123')
            ).rejects.toThrow(InvariantError);
        });
    });

    describe('deleteCommentById', () => {
        it('should delete comment if owner matches', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ owner: 'user-123' }] }) // verify ownership
                .mockResolvedValueOnce({ rows: [{ id: 'comment-123' }] }); // delete comment

            await expect(commentRepository.deleteCommentById('comment-123', 'user-123')).resolves.not.toThrow();
        });

        it('should throw NotFoundError if comment not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            await expect(commentRepository.deleteCommentById('comment-404', 'user-123')).rejects.toThrow(NotFoundError);
        });

        it('should throw AuthorizationError if user is not the owner', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ owner: 'user-999' }] });

            await expect(commentRepository.deleteCommentById('comment-123', 'user-123')).rejects.toThrow(AuthorizationError);
        });
    });

    describe('getCommentById', () => {
        it('should return comment by ID', async () => {
            const expected = { id: 'comment-123', content: 'abc', date: 'today', owner: 'user-1' };
            mockPool.query.mockResolvedValue({ rows: [expected] });

            const result = await commentRepository.getCommentById('comment-123');
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundError if comment does not exist', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(commentRepository.getCommentById('non-existent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('addReplyComment', () => {
        it('should persist and return reply correctly', async () => {
            const mockReply = { content: 'reply', commentId: 'comment-123' };
            const expectedResult = {
                id: 'reply-123',
                content: 'reply',
                owner: 'user-123',
            };

            mockPool.query.mockResolvedValue({ rows: [expectedResult] });

            const result = await commentRepository.addReplyComment(mockReply, 'user-123');
            expect(result).toEqual(expectedResult);
        });

        it('should throw InvariantError if insert fails', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(
                commentRepository.addReplyComment({ content: 'fail', commentId: 'comment-123' }, 'user-123')
            ).rejects.toThrow(InvariantError);
        });
    });

    describe('getReplyCommentById', () => {
        it('should return reply by ID', async () => {
            const expected = { id: 'reply-123', content: 'reply', date: 'today', owner: 'user-1' };
            mockPool.query.mockResolvedValue({ rows: [expected] });

            const result = await commentRepository.getReplyCommentById('reply-123');
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundError if reply does not exist', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(commentRepository.getReplyCommentById('non-existent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('verifyReplyCommentOwner', () => {
        it('should not throw if owner matches', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ owner: 'user-123' }] });

            await expect(commentRepository.verifyReplyCommentOwner('reply-123', 'user-123')).resolves.not.toThrow();
        });

        it('should throw NotFoundError if reply does not exist', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(commentRepository.verifyReplyCommentOwner('non-existent', 'user-123')).rejects.toThrow(NotFoundError);
        });

        it('should throw AuthorizationError if owner does not match', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ owner: 'user-999' }] });

            await expect(commentRepository.verifyReplyCommentOwner('reply-123', 'user-123')).rejects.toThrow(AuthorizationError);
        });
    });

    describe('deleteReplyCommentById', () => {
        it('should delete reply comment', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'reply-123' }] });

            await expect(commentRepository.deleteReplyCommentById('reply-123')).resolves.not.toThrow();
        });

        it('should throw NotFoundError if reply does not exist', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            await expect(commentRepository.deleteReplyCommentById('non-existent')).rejects.toThrow(NotFoundError);
        });
    });
});
