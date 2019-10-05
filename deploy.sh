#!/bin/sh

set -e
set -x

rm -rf build
yarn install
yarn build
gsutil -m cp -r -z html,css,js,map,mjs,txt,woff,woff2,svg,json build/static/* gs://umpyre.com/static/
yarn run react-snap
# remove root index.html
rm build/index.html
gsutil -m cp -r -z html,css,js,map,mjs,txt,woff,woff2,svg,json build/* gs://umpyre.com/
