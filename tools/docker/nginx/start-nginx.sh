#!/bin/bash
envsubst < /etc/nginx/env.json.template > /usr/share/nginx/html/env.json
nginx -g 'daemon off;'
