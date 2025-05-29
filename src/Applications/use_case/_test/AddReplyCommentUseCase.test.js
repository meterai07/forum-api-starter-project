const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');
const NewReplyComment = require('../../../Domains/comments/entities/NewReplyComment');

describe('AddReplyCommentUseCase', () => {
    it('should orchestrate the add reply comment use case correctly', async () => {
        const mockThreadRepository = {
            verifyThreadAvailability: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            getCommentById: jest.fn().mockResolvedValue({
                id: 'comment-001',
                content: 'This is a comment',
                date: '2024-01-01T00:00:00.000Z',
                owner: 'user-123',
            }),
        };

        const mockReplyRepository = {
            addReplyComment: jest.fn().mockImplementation((newReply, owner) => Promise.resolve({
                id: 'reply-001',
                content: newReply.content,
                date: '2024-01-01T00:00:00.000Z',
                owner,
            })),
        };

        const useCase = new AddReplyCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
            replyRepository: mockReplyRepository,
        });

        const useCasePayload = {
            threadId: 'thread-001',
            commentId: 'comment-001',
            content: 'This is a reply',
        };

        const credentials = 'user-123';

        const result = await useCase.execute(useCasePayload, credentials);

        expect(mockThreadRepository.verifyThreadAvailability)
            .toHaveBeenCalledWith('thread-001');

        expect(mockCommentRepository.getCommentById)
            .toHaveBeenCalledWith('comment-001');

        expect(mockReplyRepository.addReplyComment)
            .toHaveBeenCalledWith(expect.any(NewReplyComment), 'user-123');

        expect(result).toEqual({
            id: 'reply-001',
            content: 'This is a reply',
            date: '2024-01-01T00:00:00.000Z',
            owner: 'user-123',
        });
    });
});