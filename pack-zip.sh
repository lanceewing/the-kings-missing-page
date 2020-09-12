#!/usr/bin/sh
./pack-min.sh
cd zips
cp ../min.html index.html
rm *.zip
../tools/kzip.exe //b512 min_kzip.zip index.html
../tools/advzip.exe -a -4 -i 10000 min_advzip.zip index.html
cd ..