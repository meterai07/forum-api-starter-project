const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository', () => {
    it('should throw error when invoking addThread method without implementation', async () => {
        // Arrange
        const threadRepository = new ThreadRepository();

        // Action & Assert
        await expect(threadRepository.addThread({}, 'user-123'))
            .rejects
            .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });

    it('should throw error when invoking getThreadById method without implementation', async () => {
        // Arrange
        const threadRepository = new ThreadRepository();

        // Action & Assert
        await expect(threadRepository.getThreadById('thread-123'))
            .rejects
            .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});