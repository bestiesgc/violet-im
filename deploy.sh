#!/bin/sh
cp -rT build built
cd built
git add -A
git commit -m 'deploy'
git push -u origin page