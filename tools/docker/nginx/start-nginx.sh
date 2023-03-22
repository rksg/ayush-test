#!/bin/bash
envsubst < /etc/nginx/env.json.template > /usr/share/nginx/html/api/ui/env.json
nginx -g 'daemon off;'
