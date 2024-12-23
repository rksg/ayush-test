#!/bin/bash
envsubst < /etc/nginx/globalValues.json.template > /usr/share/nginx/html/ai/globalValues.json
nginx -g 'daemon off;'
