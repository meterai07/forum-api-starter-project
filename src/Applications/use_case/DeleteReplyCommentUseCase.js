class deleteReplyCommentUseCase {
    constructor({ commentRepository, threadRepository, replyRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
        this._replyRepository = replyRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId, commentId, replyId } = useCasePayload;
        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.getCommentById(commentId);
        await this._replyRepository.getReplyCommentById(replyId);
        await this._replyRepository.verifyReplyCommentOwner(replyId, credentials);
        await this._replyRepository.deleteReplyCommentById(replyId);
    }
}

module.exports = deleteReplyCommentUseCase;