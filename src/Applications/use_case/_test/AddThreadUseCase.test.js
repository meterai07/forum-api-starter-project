const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');

describe('AddThreadUseCase', () => {
    it('should orchestrate the add thread use case correctly', async () => {
        const mockThreadRepository = {
            addThread: jest.fn().mockResolvedValue({
                id: 'thread-001',
                title: 'A thread title',
                owner: 'user-123',
            }),
        };

        const useCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        const useCasePayload = {
            title: 'A thread title',
            body: 'Thread content goes here.',
        };

        const credentials = {
            userId: 'user-123',
        };

        const result = await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
        expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
            expect.any(NewThread),
            credentials
        );

        expect(result).toEqual({
            id: 'thread-001',
            title: 'A thread title',
            owner: 'user-123',
        });
    });
});
