class NewReplyComment {
    constructor({ content, threadId, commentId }) {
        this._verifyPayload({ content, threadId, commentId });
        this.content = content;
        this.threadId = threadId;
        this.commentId = commentId;
    }

    _verifyPayload({ content, threadId, commentId }) {
        if (!content || !threadId || !commentId) {
            throw new Error('NEW_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }
        if (typeof content !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
            throw new Error('NEW_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = NewReplyComment;