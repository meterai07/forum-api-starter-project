const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewReplyComment = require('../../../Domains/comments/entities/NewReplyComment');

describe('AddReplyCommentUseCase', () => {
    it('should orchestrate the add reply comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-456',
            content: 'This is a reply',
        };
        const credentials = 'user-123';

        const mockAddedReply = {
            id: 'reply-789',
            content: useCasePayload.content,
            owner: credentials,
        };

        // Mock the ThreadRepository
        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        // Mock the CommentRepository
        const mockCommentRepository = new CommentRepository();
        mockCommentRepository.getCommentById = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.addReplyComment = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedReply));

        // Create an instance of AddReplyCommentUseCase with the mocked repositories
        const addReplyCommentUseCase = new AddReplyCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        const addedReply = await addReplyCommentUseCase.execute(useCasePayload, credentials);

        // Assert
        expect(addedReply).toStrictEqual(mockAddedReply);
        expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.getCommentById).toBeCalledWith(useCasePayload.commentId);
        expect(mockCommentRepository.addReplyComment).toBeCalledWith(
            new NewReplyComment(useCasePayload),
            credentials
        );
    });
});