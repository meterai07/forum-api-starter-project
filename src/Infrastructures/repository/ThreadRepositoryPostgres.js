const InvariantError = require("../../Commons/exceptions/InvariantError");
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
            text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username
                   FROM threads
                   LEFT JOIN users ON users.id = threads.owner
                   WHERE threads.id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Thread tidak ditemukan');
        }

        return result.rows[0];
    }
}

module.exports = ThreadRepositoryPostgres;