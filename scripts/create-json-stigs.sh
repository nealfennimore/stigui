#! /usr/bin/env bash

set -euo pipefail
shopt -s globstar

mkdir -p public/data/stigs/schema

for file in data/stigs/**/*.xml; do
    echo $file
    JSON="$(yq --xml-strict-mode -p=xml -o=json <"$file")"
    ID=$(jq -r '.Benchmark.["+@id"]' <<<"$JSON")
    jq . <<<"$JSON" >"public/data/stigs/schema/$ID.json"
done
