class deleteReplyCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId, commentId, replyId } = useCasePayload;
        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.getCommentById(commentId);
        await this._commentRepository.getReplyCommentById(replyId);
        await this._commentRepository.verifyReplyCommentOwner(replyId, credentials);
        await this._commentRepository.deleteReplyCommentById(replyId);
    }
}

module.exports = deleteReplyCommentUseCase;