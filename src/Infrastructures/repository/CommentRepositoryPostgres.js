const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addComment(comment, credentials) {
        const { content, threadId } = comment;
        const owner = credentials;
        const id = `comment-${this._idGenerator()}`;
        const date = new Date().toISOString();
        const query = {
            text: 'INSERT INTO comments (id, content, date, thread_id, owner) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
            values: [id, content, date, threadId, owner],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Comment gagal ditambahkan');
        }
        return result.rows[0];
    }

    async deleteCommentById(id) {
        const query = {
            text: 'UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Comment gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = CommentRepositoryPostgres;