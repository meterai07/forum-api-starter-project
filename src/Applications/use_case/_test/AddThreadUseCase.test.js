const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
    it('should orchestrate the add thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            title: 'A Thread Title',
            body: 'This is the body of the thread.',
        };

        const mockAddedThread = {
            id: 'thread-123',
            title: useCasePayload.title,
            body: useCasePayload.body,
            owner: 'user-123',
        };

        // Mock the ThreadRepository
        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.addThread = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedThread));

        // Create an instance of AddThreadUseCase with the mocked repository
        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const addedThread = await addThreadUseCase.execute(useCasePayload, 'user-123');

        // Assert
        expect(addedThread).toStrictEqual(mockAddedThread);
        expect(mockThreadRepository.addThread).toBeCalledWith(
            new NewThread({
                title: useCasePayload.title,
                body: useCasePayload.body,
            }),
            'user-123'
        );
    });
});