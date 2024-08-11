CREATE DATABASE IF NOT EXISTS trade_planner;

CREATE USER IF NOT EXISTS 'svc-trade-planner'@'localhost' identified by ; # enter password

GRANT ALL PRIVILEGES ON trade_planner.* TO 'svc-trade-planner'@'localhost'; # todo: clean up privileges

FLUSH PRIVILEGES;