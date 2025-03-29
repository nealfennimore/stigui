#! /usr/bin/env bash

set -euo pipefail
shopt -s globstar

if [[ ! -f "data/stigs.zip" ]]; then
    echo "Downloading STIGs..."
    curl -L https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_SRG-STIG_Library_January_2025.zip -o data/stigs.zip

    unzip -o data/stigs.zip -d data/stigs

    ARGS=()
    for archive in data/stigs/*.zip; do
        ARGS+=("$archive" "${archive%.zip}")
    done

    parallel -v -N2 unzip -d "{2}" "{1}" ::: "${ARGS[@]}"

    sudo chown -R $USER: data/stigs
    sudo find data/stigs -type d -exec chmod 755 {} \;
else
    echo "STIGs already downloaded."
fi

for file in data/stigs/**/*.xml; do
    output_file="${file%.xml}.json"
    if [[ ! -f "$output_file" ]]; then
        yq --xml-strict-mode -p=xml -o=json <"$file" >"$output_file"
    fi
done
