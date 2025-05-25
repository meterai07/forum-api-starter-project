const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool) {
        super();
        this._pool = pool;
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
}

module.exports = ReplyRepositoryPostgres;
