require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const createTables = `
  DROP TABLE IF EXISTS member_messages;
  DROP TABLE IF EXISTS member_users;
  
  CREATE TABLE member_users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    is_member BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false
  );

  CREATE TABLE member_messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES member_users(id)
  );
`;

const seedData = async (client) => {
  const seedPassword = process.env.SEED_PASS || "password123";
  if (!process.env.SEED_PASS) {
    console.warn("SEED_PASS is not set. Using fallback seed password.");
  }

  const password = await bcrypt.hash(seedPassword, 10);
  const { rows } = await client.query(
    `
    INSERT INTO member_users
     (first_name, last_name, username, password, is_member, is_admin)
    VALUES 
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18)
    RETURNING id
    `,
    [
      "Maya",
      "Patel",
      "maya",
      password,
      true,
      false,
      "Noah",
      "Brooks",
      "noah",
      password,
      true,
      true,
      "Lena",
      "Torres",
      "lena",
      password,
      false,
      false,
    ],
  );

  await client.query(
    `
    INSERT INTO member_messages (title, text, user_id)
    VALUES
      ($1, $2, $3),
      ($4, $5, $6),
      ($7, $8, $9),
      ($10, $11, $12),
      ($13, $14, $15)
    `,
    [
      "Welcome to the clubhouse",
      "First round is on the house. Keep the secrets inside.",
      rows[0].id,
      "Late night deploy",
      "The dashboard finally loaded without throwing a stack trace.",
      rows[1].id,
      "Quiet announcement",
      "Membership unlocks the names, but the stories stay interesting.",
      rows[0].id,
      "Admin note",
      "Delete powers are active, so use them carefully.",
      rows[1].id,
      "Still outside",
      "I can post, but I still need the passcode to see who wrote what.",
      rows[2].id,
    ],
  );
};

const main = async () => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  await client.query(createTables);
  await seedData(client);
  await client.end();
};
main();
