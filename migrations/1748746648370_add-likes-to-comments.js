/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('comments', {
        likes: {
            type: 'INTEGER',
            notNull: true,
            default: 0,
        },
    });
};

exports.down = pgm => {
    pgm.dropColumn('comments', 'likes', {
        ifExists: true,
    });
};
