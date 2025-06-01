const DetailThread = require('../DetailThread');

describe('DetailThread Entity', () => {
    it('should construct DetailThread correctly with valid data', () => {
        const payload = {
            thread: {
                id: 'thread-123',
                title: 'Thread Title',
                body: 'Thread body content',
                date: '2021-08-08T07:19:09.775Z',
                username: 'john_doe',
            },
            comments: [
                {
                    id: 'comment-1',
                    content: 'A comment',
                    date: '2021-08-08T08:00:00.000Z',
                    username: 'jane_doe',
                    is_deleted: false,
                    likes: 5,
                },
            ],
            replies: [
                {
                    id: 'reply-1',
                    content: 'A reply',
                    date: '2021-08-08T08:30:00.000Z',
                    username: 'doe_john',
                    is_deleted: false,
                    comment_id: 'comment-1',
                },
            ],
        };

        const detailThread = new DetailThread(payload);

        expect(detailThread).toEqual({
            id: 'thread-123',
            title: 'Thread Title',
            body: 'Thread body content',
            date: '2021-08-08T07:19:09.775Z',
            username: 'john_doe',
            comments: [
                {
                    id: 'comment-1',
                    content: 'A comment',
                    date: '2021-08-08T08:00:00.000Z',
                    username: 'jane_doe',
                    likeCount: 5,
                    replies: [
                        {
                            id: 'reply-1',
                            content: 'A reply',
                            date: '2021-08-08T08:30:00.000Z',
                            username: 'doe_john',
                        },
                    ],
                },
            ],
        });
    });

    it('should mask deleted comments and replies content', () => {
        const payload = {
            thread: {
                id: 'thread-456',
                title: 'Another Thread',
                body: 'Another body',
                date: '2021-08-08T10:00:00.000Z',
                username: 'alice',
            },
            comments: [
                {
                    id: 'comment-2',
                    content: 'This comment is deleted',
                    date: '2021-08-08T10:05:00.000Z',
                    username: 'bob',
                    is_deleted: true,
                },
            ],
            replies: [
                {
                    id: 'reply-2',
                    content: 'Deleted reply content',
                    date: '2021-08-08T10:10:00.000Z',
                    username: 'carol',
                    is_deleted: true,
                    comment_id: 'comment-2',
                },
            ],
        };

        const detailThread = new DetailThread(payload);

        expect(detailThread.comments[0].content).toBe('**komentar telah dihapus**');
        expect(detailThread.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
    });

    it('should throw error when thread is missing', () => {
        expect(() => new DetailThread({})).toThrowError('DETAIL_THREAD.NOT_CONTAIN_VALID_THREAD');
    });

    it('should return empty comments if none are provided', () => {
        const payload = {
            thread: {
                id: 'thread-789',
                title: 'Empty Thread',
                body: 'No comments here',
                date: '2021-08-08T11:00:00.000Z',
                username: 'test_user',
            },
        };

        const detailThread = new DetailThread(payload);

        expect(detailThread.comments).toEqual([]);
    });
});