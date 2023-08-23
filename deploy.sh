#!/bin/sh
cp -rT build built
cd built
rm -rf .git
git init
git remote add origin git@git.gay:besties/violet-im
git checkout -b page
git add -A
git commit -m 'deploy'
git push -u origin page --force