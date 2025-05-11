class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
    }

    async execute(useCasePayload) {

    }
}

module.exports = DeleteCommentUseCase;