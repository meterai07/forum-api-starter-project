class CommentsHandler {
    constructor(container) {
        this._container = container;

        this.postCommentHandler = this.postCommentHandler.bind(this);
    }

    async postCommentHandler(request, h) {
        console.log('postCommentHandler');
    }
}

module.exports = CommentsHandler;