const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres (integration)', () => {
    const fakeIdGenerator = () => '123';
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    beforeEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await RepliesTableTestHelper.cleanTable();
    });

    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('getRepliesByThreadId', () => {
        it('should return all replies related to the thread', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                threadId: 'thread-123',
                content: 'a comment',
                owner: 'user-2',
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-1',
                commentId: 'comment-1',
                content: 'first reply',
                owner: 'user-1',
                date: '2023-01-01T00:00:00Z',
                isDeleted: false,
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-2',
                commentId: 'comment-1',
                content: 'second reply',
                owner: 'user-2',
                date: '2023-01-01T00:01:00Z',
                isDeleted: true,
            });

            const result = await replyRepository.getRepliesByThreadId('thread-123');

            expect(result).toHaveLength(2);
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'reply-1',
                        content: 'first reply',
                        date: '2023-01-01T00:00:00Z',
                        is_deleted: false,
                        comment_id: 'comment-1',
                        username: 'userA',
                    }),
                    expect.objectContaining({
                        id: 'reply-2',
                        content: 'second reply',
                        date: '2023-01-01T00:01:00Z',
                        is_deleted: true,
                        comment_id: 'comment-1',
                        username: 'userB',
                    }),
                ])
            );
        });

        it('should return an empty array if no replies exist for the thread', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await ThreadsTableTestHelper.addThread({
                id: 'thread-123',
                owner: 'user-1',
            });
            const result = await replyRepository.getRepliesByThreadId('thread-123');
            expect(result).toEqual([]);
        });
    });

    describe('addReplyComment', () => {
        it('should persist reply and return it correctly', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                threadId: 'thread-123',
                content: 'a comment',
                owner: 'user-2',
            });

            const reply = {
                content: 'This is a reply',
                commentId: 'comment-1',
            };

            const result = await replyRepository.addReplyComment(reply, 'user-1');

            expect(result).toEqual({
                id: expect.stringMatching(/^reply-/),
                content: reply.content,
                owner: 'user-1',
            });

            const persistedReply = await RepliesTableTestHelper.findReplyById(result.id);
            expect(persistedReply).toHaveLength(1);
            expect(persistedReply[0]).toEqual({
                id: result.id,
                content: reply.content,
                date: expect.any(String),
                comment_id: 'comment-1',
                owner: 'user-1',
                is_deleted: false,
            });
        });

        it('should throw DatabaseError when foreign key constraint is violated', async () => {
            const reply = {
                content: 'balasan apapun',
                commentId: 'comment-nonexistent',
            };
            const owner = 'user-1';

            await expect(replyRepository.addReplyComment(reply, owner))
                .rejects
                .toThrow(InvariantError);
        });
    });

    describe('getReplyCommentById', () => {
        it('should return reply by id', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                threadId: 'thread-123',
                content: 'a comment',
                owner: 'user-2',
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                commentId: 'comment-1',
                content: 'This is a reply',
                owner: 'user-1',
            });

            const result = await replyRepository.getReplyCommentById('reply-123');
            expect(result).toEqual({
                id: 'reply-123',
                content: 'This is a reply',
                date: expect.any(String),
                owner: 'user-1',
            });
        });

        it('should throw NotFoundError if reply does not exist', async () => {
            await expect(replyRepository.getReplyCommentById('non-existent-reply'))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('verifyReplyCommentOwner', () => {
        it('should not throw any error when reply owner is verified', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                threadId: 'thread-123',
                content: 'a comment',
                owner: 'user-2',
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                commentId: 'comment-1',
                content: 'This is a reply',
                owner: 'user-1',
            });

            await expect(replyRepository.verifyReplyCommentOwner('reply-123', 'user-1'))
                .resolves
                .not
                .toThrow(AuthorizationError);
        });

        it('should throw NotFoundError if reply does not exist', async () => {
            await expect(replyRepository.verifyReplyCommentOwner('non-existent-reply', 'user-1'))
                .rejects
                .toThrow(NotFoundError);
        });

        it('should throw AuthorizationError if owner does not match', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                threadId: 'thread-123',
                content: 'a comment',
                owner: 'user-2',
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                commentId: 'comment-1',
                content: 'This is a reply',
                owner: 'user-1',
            });

            await expect(replyRepository.verifyReplyCommentOwner('reply-123', 'user-2'))
                .rejects
                .toThrow(AuthorizationError);
        });
    });

    describe('deleteReplyCommentById', () => {
        it('should soft delete reply by id (set is_deleted to true)', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1', username: 'userA' });
            await UsersTableTestHelper.addUser({ id: 'user-2', username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

            await CommentsTableTestHelper.addComment({
                id: 'comment-1',
                threadId: 'thread-123',
                content: 'a comment',
                owner: 'user-2',
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                commentId: 'comment-1',
                content: 'This is a reply',
                owner: 'user-1',
                isDeleted: false,
            });

            await replyRepository.deleteReplyCommentById('reply-123');

            const [result] = await RepliesTableTestHelper.findReplyById('reply-123');
            expect(result).toBeDefined();
            expect(result.is_deleted).toBe(true);
        });

        it('should throw NotFoundError if reply does not exist', async () => {
            await expect(replyRepository.deleteReplyCommentById('non-existent-reply'))
                .rejects
                .toThrow(NotFoundError);
        });
    });
});