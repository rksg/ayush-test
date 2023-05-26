#!/bin/bash
envsubst < /etc/nginx/env-ra.json.template > /usr/share/nginx/html/analytics/next/env-ra.json
nginx -g 'daemon off;'
