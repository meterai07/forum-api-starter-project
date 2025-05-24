const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
    it('should orchestrate the add comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            content: 'This is a comment',
        };
        const credentials = 'user-123';

        const mockAddedComment = {
            id: 'comment-123',
            content: useCasePayload.content,
            owner: credentials,
        };

        // Mock the ThreadRepository
        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        // Mock the CommentRepository
        const mockCommentRepository = new CommentRepository();
        mockCommentRepository.addComment = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedComment));

        // Create an instance of AddCommentUseCase with the mocked repositories
        const addCommentUseCase = new AddCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        const addedComment = await addCommentUseCase.execute(useCasePayload, credentials);

        // Assert
        expect(addedComment).toStrictEqual(mockAddedComment);
        expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.addComment).toBeCalledWith(
            new NewComment(useCasePayload),
            credentials
        );
    });
});