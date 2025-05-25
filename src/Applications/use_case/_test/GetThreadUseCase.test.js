const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('GetThreadUseCase', () => {
    it('should orchestrate the get thread use case correctly', async () => {
        const threadId = 'thread-123';

        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getThreadById = jest.fn().mockImplementation((id) => Promise.resolve({
            thread: {
                id,
                title: 'A Thread Title',
                body: 'This is the body of the thread.',
                date: '2025-05-15T12:00:00.000Z',
                username: 'dicoding',
            },
            comments: [
                {
                    id: 'comment-123',
                    content: 'A comment',
                    date: '2025-05-15T12:30:00.000Z',
                    username: 'johndoe',
                },
            ],
            replies: [
                {
                    id: 'reply-456',
                    content: 'A reply',
                    date: '2025-05-15T12:45:00.000Z',
                    username: 'janedoe',
                    comment_id: 'comment-123',
                },
            ],
        }));

        const getThreadUseCase = new GetThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        const detailThread = await getThreadUseCase.execute(threadId);

        expect(detailThread).toBeInstanceOf(DetailThread);
        expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
        expect(detailThread.id).toEqual(threadId);
        expect(detailThread.title).toEqual('A Thread Title');
        expect(detailThread.comments[0].id).toEqual('comment-123');
        expect(detailThread.comments[0].replies[0].id).toEqual('reply-456');
        expect(detailThread.comments[0].replies[0].content).toEqual('A reply');
    });
});