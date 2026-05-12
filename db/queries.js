const pool = require("./pool");

exports.findMsg = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM member_messages WHERE id = $1`,
    [id],
  );
  return rows[0];
};

exports.getAllMsgs = async () => {
  const { rows } = await pool.query(
    `
    SELECT 
      m.*,
      u.first_name,
      u.last_name 
    FROM member_messages m 
    JOIN member_users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
    `,
  );
  return rows;
};

exports.addUser = async (info, password) => {
  const { firstName, lastName, username } = info;
  await pool.query(
    `
    INSERT INTO member_users (first_name, last_name, username, password) 
    VALUES ($1, $2, $3, $4)
    `,
    [firstName, lastName, username, password],
  );
};

exports.addMsg = async (info, user) => {
  const { title, message } = info;
  await pool.query(
    `
    INSERT INTO member_messages (title, text, user_id) VALUES ($1, $2, $3)
    `,
    [title, message, user.id],
  );
};

exports.deleteMsg = async (id) => {
  await pool.query(`DELETE FROM member_messages WHERE id = $1`, [id]);
};

exports.getUser = async (field) => {
  let user;
  if (typeof field === "number") {
    const { rows } = await pool.query(
      `SELECT * FROM member_users where id = $1`,
      [field],
    );
    user = rows[0];
  } else {
    const { rows } = await pool.query(
      `SELECT * FROM member_users where username = $1`,
      [field],
    );
    user = rows[0];
  }
  return user;
};

exports.makeAdmin = async (id) => {
  await pool.query(
    `
      UPDATE member_users
      SET 
        is_admin = $1,
        is_member = $2
      WHERE id = $3
    `,
    [true, true, id],
  );
};

exports.makeMember = async (id) => {
  await pool.query(
    `
      UPDATE member_users
      SET is_member = $1
      WHERE id = $2
    `,
    [true, id],
  );
};
