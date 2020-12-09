DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      signature TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );


-- here we are adding the foreign key (user_id)
 -- foreign key lets us know which user from the users table signed the petition
 -- and which signature is theirs (links the 2 tables!)

--DELETE FROM signatures;

 --TEST-- INSERT INTO signatures(first, last, signature) VALUES ('Leonardo', 'DiCaprio', 'signa');