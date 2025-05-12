class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const { threadId, commentId } = useCasePayload;
        await this._threadRepository.getThreadById(threadId);
        await this._commentRepository.deleteCommentById(commentId);
    }
}

module.exports = DeleteCommentUseCase;