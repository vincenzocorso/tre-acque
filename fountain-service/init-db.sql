CREATE TABLE fountains (
    id       char(36)       NOT NULL PRIMARY KEY,
    name     varchar(100)   NOT NULL,
    location geography      NOT NULL
)