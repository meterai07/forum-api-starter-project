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

    it('should throw error when invoking addReplyComment method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.addReplyComment({}, 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking getReplyCommentById method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.getReplyCommentById('reply-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking verifyReplyCommentOwner method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.verifyReplyCommentOwner('reply-123', 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking deleteReplyCommentById method without implementation', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.deleteReplyCommentById('reply-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});