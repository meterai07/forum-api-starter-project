const NewReplyComment = require('../../Domains/comments/entities/NewReplyComment');

class AddReplyCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId, commentId } = useCasePayload;

        await this._threadRepository.getThreadById(threadId);
        await this._commentRepository.getCommentById(commentId);

        const newComment = new NewReplyComment(useCasePayload);
        return this._commentRepository.addReplyComment(newComment, credentials);
    }
}

module.exports = AddReplyCommentUseCase;