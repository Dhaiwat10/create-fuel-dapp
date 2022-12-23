services-run:
	docker compose up -d

services-clean:
	docker ps --filter name=my-fuel-dapp* -aq | xargs docker stop | xargs docker rm -f
	docker volume ls --filter name=my-fuel-dapp* -q | xargs docker volume rm

deploy-contract:
	cd contract && ~/.fuelup/bin/forc build && ~/.fuelup/bin/forc deploy --url 0.0.0.0:4000 --unsigned

test:
	cd frontend && npm install && npm run test