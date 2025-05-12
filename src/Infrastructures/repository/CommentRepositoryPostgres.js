const InvariantError = require('../../Commons/exceptions/InvariantError');
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
        console.log(query);

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Comment gagal ditambahkan');
        }
        return result.rows[0];
    }
}

module.exports = CommentRepositoryPostgres;