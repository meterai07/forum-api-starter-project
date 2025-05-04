class NewThread {
    constructor({ title, body, owner }) {
        this._verifyTitle(title);
        this._verifyBody(body);

        this.title = title;
        this.body = body;
    }

    _verifyTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new Error('NEW_THREAD.NOT_CONTAIN_TITLE');
        }
    }

    _verifyBody(body) {
        if (!body || typeof body !== 'string') {
            throw new Error('NEW_THREAD.NOT_CONTAIN_BODY');
        }
    }
}

module.exports = NewThread;