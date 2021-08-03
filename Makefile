all: infra run
.PHONY: all

down:
	@docker-compose down -v --rmi local
.PHONY: down

infra: zookeeper kafka sqs postgres 
.PHONY: infra

kafka:
	@docker-compose up -d kafka
	@sleep 2
.PHONY: kafka

postgres:
	@docker-compose up -d postgres
	@sleep 2
.PHONY: postgres

run:
	@docker-compose up rest-server transfer-processor-worker transfer-creation-worker
.PHONY: run

sqs:
	@docker-compose up -d sqs
	@sleep 2
.PHONY: sqs

zookeeper:
	@docker-compose up -d zookeeper
	@sleep 2
.PHONY: zookeeper