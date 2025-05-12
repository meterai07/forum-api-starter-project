const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const AddReplyCommentUseCase = require("../../../../Applications/use_case/AddReplyCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");

class CommentsHandler {
    constructor(container) {
        this._container = container;

        this.postCommentHandler = this.postCommentHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
        this.postReplyHandler = this.postReplyHandler.bind(this);
    }

    async postCommentHandler(request, h) {
        const { threadId } = request.params;
        const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
        const addedComment = await addCommentUseCase.execute(
            { ...request.payload, threadId },
            request.auth.credentials.id
        );
        const response = h.response({
            status: 'success',
            data: {
                addedComment,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCommentHandler(request, h) {
        const { threadId, commentId } = request.params;
        const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
        await deleteCommentUseCase.execute({ threadId, commentId }, request.auth.credentials.id);
        return h.response({
            status: 'success',
            message: 'Comment deleted successfully',
        }).code(200);
    }

    async postReplyHandler(request, h) {
        const { threadId, commentId } = request.params;
        const addReplyCommentUseCase = this._container.getInstance(AddReplyCommentUseCase.name);

        const addedReplyComment = await addReplyCommentUseCase.execute(
            { ...request.payload, threadId, commentId },
            request.auth.credentials.id
        );
        const response = h.response({
            status: 'success',
            data: {
                addedReplyComment,
            },
        });
        response.code(201);
        return response;
    }
}

module.exports = CommentsHandler;