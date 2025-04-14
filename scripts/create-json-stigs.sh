#! /usr/bin/env bash

set -euo pipefail
shopt -s globstar

mkdir -p public/data/stigs/schema

for file in data/stigs/**/*.xml; do
    JSON="$(yq --xml-strict-mode -p=xml -o=json <"$file")"
    ID=$(jq -r '.Benchmark.["+@id"]' <<<"$JSON")
    if [[ $ID == "null" ]]; then
        echo "No ID found in $file"
        continue
    fi
    cp "$file" "public/data/stigs/schema/$ID.xml"
    jq . <<<"$JSON" >"public/data/stigs/schema/$ID.json"
done

jq -s '[
    .[].Benchmark |
    {
        id: .["+@id"],
        title: .title | sub(" Security Technical Implementation Guide"; ""),
        description: .description,
        version: .version,
        date: .status.["+@date"],
    }
]' public/data/stigs/schema/*.json >public/data/stigs/manifest.json
