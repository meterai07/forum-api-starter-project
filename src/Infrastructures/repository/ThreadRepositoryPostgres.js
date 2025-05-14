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
                threads.id AS thread_id, 
                threads.title, 
                threads.body, 
                threads.date, 
                users.username AS thread_owner,
                comments.id AS comment_id,
                comments.content AS comment_content,
                comments.date AS comment_date,
                comments.is_deleted AS comment_is_deleted,
                comment_users.username AS comment_username
            FROM threads
            LEFT JOIN users ON users.id = threads.owner
            LEFT JOIN comments ON comments.thread_id = threads.id
            LEFT JOIN users AS comment_users ON comment_users.id = comments.owner
            WHERE threads.id = $1
            `,
            values: [id],
        };

        const repliesQuery = {
            text: `
            SELECT 
                replies.id AS reply_id,
                replies.content AS reply_content,
                replies.date AS reply_date,
                replies.is_deleted AS reply_is_deleted,
                replies.comment_id,
                users.username AS reply_username
            FROM replies
            LEFT JOIN users ON users.id = replies.owner
            WHERE replies.comment_id IN (
                SELECT id FROM comments WHERE thread_id = $1
            )
            ORDER BY replies.date ASC
            `,
            values: [id],
        };

        const [threadResult, repliesResult] = await Promise.all([
            this._pool.query(threadQuery),
            this._pool.query(repliesQuery),
        ]);

        if (!threadResult.rows.length) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        const threadRow = threadResult.rows[0];

        const thread = {
            id: threadRow.thread_id,
            title: threadRow.title,
            body: threadRow.body,
            date: threadRow.date,
            username: threadRow.thread_owner,
            comments: [],
        };

        const repliesByComment = {};
        for (const reply of repliesResult.rows) {
            const commentId = reply.comment_id;
            if (!repliesByComment[commentId]) {
                repliesByComment[commentId] = [];
            }

            repliesByComment[commentId].push({
                id: reply.reply_id,
                content: reply.reply_is_deleted ? '**balasan telah dihapus**' : reply.reply_content,
                date: reply.reply_date,
                username: reply.reply_username,
            });
        }

        for (const row of threadResult.rows) {
            if (!row.comment_id) continue;
            const comment = {
                id: row.comment_id,
                content: row.comment_is_deleted ? '**komentar telah dihapus**' : row.comment_content,
                date: row.comment_date,
                username: row.comment_username,
                replies: repliesByComment[row.comment_id] || [],
            };
            thread.comments.push(comment);
        }

        return thread;
    }
}

module.exports = ThreadRepositoryPostgres;