
#!/bin/sh

if [ $APP_NAME = "rest_server" ] 
then
    exec node /app/src/entrypoints/rest-server.js
elif [ $APP_NAME = "transfer_creation_worker" ]
then
    exec node /app/src/entrypoints/transfer-creation-worker.js
elif [ $APP_NAME = "transfer_processor_worker" ]
then
    exec node /app/src/entrypoints/transfer-processor-worker.js
else
    echo "No entrypoint for this app name"
fi
