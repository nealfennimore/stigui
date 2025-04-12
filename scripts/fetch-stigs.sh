#! /usr/bin/env bash

set -euo pipefail
shopt -s globstar

if [[ ! -f "data/stigs.zip" ]]; then
    echo "Downloading STIGs from $URL"
    curl -L "$URL" -o data/stigs.zip

    unzip -o data/stigs.zip -d data/stigs

    ARGS=()
    for archive in data/stigs/*/*.zip; do
        echo $archive
        ARGS+=("$archive" "${archive%.zip}")
    done

    parallel -N2 unzip -o -d "{2}" "{1}" ::: "${ARGS[@]}"

    sudo chown -R $USER: data/stigs
    sudo find data/stigs -type d -exec chmod 755 {} \;
else
    echo "STIGs already downloaded."
fi
