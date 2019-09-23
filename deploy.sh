#!/bin/sh

set -e
set -x

yarn install
yarn build
gsutil -m cp -r -z html,css,js,map,mjs,txt,woff,woff2,svg,json build/* gs://umpyre.com/
