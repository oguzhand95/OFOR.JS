CREATE TABLE IF NOT EXISTS `exams` (
  `name` varchar(64) NOT NULL,
  `answer_key` varchar(360) NOT NULL,
  `teacher_name` varchar(64) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `exams` (`name`, `answer_key`, `teacher_name`) VALUES
('Final YGS-2', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'bahadirali'),
('Final YGS-3', 'bbbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'oguzhandurgun');

CREATE TABLE IF NOT EXISTS `token` (
  `username` varchar(64) NOT NULL,
  `token` varchar(7) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(64) NOT NULL,
  `password` varchar(512) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


INSERT INTO `users` (`username`, `password`) VALUES
('bali', '202cb962ac59075b964b07152d234b70');

ALTER TABLE `token`
  ADD CONSTRAINT `restrict_username_token` FOREIGN KEY (`username`) REFERENCES `users` (`username`);

