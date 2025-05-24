const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteReplyCommentUseCase', () => {
    it('should orchestrate the delete reply comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-456',
            replyId: 'reply-789',
        };
        const credentials = 'user-123';

        // Mock the ThreadRepository
        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        // Mock the CommentRepository
        const mockCommentRepository = new CommentRepository();
        mockCommentRepository.getCommentById = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.getReplyCommentById = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyReplyCommentOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.deleteReplyCommentById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        // Create an instance of DeleteReplyCommentUseCase with the mocked repositories
        const deleteReplyCommentUseCase = new DeleteReplyCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await deleteReplyCommentUseCase.execute(useCasePayload, credentials);

        // Assert
        expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.getCommentById).toBeCalledWith(useCasePayload.commentId);
        expect(mockCommentRepository.getReplyCommentById).toBeCalledWith(useCasePayload.replyId);
        expect(mockCommentRepository.verifyReplyCommentOwner).toBeCalledWith(
            useCasePayload.replyId,
            credentials
        );
        expect(mockCommentRepository.deleteReplyCommentById).toBeCalledWith(useCasePayload.replyId);
    });
});