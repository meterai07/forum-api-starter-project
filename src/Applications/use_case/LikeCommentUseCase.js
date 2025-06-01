class LikeCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId, commentId } = useCasePayload;
        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.verifyCommentAvailability(commentId);
        const alreadyLiked = await this._commentRepository.checkUserLikeStatus(commentId, credentials);
        if (alreadyLiked) {
            await this._commentRepository.removeLikeFromComment(commentId, credentials);
        } else {
            await this._commentRepository.addLikeToComment(commentId, credentials);
        }
    }
}

module.exports = LikeCommentUseCase;