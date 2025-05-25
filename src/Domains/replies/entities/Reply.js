class Reply {
    constructor({ id, content, date, isDeleted, commentId, username }) {
        this.id = id;
        this.content = content;
        this.date = date;
        this.isDeleted = isDeleted;
        this.commentId = commentId;
        this.username = username;
    }
}

module.exports = Reply;
