const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikestableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres (integration)', () => {
    const fakeIdGenerator = () => '123';
    let commentRepository;

    beforeEach(async () => {
        commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await CommentLikesTableTestHelper.cleanTable();
    });

    afterEach(async () => {
        await CommentLikesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addComment', () => {
        it('should persist new comment and return it correctly', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-abc', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-abc' });

            const newComment = {
                content: 'test comment',
                threadId: 'thread-123',
            };
            const owner = 'user-abc';

            const result = await commentRepository.addComment(newComment, owner);

            expect(result).toEqual({
                id: 'comment-123',
                content: 'test comment',
                owner: 'user-abc',
            });

            const persistedComment = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(persistedComment).toHaveLength(1);
            expect(persistedComment[0]).toEqual({
                id: 'comment-123',
                content: 'test comment',
                date: expect.any(String),
                thread_id: 'thread-123',
                owner: 'user-abc',
                is_deleted: false,
                likes: 0,
            });
        });

        it('should throw InvariantError when thread does not exist', async () => {
            const newComment = {
                content: 'test comment',
                threadId: 'non-existent-thread',
            };
            const owner = 'user-abc';
            await expect(commentRepository.addComment(newComment, owner))
                .rejects.toThrow(InvariantError);
        });
    });

    describe('getCommentsByThreadId', () => {
        it('should return all comments related to the thread', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            const result = await commentRepository.getCommentsByThreadId('thread-1');

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'comment-1',
                        content: 'abc',
                        username: 'user1',
                        is_deleted: false,
                        likes: 0,
                        date: expect.any(String),
                    }),
                ])
            );
        });
    });

    describe('deleteCommentById', () => {
        it('should mark comment as deleted', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            await commentRepository.deleteCommentById('comment-1');

            const comment = await CommentsTableTestHelper.findCommentById('comment-1');
            expect(comment[0].is_deleted).toBe(true);
        });

        it('should throw NotFoundError when comment not found', async () => {
            await expect(commentRepository.deleteCommentById('non-existent-id'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('getCommentById', () => {
        it('should return comment by id', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            const result = await commentRepository.getCommentById('comment-1');

            expect(result).toEqual({
                id: 'comment-1',
                content: 'abc',
                date: '2023-01-01T00:00:00Z',
                owner: 'user-1',
            });
        });

        it('should throw NotFoundError when comment not found', async () => {
            await expect(commentRepository.getCommentById('non-existent-id'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('verifyCommentOwner', () => {
        it('should verify comment owner', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            const result = await commentRepository.verifyCommentOwner('comment-1', 'user-1');
            expect(result).toBe(true);
        });

        it('should throw NotFoundError when comment not found', async () => {
            await expect(commentRepository.verifyCommentOwner('non-existent-id', 'user-1'))
                .rejects.toThrow(NotFoundError);
        });

        it('should throw AuthorizationError when owner does not match', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            await expect(commentRepository.verifyCommentOwner('comment-1', 'user-2'))
                .rejects.toThrow(AuthorizationError);
        });
    });

    describe('verifyCommentAvailability', () => {
        it('should verify comment availability', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            await expect(commentRepository.verifyCommentAvailability('comment-1'))
                .resolves.not.toThrow();
        });

        it('should throw NotFoundError when comment not found', async () => {
            await expect(commentRepository.verifyCommentAvailability('non-existent-id'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('checkUserLikeStatus', () => {
        it('should return true when user has already liked the comment', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });
            await CommentLikesTableTestHelper.addLike({
                id: 'like-1',
                commentId: 'comment-1',
                owner: 'user-1',
            });

            const result = await commentRepository.checkUserLikeStatus('comment-1', 'user-1');

            expect(result).toBe(true);
        });

        it('should return false when user has not liked the comment', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });

            const result = await commentRepository.checkUserLikeStatus('comment-1', 'user-1');

            expect(result).toBe(false);
        });
    });

    describe('addLikeToComment', () => {
        it('should add like to comment and increment like count', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });

            const result = await commentRepository.addLikeToComment('comment-1', 'user-1');

            expect(result).toEqual({
                id: 'comment-1',
                likes: 1,
            });

            const comment = await CommentsTableTestHelper.findCommentById('comment-1');
            expect(comment[0].likes).toBe(1);

            const likes = await CommentLikesTableTestHelper.findLikesByCommentId('comment-1');
            expect(likes).toHaveLength(1);
            expect(likes[0]).toMatchObject({
                id: 'like-123',
                comment_id: 'comment-1',
                owner: 'user-1',
            });
        });

        it('should throw InvariantError when user already liked the comment', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });
            await CommentLikesTableTestHelper.addLike({
                id: 'like-1',
                commentId: 'comment-1',
                owner: 'user-1',
            });

            await expect(commentRepository.addLikeToComment('comment-1', 'user-1'))
                .rejects.toThrow(InvariantError);
        });

        it('should throw InvariantError when comment does not exist', async () => {
            await expect(commentRepository.addLikeToComment('non-existent-comment', 'user-1'))
                .rejects.toThrow(InvariantError);
        });
    });

    describe('removeLikeFromComment', () => {
        it('should remove like from comment and decrement like count', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });
            await CommentLikesTableTestHelper.addLike({
                id: 'like-1',
                commentId: 'comment-1',
                owner: 'user-1',
            });
            // Manually increment likes count in comment
            await pool.query('UPDATE comments SET likes = 1 WHERE id = $1', ['comment-1']);

            const result = await commentRepository.removeLikeFromComment('comment-1', 'user-1');

            expect(result).toEqual({
                id: 'comment-1',
                likes: 0,
            });

            const comment = await CommentsTableTestHelper.findCommentById('comment-1');
            expect(comment[0].likes).toBe(0);

            const likes = await CommentLikesTableTestHelper.findLikesByCommentId('comment-1');
            expect(likes).toHaveLength(0);
        });

        it('should throw InvariantError when user has not liked the comment', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });

            await expect(commentRepository.removeLikeFromComment('comment-1', 'user-1'))
                .rejects.toThrow(InvariantError);
        });

        it('should throw InvariantError when comment not found', async () => {
            await expect(commentRepository.removeLikeFromComment('non-existent-id', 'user-1'))
                .rejects.toThrow(InvariantError);
        });
    });

    describe('getCommentLikeCount', () => {
        it('should return correct like count for a comment', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user2' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });
            await CommentLikesTableTestHelper.addLike({
                id: 'like-1',
                commentId: 'comment-1',
                owner: 'user-1',
            });
            await CommentLikesTableTestHelper.addLike({
                id: 'like-2',
                commentId: 'comment-1',
                owner: 'user-2',
            });

            const result = await commentRepository.getCommentLikeCount('comment-1');

            expect(result).toBe(2);
        });

        it('should return 0 when comment has no likes', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                content: 'abc',
                threadId: 'thread-1',
                owner: 'user-1',
            });

            const result = await commentRepository.getCommentLikeCount('comment-1');

            expect(result).toBe(0);
        });
    });
});