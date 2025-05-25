const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
    it('should orchestrate the add comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            addComment: jest.fn().mockResolvedValue({
                id: 'comment-001',
                content: 'A sample comment',
                owner: 'user-123',
            }),
        };

        const useCase = new AddCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        const useCasePayload = {
            threadId: 'thread-001',
            content: 'A sample comment',
        };

        const credentials = {
            userId: 'user-123',
        };

        const result = await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith(useCasePayload.threadId);

        expect(mockCommentRepository.addComment)
            .toHaveBeenCalledWith(expect.any(NewComment), credentials);

        expect(result).toEqual({
            id: 'comment-001',
            content: 'A sample comment',
            owner: 'user-123',
        });
    });

    it('should throw error when payload is missing content', async () => {
        const useCase = new AddCommentUseCase({
            commentRepository: {},
            threadRepository: { verifyThreadAvailability: jest.fn() },
        });

        const useCasePayload = {
            threadId: 'thread-001',
        };

        const credentials = {
            userId: 'user-123',
        };

        await expect(useCase.execute(useCasePayload, credentials))
            .rejects.toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when content is not a string', async () => {
        const useCase = new AddCommentUseCase({
            commentRepository: {},
            threadRepository: { verifyThreadAvailability: jest.fn() },
        });

        const useCasePayload = {
            threadId: 'thread-001',
            content: 12345,
        };

        const credentials = {
            userId: 'user-123',
        };

        await expect(useCase.execute(useCasePayload, credentials))
            .rejects.toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should propagate error when thread is not found', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockRejectedValue(new Error('THREAD_NOT_FOUND')),
        };

        const useCase = new AddCommentUseCase({
            commentRepository: {},
            threadRepository: mockThreadRepository,
        });

        const useCasePayload = {
            threadId: 'thread-999',
            content: 'Some comment',
        };

        const credentials = {
            userId: 'user-123',
        };

        await expect(useCase.execute(useCasePayload, credentials))
            .rejects.toThrowError('THREAD_NOT_FOUND');
    });
});
