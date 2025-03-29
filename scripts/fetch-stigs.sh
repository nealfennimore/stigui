#! /usr/bin/env bash

shopt -s globstar

if [[ ! -f "data/stigs.zip" ]]; then
    echo "Downloading STIGs..."
    curl -L https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_SRG-STIG_Library_January_2025.zip -o data/stigs.zip
    unzip -o data/stigs.zip -d data/stigs
else
    echo "STIGs already downloaded."
fi

parallel unzip ::: data/stigs/*.zip
