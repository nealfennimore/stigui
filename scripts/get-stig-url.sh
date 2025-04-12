#! /usr/bin/env bash

export URL=$(
    curl -s 'https://public.cyber.mil/stigs/compilations/' |
        grep -o -E '"https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip.*" ' |
        sed 's/"//g'
)
