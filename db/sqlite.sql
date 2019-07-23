
CREATE TABLE commands (
 seq integer PRIMARY KEY AUTOINCREMENT,
 command_name text NOT NULL DEFAULT '',
 description text NOT NULL DEFAULT '',
 filepath text NOT NULL DEFAULT '',
 deleted_yn text NOT NULL DEFAULT 'N',
 create_date text NOT NULL DEFAULT '0000-00-00 00:00:00'
);


CREATE TABLE devices (
 seq integer PRIMARY KEY AUTOINCREMENT,
 device_name text NOT NULL DEFAULT '',
 ip_address text NOT NULL DEFAULT '0.0.0.0',
 username text NOT NULL DEFAULT '',
 password text NOT NULL DEFAULT '',
 enable_pw text NOT NULL DEFAULT '',
 deleted_yn text NOT NULL DEFAULT 'N',
 create_date text NOT NULL DEFAULT '0000-00-00 00:00:00'
);

CREATE TABLE users (
 seq integer PRIMARY KEY AUTOINCREMENT,
 user_id text NOT NULL DEFAULT '',
 user_pw text NOT NULL DEFAULT '',
 user_name text NOT NULL DEFAULT '',
 deleted_yn text NOT NULL DEFAULT 'N',
 create_date text NOT NULL DEFAULT '0000-00-00 00:00:00'
);

INSERT INTO `users` (`seq`, `user_id`, `user_pw`, `user_name`)
VALUES (1,'admin','Zo5lTDZT9cMG6BIlM4nR51PMHhDbz3wSFL19tOVE+P5iNTpqDQOz0czvyF8UPX3F6Bo+O8WPbDrMG7RHUaNZMq3keqCU9GHqVIJLiOOh5zVXPPX/7pCSkRMd4wvGfP/+vtATRXxzM1d80+5rKjkqsJUeyrLEi60VMtGqd6e/4mouAkcLHIQs/uM42MAsGUHci77nSZJ9SGShNpiesXg/03EKFjTUElfDBF/q5rbprh9KOBmg/YWw8J3LT6u+USpAZbf1IboFomwNvAmfPHkO0D91m7IxkZ1/XXY2bGGrs0ash0zlsm/lstte6diZkKQupBxUb8UXUmFGQDG59MPbhg==','Admin');
