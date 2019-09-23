#!/bin/sh

set -e
set -x

yarn install
yarn build
gsutil -m rsync -r -x index.html -z html,css,js,txt build gs://umpyre.com/
gsutil -m rsync -r build gs://umpyre.com/
