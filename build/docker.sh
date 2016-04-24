#!/bin/bash

ETH0_IP=$(ifconfig eth0 | grep "inet addr" | awk -F: '{print $2}' | awk '{print $1}')
ETH1_IP=$(ifconfig eth1 | grep "inet addr" | awk -F: '{print $2}' | awk '{print $1}')

API_URL="http://$ETH1_IP:3000/"

docker kill website 2>/dev/null || true
docker rm -f website 2>/dev/null || true
docker run \
  --detach \
  --restart=on-failure:5 \
  --publish $ETH0_IP:80:80 \
  --name website \
  --env HTTP_PORT=80 \
  --env API_URL=$API_URL \
  quay.io/seenproject/website
