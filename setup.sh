#!/usr/bin/env sh

echo 'What should we call this project?'
read PROJECT_NAME

which -s brew
if [[ $? != 0 ]] ; then
    echo 'Installing Homebrew'
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
else
    echo 'Updating Homebrew'
    brew update
fi

echo 'Installing Homebrew dependencies'
brew bundle

echo 'Installing NPM dependencies'
npm install
npm run bootstrap

for project in server web
do
    echo "Setting up \`$project\`"
    pushd $project > /dev/null
    PROJECT_NAME=$PROJECT_NAME ./setup.sh
    popd > /dev/null
done
