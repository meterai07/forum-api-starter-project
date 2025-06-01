const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
    describe('execute', () => {
        it('should add like when comment is not already liked', async () => {
            const mockThreadRepository = {
                verifyThreadAvailability: jest.fn().mockResolvedValue(),
            };
            const mockCommentRepository = {
                verifyCommentAvailability: jest.fn().mockResolvedValue(),
                checkUserLikeStatus: jest.fn().mockResolvedValue(false),
                addLikeToComment: jest.fn().mockResolvedValue(),
                removeLikeFromComment: jest.fn().mockResolvedValue(),
            };

            const useCase = new LikeCommentUseCase({
                threadRepository: mockThreadRepository,
                commentRepository: mockCommentRepository,
            });

            const useCasePayload = {
                threadId: 'thread-001',
                commentId: 'comment-001',
            };
            const credentials = 'user-123';

            await useCase.execute(useCasePayload, credentials);

            expect(mockThreadRepository.verifyThreadAvailability)
                .toHaveBeenCalledWith('thread-001');
            expect(mockCommentRepository.verifyCommentAvailability)
                .toHaveBeenCalledWith('comment-001');
            expect(mockCommentRepository.checkUserLikeStatus)
                .toHaveBeenCalledWith('comment-001', 'user-123');
            expect(mockCommentRepository.addLikeToComment)
                .toHaveBeenCalledWith('comment-001', 'user-123');
            expect(mockCommentRepository.removeLikeFromComment)
                .not.toHaveBeenCalled();
        });

        it('should remove like when comment is already liked', async () => {
            const mockThreadRepository = {
                verifyThreadAvailability: jest.fn().mockResolvedValue(),
            };
            const mockCommentRepository = {
                verifyCommentAvailability: jest.fn().mockResolvedValue(),
                checkUserLikeStatus: jest.fn().mockResolvedValue(true),
                addLikeToComment: jest.fn().mockResolvedValue(),
                removeLikeFromComment: jest.fn().mockResolvedValue(),
            };

            const useCase = new LikeCommentUseCase({
                threadRepository: mockThreadRepository,
                commentRepository: mockCommentRepository,
            });

            const useCasePayload = {
                threadId: 'thread-001',
                commentId: 'comment-001',
            };
            const credentials = 'user-123';

            await useCase.execute(useCasePayload, credentials);

            expect(mockThreadRepository.verifyThreadAvailability)
                .toHaveBeenCalledWith('thread-001');
            expect(mockCommentRepository.verifyCommentAvailability)
                .toHaveBeenCalledWith('comment-001');
            expect(mockCommentRepository.checkUserLikeStatus)
                .toHaveBeenCalledWith('comment-001', 'user-123');
            expect(mockCommentRepository.removeLikeFromComment)
                .toHaveBeenCalledWith('comment-001', 'user-123');
            expect(mockCommentRepository.addLikeToComment)
                .not.toHaveBeenCalled();
        });

        it('should verify thread and comment availability before checking like status', async () => {
            const mockThreadRepository = {
                verifyThreadAvailability: jest.fn().mockResolvedValue(),
            };
            const mockCommentRepository = {
                verifyCommentAvailability: jest.fn().mockResolvedValue(),
                checkUserLikeStatus: jest.fn().mockResolvedValue(false),
                addLikeToComment: jest.fn().mockResolvedValue(),
                removeLikeFromComment: jest.fn().mockResolvedValue(),
            };

            const useCase = new LikeCommentUseCase({
                threadRepository: mockThreadRepository,
                commentRepository: mockCommentRepository,
            });

            const useCasePayload = {
                threadId: 'thread-001',
                commentId: 'comment-001',
            };
            const credentials = 'user-123';

            await useCase.execute(useCasePayload, credentials);

            const threadCall = mockThreadRepository.verifyThreadAvailability.mock.invocationCallOrder[0];
            const commentCall = mockCommentRepository.verifyCommentAvailability.mock.invocationCallOrder[0];
            const likeStatusCall = mockCommentRepository.checkUserLikeStatus.mock.invocationCallOrder[0];

            expect(threadCall).toBeDefined();
            expect(commentCall).toBeDefined();
            expect(likeStatusCall).toBeDefined();
            expect(threadCall).toBeLessThan(likeStatusCall);
            expect(commentCall).toBeLessThan(likeStatusCall);
        });
    });
});