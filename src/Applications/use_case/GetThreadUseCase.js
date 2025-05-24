const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(threadId) {
        const { thread, comments, replies } = await this._threadRepository.getThreadById(threadId);
        return new DetailThread({ thread, comments, replies });
    }
}

module.exports = GetThreadUseCase;
