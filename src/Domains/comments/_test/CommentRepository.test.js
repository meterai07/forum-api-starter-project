const CommentRepository = require('../CommentRepository');

describe('CommentRepository', () => {
    it('should throw error when invoking addComment method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.addComment({}, 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking deleteCommentById method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.deleteCommentById('comment-123', 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking getCommentById method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.getCommentById('comment-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking getCommentsByThreadId method without implementation', async () => {
        const commentRepository = new CommentRepository();

        await expect(commentRepository.getCommentsByThreadId('thread-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking verifyCommentOwner method without implementation', async () => {
        const commentRepository = new CommentRepository();

        await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});