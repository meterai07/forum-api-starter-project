const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');

describe('AddThreadUseCase', () => {
    it('should orchestrate the add thread use case correctly', async () => {
        const useCasePayload = {
            title: 'A thread title',
            body: 'Thread content goes here.',
        };
        const credentials = { userId: 'user-123' };

        const mockThreadRepository = {
            addThread: jest.fn().mockImplementation((newThread, creds) => {
                return Promise.resolve({
                    id: 'thread-001',
                    title: newThread.title,
                    owner: creds.userId,
                });
            }),
        };

        const useCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });
        const result = await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
        expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
            expect.any(NewThread),
            credentials
        );
        expect(result).toEqual({
            id: 'thread-001',
            title: useCasePayload.title,
            owner: credentials.userId,
        });
    });
});