class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId, commentId } = useCasePayload;
        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.verifyCommentOwner(commentId, credentials);
        await this._commentRepository.deleteCommentById(commentId);
    }
}

module.exports = DeleteCommentUseCase;