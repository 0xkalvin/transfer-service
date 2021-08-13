# Transfer service

A simple, over-engineered Node.js bank transfer system that leverages ~~or tries to~~ hexagonal architecture. It's an in progress project to play around and have fun, feel free to contribute by any means. 

## Requirements

- Must support creating accounts and transfers.
- Must support creating transfer through a REST API, a SQS queue, a GRPC API, and also a REPL. That's what "Transporters" are, alternative ways of inputting data in this application for interacting with the business entities.
- When a transfer is processed, accounts' balances should be updated.
- Must use a couple of databases and messaging queues for the sweet purpose of over engineering :joy:

## Architecture

- Two servers: one using REST and one using GRPC.
- Two queue workers: one consuming a SQS queue and one using Kafka.
- Databases: Postgres for transactional data, Elasticsearch for fast reads/reporting, and Redis for ephemeral data such as Idempotency keys.
- Each Idempotency key used for creating a transfer should cease to exist after 24 hours. 
- When a transfer created, it is persisted on a Postgres's table, replicated to an Elasticseach storage  
, and its Idempotency key is inserted in Redis Layer for 24 hours of timespan.
- When a Transfer is created, it must be enqueued in a Kafka topic so it can be processed in background async.  


## Folder structure 

```text
src
├── data-sources
│   ├── elasticsearch
│   │   ├── config.js
│   │   └── index.js
│   ├── kafka
│   │   ├── client.js
│   │   ├── config.js
│   │   ├── consumer.js
│   │   ├── index.js
│   │   └── producer.js
│   ├── postgres
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── migrations
│   │   │   ├── 20210803012952-create-accounts.js
│   │   │   └── 20210803013010-create-transfers.js
│   │   └── models
│   │       ├── account.js
│   │       ├── index.js
│   │       └── transfer.js
│   ├── redis
│   │   ├── config.js
│   │   └── index.js
│   └── sqs
│       ├── client.js
│       ├── config.js
│       ├── index.js
│       ├── local-setup.conf
│       └── poller.js
├── lib
│   ├── business-errors.js
│   └── logger.js
├── repositories
│   ├── account
│   │   └── index.js
│   └── transfer
│       └── index.js
├── services
│   ├── account
│   │   └── index.js
│   └── transfer
│       └── index.js
└── transporters
    ├── grpc
    │   ├── controllers
    │   │   ├── account.js
    │   │   └── transfer.js
    │   ├── entrypoint.js
    │   └── proto
    │       ├── account.proto
    │       ├── shared.proto
    │       └── transfer.proto
    ├── kafka
    │   └── entrypoint.js
    ├── repl
    │   └── entrypoint.js
    ├── rest
    │   ├── application.js
    │   ├── controllers
    │   │   ├── account
    │   │   │   └── index.js
    │   │   └── transfer
    │   │       └── index.js
    │   ├── entrypoint.js
    │   ├── http-errors.js
    │   └── middlewares
    │       ├── error-handler.js
    │       ├── http-logger.js
    │       ├── validator-handler.js
    │       └── wrap-async.js
    └── sqs
        ├── entrypoint.js
        ├── process.js
        └── processors
            ├── index.js
            └── transfers
                └── index.js
```

## Running locally

Requirements:
- Docker
- Docker compose
- Unix-like OS

After fulling all requirements, start everything up by running
```sh
make
```

Then you will find running:
- a Http server listening on port 3000
- Postgres + Elasticsearch + redis containers 
- kafka + zookeeper + sqs containers


Check out the api reference below for details about how to call each endpoint :) 

## REPL

To start up the repl, just run 
```sh
make repl
```

In the repl, you can also create a transfer as following

```js
await createTransfer({ sourceAccountId: "f0916334-e4eb-43cb-b9eb-a2a9e89277e3", targetAccountId: "b4703965-b530-4941-b6e0-c975dce98ac9", transferAmount: 15 })
```

## REST API

### POST /accounts

Request
```sh
curl -XPOST http://localhost:3000/accounts \
  --header 'Content-Type: application/json' \
  --data '{
  "amount": 1,
  "source_account_id": "acc_ckqe3n57o00040jtl4yuz2jh5",
  "target_account_id": "acc_ckqe3n83w00070jtl1tz52p8g"
}'
```
Response (status code 201)
```json
{
    "id": "45ba22be-ac12-4693-9e21-e7ba3ca279d0",
    "balance": 100000,
    "holder_name": "Bojack Horseman",
    "holder_document_number": "12345678910"
}
```

### GET /accounts/:id

Request
```sh
curl http://localhost:3000/accounts/1
```

Response
```json
{
    "id": "45ba22be-ac12-4693-9e21-e7ba3ca279d0",
    "balance": 100000,
    "holder_name": "Bojack Horseman",
    "holder_document_number": "12345678910"
}
```

### GET /accounts/:id/transfers

Request
```sh
curl http://localhost:3000/accounts/1/transfers
```

Response
```json
[
    {
        "id": "ce4ae758-cf95-412a-a603-275fd22f5991",
        "amount": 1,
        "source_account_id": "acc_ckqe3n57o00040jtl4yuz2jh5",
        "target_account_id": "acc_ckqe3n83w00070jtl1tz52p8g",
        "status": "failed"
    },
    {
        "id": "ce4ae758-cf95-412a-a603-275fd22f5992",
        "amount": 1,
        "source_account_id": "acc_ckqe3n57o00040jtl4yuz2jh5",
        "target_account_id": "acc_ckqe3n83w00070jtl1tz52p8g",
        "status": "pending"
    }
    {
        "id": "ce4ae758-cf95-412a-a603-275fd22f5993",
        "amount": 1,
        "source_account_id": "acc_ckqe3n57o00040jtl4yuz2jh5",
        "target_account_id": "acc_ckqe3n83w00070jtl1tz52p8g",
        "status": "settled"
    }
]
```

### POST /transfers
Request
```sh
curl -XPOST http://localhost:3000/transfers \
  --header 'Content-Type: application/json' \
  --data '{
  "amount": 1,
  "source_account_id": "acc_ckqe3n57o00040jtl4yuz2jh5",
  "target_account_id": "acc_ckqe3n83w00070jtl1tz52p8g"
}'
```

Response (status code 201)
```json
{
    "id": "ce4ae758-cf95-412a-a603-275fd22f599f",
    "amount": 1,
    "source_account_id": "acc_ckqe3n57o00040jtl4yuz2jh5",
    "target_account_id": "acc_ckqe3n83w00070jtl1tz52p8g",
    "status": "pending"
}
```


## TODO
- decouple Kafka  transporter
- Add database transations
- Add schemas
