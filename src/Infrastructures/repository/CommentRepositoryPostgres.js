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
            text: 'INSERT INTO comments (id, content, date, thread_id, owner, is_deleted) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
            values: [id, content, date, threadId, owner, false],
        };

        try {
            const result = await this._pool.query(query);

            return result.rows[0];
        } catch (error) {
            throw new InvariantError('Tidak dapat membuat komentar dengan thread yang tidak valid');
        }
    }

    async deleteCommentById(id) {
        const deleteQuery = {
            text: 'UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id',
            values: [id],
        };

        const deleteResult = await this._pool.query(deleteQuery);
        if (!deleteResult.rows.length) {
            throw new NotFoundError('Comment tidak ditemukan');
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
            SELECT comments.id, comments.content, comments.date, comments.is_deleted, 
                   comments.thread_id, users.username, comments.likes
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

    async verifyCommentAvailability(id) {
        const query = {
            text: 'SELECT id FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Comment tidak ditemukan');
        }
    }

    async checkUserLikeStatus(commentId, owner) {
        const query = {
            text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
            values: [commentId, owner],
        };

        const result = await this._pool.query(query);
        return result.rows.length > 0;
    }

    async addLikeToComment(commentId, owner) {
        const likeId = `like-${this._idGenerator()}`;
        const client = await this._pool.connect();

        try {
            await client.query('BEGIN');

            const checkQuery = {
                text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
                values: [commentId, owner],
            };
            const existingLike = await client.query(checkQuery);

            if (existingLike.rows.length > 0) {
                throw new InvariantError('User sudah memberikan like pada komentar ini');
            }

            const insertLikeQuery = {
                text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES($1, $2, $3)',
                values: [likeId, commentId, owner],
            };
            await client.query(insertLikeQuery);

            const updateCommentQuery = {
                text: 'UPDATE comments SET likes = likes + 1 WHERE id = $1 RETURNING id, likes',
                values: [commentId],
            };
            const result = await client.query(updateCommentQuery);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new InvariantError('Gagal menambahkan like pada komentar');
        } finally {
            client.release();
        }
    }

    async removeLikeFromComment(commentId, owner) {
        const client = await this._pool.connect();

        try {
            await client.query('BEGIN');

            const deleteLikeQuery = {
                text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2 RETURNING id',
                values: [commentId, owner],
            };
            const deleteResult = await client.query(deleteLikeQuery);

            if (!deleteResult.rows.length) {
                throw new NotFoundError('User belum memberikan like pada komentar ini');
            }

            const updateCommentQuery = {
                text: 'UPDATE comments SET likes = GREATEST(likes - 1, 0) WHERE id = $1 RETURNING id, likes',
                values: [commentId],
            };
            const result = await client.query(updateCommentQuery);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new InvariantError('Gagal menghapus like pada komentar');
        } finally {
            client.release();
        }
    }

    async getCommentLikeCount(commentId) {
        const query = {
            text: 'SELECT COUNT(*) as like_count FROM comment_likes WHERE comment_id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        return parseInt(result.rows[0].like_count);
    }
}

module.exports = CommentRepositoryPostgres;