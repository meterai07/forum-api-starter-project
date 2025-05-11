class AddCommentUseCase {
    constructor({ commentRepository }) {
        this._commentRepository = commentRepository;
    }

    async execute({ threadId, content, owner }) {
        return this._commentRepository.addComment({ threadId, content, owner });
    }
}

module.exports = AddCommentUseCase;