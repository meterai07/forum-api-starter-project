const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadUseCase', () => {
    it('should orchestrate the get thread action correctly', async () => {
        // Arrange
        const threadId = 'thread-123';
        const mockThread = {
            id: threadId,
            title: 'A Thread Title',
            body: 'This is the body of the thread.',
            date: '2025-05-15T12:00:00.000Z',
            username: 'dicoding',
            comments: [
                {
                    id: 'comment-123',
                    content: 'A comment',
                    date: '2025-05-15T12:30:00.000Z',
                    username: 'johndoe',
                    replies: [],
                },
            ],
        };

        // Mock the ThreadRepository
        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve(mockThread));

        // Create an instance of GetThreadUseCase with the mocked repository
        const getThreadUseCase = new GetThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const thread = await getThreadUseCase.execute(threadId);

        // Assert
        expect(thread).toStrictEqual(mockThread);
        expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    });
});