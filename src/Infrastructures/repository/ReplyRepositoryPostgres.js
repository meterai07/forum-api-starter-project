const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async getRepliesByThreadId(threadId) {
        const query = {
            text: `
                SELECT replies.id, replies.content, replies.date, replies.is_deleted, replies.comment_id, users.username
                FROM replies
                JOIN users ON users.id = replies.owner
                WHERE replies.comment_id IN (
                    SELECT id FROM comments WHERE thread_id = $1
                )
                ORDER BY replies.date ASC
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async addReplyComment(reply, credentials) {
        const { content, commentId } = reply;
        const owner = credentials;
        const id = `reply-${this._idGenerator()}`;
        const date = new Date().toISOString();

        const query = {
            text: `
            INSERT INTO replies (id, content, date, is_deleted, comment_id, owner)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, content, owner
        `,
            values: [id, content, date, false, commentId, owner],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Balasan gagal ditambahkan');
        }

        return result.rows[0];
    }

    async getReplyCommentById(id) {
        const query = {
            text: 'SELECT id, content, date, owner FROM replies WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Balasan tidak ditemukan');
        }
        return result.rows[0];
    }

    async verifyReplyCommentOwner(id, credentials) {
        const query = {
            text: 'SELECT owner FROM replies WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Balasan tidak ditemukan');
        }

        const { owner } = result.rows[0];
        if (owner !== credentials) {
            throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
        }

        return true;
    }

    async deleteReplyCommentById(id) {
        const query = {
            text: 'UPDATE replies SET is_deleted = true WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Balasan gagal dihapus. Id tidak ditemukan');
        }

        return result.rows[0];
    }
}

module.exports = ReplyRepositoryPostgres;
