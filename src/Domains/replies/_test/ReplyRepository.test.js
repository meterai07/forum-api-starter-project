const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
    it('should throw error when getRepliesByThreadId is called directly', async () => {
        const replyRepository = new ReplyRepository();

        await expect(replyRepository.getRepliesByThreadId('thread-123'))
            .rejects
            .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});
