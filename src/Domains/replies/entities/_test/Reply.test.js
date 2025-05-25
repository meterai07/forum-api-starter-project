const Reply = require('../Reply');

describe('Reply Entity', () => {
    it('should create a Reply entity correctly', () => {
        const payload = {
            id: 'reply-123',
            content: 'This is a reply',
            date: '2025-05-25T10:00:00Z',
            isDeleted: false,
            commentId: 'comment-456',
            username: 'johndoe',
        };

        const reply = new Reply(payload);

        expect(reply.id).toEqual(payload.id);
        expect(reply.content).toEqual(payload.content);
        expect(reply.date).toEqual(payload.date);
        expect(reply.isDeleted).toEqual(payload.isDeleted);
        expect(reply.commentId).toEqual(payload.commentId);
        expect(reply.username).toEqual(payload.username);
    });
});
