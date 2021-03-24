#!/bin/bash

# Take the icon.svg file and convert it to a collection of different sized png files, and then into a ico file.
# The pngs will appear in `./dist/` with the name `<size>.png` where `<size>` is the width and height of the image in px.
# The ico will appear in the current directory (`./icon.ico`)

# This script relies on Inkscape (https://inkscape.org/) and Imagemagick (https://imagemagick.org) to work

mkdir dist/

# Convert to png files
for size in 16 24 32 48 64 128 256 512
do
    inkscape -z -w $size -h $size icon.svg -e dist/$size.png
done

# Convert to windows/browser ico format
convert dist/*.png icon.ico
identify icon.ico