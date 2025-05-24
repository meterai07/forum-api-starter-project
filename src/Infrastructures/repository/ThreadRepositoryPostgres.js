const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread(thread, credentials) {
        const { title, body } = thread;
        const owner = credentials;
        const id = `thread-${this._idGenerator()}`;
        const date = new Date().toISOString();
        const query = {
            text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
            values: [id, title, body, date, owner],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Thread gagal ditambahkan');
        }
        return result.rows[0];
    }

    async getThreadById(id) {
        const threadQuery = {
            text: `
        SELECT 
            threads.id, 
            threads.title, 
            threads.body, 
            threads.date, 
            users.username
        FROM threads
        JOIN users ON users.id = threads.owner
        WHERE threads.id = $1
        `,
            values: [id],
        };

        const commentsQuery = {
            text: `
        SELECT 
            comments.id, 
            comments.content, 
            comments.date, 
            comments.is_deleted,
            comments.thread_id,
            users.username
        FROM comments
        JOIN users ON users.id = comments.owner
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
        `,
            values: [id],
        };

        const repliesQuery = {
            text: `
        SELECT 
            replies.id, 
            replies.content, 
            replies.date, 
            replies.is_deleted,
            replies.comment_id,
            users.username
        FROM replies
        JOIN users ON users.id = replies.owner
        WHERE replies.comment_id IN (
            SELECT id FROM comments WHERE thread_id = $1
        )
        ORDER BY replies.date ASC
        `,
            values: [id],
        };

        const [threadResult, commentsResult, repliesResult] = await Promise.all([
            this._pool.query(threadQuery),
            this._pool.query(commentsQuery),
            this._pool.query(repliesQuery),
        ]);

        if (!threadResult.rows.length) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        return {
            thread: threadResult.rows[0],
            comments: commentsResult.rows,
            replies: repliesResult.rows,
        };
    }

    async verifyThreadAvailability(id) {
        const query = {
            text: 'SELECT id FROM threads WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Thread tidak ditemukan');
        }
    }
}

module.exports = ThreadRepositoryPostgres;