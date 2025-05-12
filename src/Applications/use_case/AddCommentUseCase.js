const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, credentials) {
        const { threadId } = useCasePayload;
        await this._threadRepository.getThreadById(threadId);

        const newComment = new NewComment(useCasePayload);
        return this._commentRepository.addComment(newComment, credentials);
    }
}

module.exports = AddCommentUseCase;