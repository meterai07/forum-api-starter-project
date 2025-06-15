const GetThreadUseCase = require('../GetThreadUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('GetThreadUseCase', () => {
    it('should orchestrate the get thread use case properly and return correct data structure', async () => {
        const mockThread = {
            id: 'thread-123',
            title: 'Title',
            body: 'Body',
            date: '2021-01-01',
            username: 'userA',
        };

        const mockComments = [
            {
                id: 'comment-1',
                content: 'comment1',
                date: '2021-01-01',
                username: 'userB',
                is_deleted: false,
                thread_id: 'thread-123',
                likes: 0,
            },
        ];

        const mockReplies = [
            {
                id: 'reply-1',
                comment_id: 'comment-1',
                content: 'reply1',
                date: '2021-01-01',
                username: 'userC',
                is_deleted: false,
            },
        ];

        const expectedResult = new DetailThread({
            thread: {
                id: 'thread-123',
                title: 'Title',
                body: 'Body',
                date: '2021-01-01',
                username: 'userA',
            },
            comments: [
                {
                    id: 'comment-1',
                    content: 'comment1',
                    date: '2021-01-01',
                    username: 'userB',
                    is_deleted: false,
                    likes: 0,
                },
            ],
            replies: [
                {
                    id: 'reply-1',
                    comment_id: 'comment-1',
                    content: 'reply1',
                    date: '2021-01-01',
                    username: 'userC',
                    is_deleted: false,
                },
            ],
        });

        const mockThreadRepository = {
            getThreadById: jest.fn().mockResolvedValue(mockThread),
        };
        const mockCommentRepository = {
            getCommentsByThreadId: jest.fn().mockResolvedValue(mockComments),
        };
        const mockReplyRepository = {
            getRepliesByThreadId: jest.fn().mockResolvedValue(mockReplies),
        };

        const getThreadUseCase = new GetThreadUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        const result = await getThreadUseCase.execute('thread-123');

        expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
        expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
        expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');

        expect(result).toStrictEqual(expectedResult);
    });
});
