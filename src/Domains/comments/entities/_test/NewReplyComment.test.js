const NewReplyComment = require('../NewReplyComment');

describe('NewReplyComment', () => {
    it('should create a NewReplyComment object correctly when given valid payload', () => {
        // Arrange
        const payload = {
            content: 'This is a reply',
            threadId: 'thread-123',
            commentId: 'comment-456',
        };

        // Action
        const newReplyComment = new NewReplyComment(payload);

        // Assert
        expect(newReplyComment.content).toEqual(payload.content);
        expect(newReplyComment.threadId).toEqual(payload.threadId);
        expect(newReplyComment.commentId).toEqual(payload.commentId);
    });

    it('should throw error when payload does not contain needed property', () => {
        // Arrange
        const payload = {
            content: 'This is a reply',
            threadId: 'thread-123',
        };

        // Action & Assert
        expect(() => new NewReplyComment(payload)).toThrowError('NEW_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload properties do not meet data type specification', () => {
        // Arrange
        const payload = {
            content: 123, // Invalid type
            threadId: true, // Invalid type
            commentId: {}, // Invalid type
        };

        // Action & Assert
        expect(() => new NewReplyComment(payload)).toThrowError('NEW_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
});