#!/bin/sh
cp -r build/* built
cd built
git add .
git commit -m 'deploy'
git push -u origin page