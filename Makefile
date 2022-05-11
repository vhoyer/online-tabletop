include .env
export $(shell sed 's/=.*//' .env)

run:
	docker-compose up

startup:
	npm install
	npm run dev
