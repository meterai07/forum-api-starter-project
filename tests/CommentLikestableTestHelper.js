/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
    async addLike({
        id = 'like-123',
        commentId = 'comment-123',
        owner = 'user-123',
    }) {
        const query = {
            text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES($1, $2, $3)',
            values: [id, commentId, owner],
        };

        await pool.query(query);
    },

    async findLikeById(id) {
        const query = {
            text: 'SELECT * FROM comment_likes WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async findLikesByCommentId(commentId) {
        const query = {
            text: 'SELECT * FROM comment_likes WHERE comment_id = $1',
            values: [commentId],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async findLikesByOwner(owner) {
        const query = {
            text: 'SELECT * FROM comment_likes WHERE owner = $1',
            values: [owner],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async findLikeByCommentAndOwner(commentId, owner) {
        const query = {
            text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND owner = $2',
            values: [commentId, owner],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async removeLike(commentId, owner) {
        const query = {
            text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
            values: [commentId, owner],
        };

        await pool.query(query);
    },

    async removeLikeById(id) {
        const query = {
            text: 'DELETE FROM comment_likes WHERE id = $1',
            values: [id],
        };

        await pool.query(query);
    },

    async cleanTable() {
        await pool.query('TRUNCATE TABLE comment_likes CASCADE');
    },

    async getAllLikes() {
        const query = {
            text: 'SELECT * FROM comment_likes ORDER BY id',
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async getLikeCount() {
        const query = {
            text: 'SELECT COUNT(*) as count FROM comment_likes',
        };

        const result = await pool.query(query);
        return parseInt(result.rows[0].count);
    },

    async getLikeCountByComment(commentId) {
        const query = {
            text: 'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1',
            values: [commentId],
        };

        const result = await pool.query(query);
        return parseInt(result.rows[0].count);
    },

    async getLikeCountByOwner(owner) {
        const query = {
            text: 'SELECT COUNT(*) as count FROM comment_likes WHERE owner = $1',
            values: [owner],
        };

        const result = await pool.query(query);
        return parseInt(result.rows[0].count);
    },

    async checkUserLiked(commentId, owner) {
        const query = {
            text: 'SELECT EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = $1 AND owner = $2) as liked',
            values: [commentId, owner],
        };

        const result = await pool.query(query);
        return result.rows[0].liked;
    },

    async cleanTable() {
        await pool.query('DELETE FROM comment_likes WHERE 1=1');
    },
};

module.exports = CommentLikesTableTestHelper;