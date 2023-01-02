#!/bin/sh

while true
do
    echo "---- Running check $(date) ----"
    npm run task:check
    echo "---- Run Finished.  Waiting ${CHECK_WAIT} ----"
    sleep ${CHECK_WAIT}
done
