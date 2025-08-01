#! /usr/bin/env bash

export URL=$(
    curl -s 'https://public.cyber.mil/stigs/compilations/' |
        grep -o -E '"https://public.cyber.mil/wp-content/uploads/stigs/zip.*" ' |
        sed -e 's/"//g' -e 's/ $//'
)
