class NewComment {
    constructor({ threadId, content }) {
        this._verifyPayload({ threadId, content });

        this.threadId = threadId;
        this.content = content;
    }

    _verifyPayload({ threadId, content }) {
        if (!threadId || !content) {
            throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof threadId !== 'string' || typeof content !== 'string') {
            throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = NewComment;