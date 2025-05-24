const NewComment = require('../NewComment');

describe('NewComment', () => {
    it('should create a NewComment object correctly when given valid payload', () => {
        // Arrange
        const payload = {
            threadId: 'thread-123',
            content: 'This is a comment',
        };

        // Action
        const newComment = new NewComment(payload);

        // Assert
        expect(newComment.threadId).toEqual(payload.threadId);
        expect(newComment.content).toEqual(payload.content);
    });

    it('should throw error when payload does not contain needed property', () => {
        // Arrange
        const payload = {
            content: 'This is a comment',
        };

        // Action & Assert
        expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload properties do not meet data type specification', () => {
        // Arrange
        const payload = {
            threadId: 123, // Invalid type
            content: true, // Invalid type
        };

        // Action & Assert
        expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
});