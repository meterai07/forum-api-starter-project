const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

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
        const deleteQuery = {
            text: 'UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id',
            values: [id],
        };

        const deleteResult = await this._pool.query(deleteQuery);
        if (!deleteResult.rows.length) {
            throw new NotFoundError('Comment gagal dihapus. Id tidak ditemukan');
        }
    }

    async getCommentById(id) {
        const query = {
            text: 'SELECT id, content, date, owner FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Comment tidak ditemukan');
        }
        return result.rows[0];
    }

    async getCommentsByThreadId(threadId) {
        const query = {
            text: `
                SELECT comments.id, comments.content, comments.date, comments.is_deleted, comments.thread_id, users.username
                FROM comments
                JOIN users ON users.id = comments.owner
                WHERE comments.thread_id = $1
                ORDER BY comments.date ASC
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async verifyCommentOwner(id, credentials) {
        const query = {
            text: 'SELECT owner FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Comment tidak ditemukan');
        }

        const { owner } = result.rows[0];
        if (owner !== credentials) {
            throw new AuthorizationError('Anda tidak berhak menghapus komentar ini');
        }

        return true;
    }
}

module.exports = CommentRepositoryPostgres;