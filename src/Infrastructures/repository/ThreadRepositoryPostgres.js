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
        const query = {
            text: `
            SELECT 
                threads.id AS thread_id, 
                threads.title, 
                threads.body, 
                threads.date, 
                users.username AS thread_owner,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', comments.id,
                            'content', 
                            CASE 
                                WHEN comments.is_deleted THEN '**komentar telah dihapus**'
                                ELSE comments.content
                            END,
                            'date', comments.date,
                            'username', comment_users.username
                        )
                    ) FILTER (WHERE comments.id IS NOT NULL), 
                    '[]'
                ) AS comments
            FROM threads
            LEFT JOIN users ON users.id = threads.owner
            LEFT JOIN comments ON comments.thread_id = threads.id
            LEFT JOIN users AS comment_users ON comment_users.id = comments.owner
            WHERE threads.id = $1
            GROUP BY threads.id, users.username
        `,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        const thread = result.rows[0];

        // Format the response to match the required structure
        return {
            id: thread.thread_id,
            title: thread.title,
            body: thread.body,
            date: thread.date,
            username: thread.thread_owner,
            comments: thread.comments,
        };
    }
}

module.exports = ThreadRepositoryPostgres;