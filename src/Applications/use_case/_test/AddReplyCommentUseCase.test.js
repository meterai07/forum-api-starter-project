const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');
const NewReplyComment = require('../../../Domains/comments/entities/NewReplyComment');

describe('AddReplyCommentUseCase', () => {
    it('should orchestrate the add reply comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };
        const mockCommentRepository = {
            getCommentById: jest.fn().mockResolvedValue(),
            addReplyComment: jest.fn().mockResolvedValue({
                id: 'reply-001',
                content: 'This is a reply',
                owner: 'user-123',
            }),
        };

        const useCase = new AddReplyCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        const useCasePayload = {
            threadId: 'thread-001',
            commentId: 'comment-001',
            content: 'This is a reply',
        };

        const credentials = {
            userId: 'user-123',
        };

        const result = await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith(useCasePayload.threadId);

        expect(mockCommentRepository.getCommentById)
            .toHaveBeenCalledWith(useCasePayload.commentId);

        expect(mockCommentRepository.addReplyComment)
            .toHaveBeenCalledWith(expect.any(NewReplyComment), credentials);

        expect(result).toEqual({
            id: 'reply-001',
            content: 'This is a reply',
            owner: 'user-123',
        });
    });
});
