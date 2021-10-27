create database sample1;
\c sample1

drop table db_user;
drop table db_bbs;

create table db_user (
    name character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    session character varying(100),
    date timestamp NOT NULL
);

create table db_bbs (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    body character varying(64) COLLATE pg_catalog."default" NOT NULL,
    date timestamp NOT NULL
);

\dt
