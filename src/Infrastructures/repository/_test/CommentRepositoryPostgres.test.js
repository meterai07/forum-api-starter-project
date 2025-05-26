const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('CommentRepositoryPostgres (integration)', () => {
    const fakeIdGenerator = () => '123';
    const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    beforeEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
    });

    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
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
                .rejects.toThrow('Comment tidak ditemukan');
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
                .rejects.toThrow('Comment tidak ditemukan');
        });

        it('should throw NotFoundError when owner does not match', async () => {
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
                .rejects.toThrow('Anda tidak berhak menghapus komentar ini');
        });
    });
});
