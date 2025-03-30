#! /usr/bin/env bash

set -euo pipefail
shopt -s globstar

for file in data/stigs/**/*.xml; do
    echo $file
    JSON="$(yq --xml-strict-mode -p=xml -o=json <"$file")"
    ID=$(jq -r '.Benchmark.["+@id"]' <<<"$JSON")
    jq . <<<"$JSON" >public/data/stigs/"$ID".json
done
