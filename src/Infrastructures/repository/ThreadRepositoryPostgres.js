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

        try {
            const result = await this._pool.query(query);
            return result.rows[0];
        } catch (error) {
            throw new InvariantError('Tidak dapat membuat thread dengan user yang tidak valid');
        }
    }

    async getThreadById(id) {
        const query = {
            text: `
                SELECT threads.id, threads.title, threads.body, threads.date, users.username
                FROM threads
                JOIN users ON users.id = threads.owner
                WHERE threads.id = $1
            `,
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Thread tidak ditemukan');
        }

        return result.rows[0];
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