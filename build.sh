#!/bin/bash
cd ./src
# Install the dependencies first to avoid errors.
cd ./scoringDependencies/nodejs
npm run build
cd ../../
for folder in */ ; do
  cd "$folder"
  echo "Creating build artifacts ${PWD##*/}"
  if [[ "${PWD##*/}" == "scoringDependencies" ]]
  then
    continue
  else
    npm run build
    cd ../
  fi
done
