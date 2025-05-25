const NewReplyComment = require('../../Domains/comments/entities/NewReplyComment');

class AddReplyCommentUseCase {
    constructor({ commentRepository, threadRepository, replyRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
        this._replyRepository = replyRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId, commentId } = useCasePayload;

        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.getCommentById(commentId);

        const newComment = new NewReplyComment(useCasePayload);
        return this._replyRepository.addReplyComment(newComment, credentials);
    }
}

module.exports = AddReplyCommentUseCase;