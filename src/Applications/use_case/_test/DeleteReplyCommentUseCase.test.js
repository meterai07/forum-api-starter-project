const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase');

describe('DeleteReplyCommentUseCase', () => {
    it('should orchestrate the delete reply comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            getCommentById: jest.fn().mockResolvedValue(),
        };

        const mockReplyRepository = {
            getReplyCommentById: jest.fn().mockResolvedValue(),
            verifyReplyCommentOwner: jest.fn().mockResolvedValue(),
            deleteReplyCommentById: jest.fn().mockResolvedValue(),
        };

        const useCase = new DeleteReplyCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
            replyRepository: mockReplyRepository,
        });

        const useCasePayload = {
            threadId: 'thread-001',
            commentId: 'comment-001',
            replyId: 'reply-001',
        };

        const credentials = 'user-123';

        await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith('thread-001');

        expect(mockCommentRepository.getCommentById)
            .toHaveBeenCalledWith('comment-001');

        expect(mockReplyRepository.getReplyCommentById)
            .toHaveBeenCalledWith('reply-001');

        expect(mockReplyRepository.verifyReplyCommentOwner)
            .toHaveBeenCalledWith('reply-001', 'user-123');

        expect(mockReplyRepository.deleteReplyCommentById)
            .toHaveBeenCalledWith('reply-001');
    });
});
