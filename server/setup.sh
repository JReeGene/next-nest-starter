#!/usr/bin/env sh

[ -z "$PROJECT_NAME" ] && echo '$PROJECT_NAME is not set' && exit 1

echo 'Setting up .env'
echo "PROJECT_NAME=${PROJECT_NAME}" >> .env.example
cp .env.example .env

echo 'Setting up database'
createdb "${PROJECT_NAME}_development"
createdb "${PROJECT_NAME}_test"
createuser admin
psql -d postgres -c "alter user admin with encrypted password 'password'"
psql -d postgres -c "grant all privileges on database ${PROJECT_NAME}_development to admin"
psql -d postgres -c "grant all privileges on database ${PROJECT_NAME}_test to admin"
