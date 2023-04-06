#!/bin/bash
envsubst < /etc/nginx/env.json.template > /usr/share/nginx/html/tenant/t/env.json
nginx -g 'daemon off;'
