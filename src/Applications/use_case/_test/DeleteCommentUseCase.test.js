const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
    it('should orchestrate the delete comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };
        const mockCommentRepository = {
            deleteCommentById: jest.fn().mockResolvedValue(),
        };

        const useCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        const useCasePayload = {
            threadId: 'thread-001',
            commentId: 'comment-001',
        };

        const credentials = {
            userId: 'user-123',
        };

        await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.deleteCommentById)
            .toHaveBeenCalledWith(useCasePayload.commentId, credentials);
    });
});
