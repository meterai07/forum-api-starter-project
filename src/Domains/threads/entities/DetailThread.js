class DetailThread {
    constructor({ thread, comments = [], replies = [] }) {
        if (!thread || !thread.id) {
            throw new Error('DETAIL_THREAD.NOT_CONTAIN_VALID_THREAD');
        }

        this.id = thread.id;
        this.title = thread.title;
        this.body = thread.body;
        this.date = thread.date;
        this.username = thread.username;

        this.comments = comments.map(comment => {
            const commentReplies = replies
                .filter(reply => reply.comment_id === comment.id)
                .map(reply => ({
                    id: reply.id,
                    content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
                    date: reply.date,
                    username: reply.username,
                }));

            return {
                id: comment.id,
                content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
                date: comment.date,
                username: comment.username,
                replies: commentReplies,
            };
        });
    }
}

module.exports = DetailThread;
