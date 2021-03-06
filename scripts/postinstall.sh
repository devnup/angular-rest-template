#!/bin/sh

echo "----------------------------------------";
echo "Cleaning dist files...";
rm -rf lib/src/dist;

echo "----------------------------------------";
echo "Installing bower components...";
./node_modules/bower/bin/bower install --config.interactive=false -F;

echo "----------------------------------------";
echo "Building files using Grunt...";
./node_modules/grunt-cli/bin/grunt default;

echo "----------------------------------------";
echo "Generating docs using JSDoc...";
rm -rf lib/docs;
./node_modules/jsdoc/jsdoc.js -c conf.json;

echo "----------------------------------------";
echo "Post install script OK!";
echo "----------------------------------------";

exit 0;