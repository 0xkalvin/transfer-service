all: infra run
.PHONY: all

down:
	@docker-compose down -v --rmi local
.PHONY: down

infra: zookeeper kafka sqs postgres elasticsearch
.PHONY: infra

kafka:
	@docker-compose up -d kafka
	@sleep 2
.PHONY: kafka

elasticsearch:
	@docker-compose up -d elasticsearch
	@sleep 2
.PHONY: elasticsearch

postgres:
	@docker-compose up -d postgres
	@sleep 2
.PHONY: postgres

run:
	@docker-compose up rest-server transfer-processor-worker transfer-creation-worker
.PHONY: run

repl:
	@docker-compose run --rm repl
.PHONY: repl

sqs:
	@docker-compose up -d sqs
	@sleep 2
.PHONY: sqs

zookeeper:
	@docker-compose up -d zookeeper
	@sleep 2
.PHONY: zookeeper