const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteCommentUseCase', () => {
    it('should orchestrate the delete comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-456',
        };
        const credentials = 'user-123';

        // Mock the ThreadRepository
        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        // Mock the CommentRepository
        const mockCommentRepository = new CommentRepository();
        mockCommentRepository.deleteCommentById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        // Create an instance of DeleteCommentUseCase with the mocked repositories
        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await deleteCommentUseCase.execute(useCasePayload, credentials);

        // Assert
        expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.deleteCommentById).toBeCalledWith(
            useCasePayload.commentId,
            credentials
        );
    });
});