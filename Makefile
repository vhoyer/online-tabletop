include .env
export $(shell sed 's/=.*//' .env)

run:
	docker-compose up

bash:
	docker-compose run online-tabletop "bash"

startup:
	npm install
	npm run dev
