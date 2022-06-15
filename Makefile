include .env
export $(shell sed 's/=.*//' .env)

run:
	docker-compose up

down:
	docker-compose down

bash:
	docker-compose run online-tabletop "bash"

startup:
	npm install
	npm run dev
