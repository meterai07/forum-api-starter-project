const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
    it('should throw error when getRepliesByThreadId is called directly', async () => {
        const replyRepository = new ReplyRepository();

        await expect(replyRepository.getRepliesByThreadId('thread-123'))
            .rejects
            .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking addReplyComment method without implementation', async () => {
        const replyRepository = new ReplyRepository();

        await expect(replyRepository.addReplyComment({}, 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking getReplyCommentById method without implementation', async () => {
        const replyRepository = new ReplyRepository();

        await expect(replyRepository.getReplyCommentById('reply-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking verifyReplyCommentOwner method without implementation', async () => {
        const replyRepository = new ReplyRepository();

        await expect(replyRepository.verifyReplyCommentOwner('reply-123', 'user-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking deleteReplyCommentById method without implementation', async () => {
        const replyRepository = new ReplyRepository();

        await expect(replyRepository.deleteReplyCommentById('reply-123'))
            .rejects
            .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});
