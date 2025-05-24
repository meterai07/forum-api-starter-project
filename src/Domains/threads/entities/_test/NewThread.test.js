const NewThread = require('../NewThread');

describe('NewThread', () => {
    it('should create a NewThread object correctly when given valid payload', () => {
        // Arrange
        const payload = {
            title: 'A Thread Title',
            body: 'This is the body of the thread.',
        };

        // Action
        const newThread = new NewThread(payload);

        // Assert
        expect(newThread.title).toEqual(payload.title);
        expect(newThread.body).toEqual(payload.body);
    });

    it('should throw error when title is missing', () => {
        // Arrange
        const payload = {
            body: 'This is the body of the thread.',
        };

        // Action & Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_TITLE');
    });

    it('should throw error when body is missing', () => {
        // Arrange
        const payload = {
            title: 'A Thread Title',
        };

        // Action & Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_BODY');
    });

    it('should throw error when title is not a string', () => {
        // Arrange
        const payload = {
            title: 123, // Invalid type
            body: 'This is the body of the thread.',
        };

        // Action & Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_TITLE');
    });

    it('should throw error when body is not a string', () => {
        // Arrange
        const payload = {
            title: 'A Thread Title',
            body: 123, // Invalid type
        };

        // Action & Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_BODY');
    });
});