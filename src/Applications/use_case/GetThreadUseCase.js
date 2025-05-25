const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetThreadUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        const thread = await this._threadRepository.getThreadById(threadId);
        const comments = await this._commentRepository.getCommentsByThreadId(threadId);
        const replies = await this._replyRepository.getRepliesByThreadId(threadId);

        return new DetailThread({ thread, comments, replies });
    }
}

module.exports = GetThreadUseCase;
