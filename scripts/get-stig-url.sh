#! /usr/bin/env bash

MONTH_YEAR=$(
    date --date="$(date +%Y-%-m-01) -$(((($(date +%-m) - 1) % 3))) month" "+%B_%Y"
)

export URL="https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_SRG-STIG_Library_$MONTH_YEAR.zip"
