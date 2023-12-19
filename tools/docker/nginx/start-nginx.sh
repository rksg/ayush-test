#!/bin/bash
envsubst < /etc/nginx/globalValues.json.template > /usr/share/nginx/html/tenant/t/globalValues.json
nginx -g 'daemon off;'
