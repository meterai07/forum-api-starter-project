const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
    it('should orchestrate the add comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            addComment: jest.fn().mockResolvedValue({
                id: 'comment-001',
                content: 'A sample comment',
                owner: 'user-123',
            }),
        };

        const useCase = new AddCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        const useCasePayload = {
            threadId: 'thread-001',
            content: 'A sample comment',
        };

        const credentials = {
            userId: 'user-123',
        };

        const result = await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith(useCasePayload.threadId);

        expect(mockCommentRepository.addComment)
            .toHaveBeenCalledWith(expect.any(NewComment), credentials);

        expect(result).toEqual({
            id: 'comment-001',
            content: 'A sample comment',
            owner: 'user-123',
        });
    });
});
