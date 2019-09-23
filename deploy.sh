#!/bin/sh

set -e
set -x

yarn install
yarn build
gsutil -m cp -r -z html,css,js,txt build gs://umpyre.com/
