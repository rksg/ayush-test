#!/bin/bash
envsubst < /etc/nginx/env.json.template > /usr/share/nginx/html/api/ui-beta/env.json
nginx -g 'daemon off;'
