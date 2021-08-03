# Transfer service

A simple, over-engineered Node.js bank transfer system that leverages (or tries to) hexagonal architecture. 

## Requirements

- Must support creating accounts and transfers.
- Must support creating transfer through a REST API and SQS queue.
- Transfer should be enqueued so it can be processed in background async. 
- Should use at least 2 message queues and 2 databases. Oh yes!

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

## SQS
todo