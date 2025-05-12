class CommentRepository {
    async addComment(comment, credentials) {
        throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async deleteCommentById(id, credentials) {
        throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getCommentById(id) {
        throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async addReplyComment(comment, credentials) {
        throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = CommentRepository;