const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase');

describe('DeleteReplyCommentUseCase', () => {
    it('should orchestrate the delete reply comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            getCommentById: jest.fn().mockResolvedValue({
                id: 'comment-001',
                content: 'This is a comment',
                date: '2024-01-01T00:00:00.000Z',
                owner: 'user-123',
            }),
        };

        const mockReplyRepository = {
            getReplyCommentById: jest.fn().mockResolvedValue({
                id: 'reply-001',
                content: 'This is a reply',
                date: '2024-01-01T00:00:00.000Z',
                owner: 'user-123',
            }),
            verifyReplyCommentOwner: jest.fn().mockResolvedValue(true),
            deleteReplyCommentById: jest.fn().mockResolvedValue({
                id: 'reply-001',
            }),
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
        const result = await useCase.execute(useCasePayload, credentials);
        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.getCommentById)
            .toHaveBeenCalledWith(useCasePayload.commentId);
        expect(mockReplyRepository.getReplyCommentById)
            .toHaveBeenCalledWith(useCasePayload.replyId);
        expect(mockReplyRepository.verifyReplyCommentOwner)
            .toHaveBeenCalledWith(useCasePayload.replyId, credentials);
        expect(mockReplyRepository.deleteReplyCommentById)
            .toHaveBeenCalledWith(useCasePayload.replyId);
    });
});
