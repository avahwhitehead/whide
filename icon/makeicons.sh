#!/bin/bash

# Take the icon.svg file and convert it to a collection of different sized png files, and then into ico and icns files.
# The pngs will appear in `./dist/` with the name `<size>.png` where `<size>` is the width and height of the image in px.
# The ico and icns files will appear in the current directory (`./icon.ico` and `./icon.icns`)

# This script relies on the following applications to work:
# * Inkscape (https://inkscape.org/)
# * Imagemagick (https://imagemagick.org)
# * png2icns (https://manpages.ubuntu.com/manpages/hirsute/en/man1/png2icns.1.html)

mkdir dist/

# Convert to png files
for size in 16 24 32 48 64 128 256 512
do
    inkscape -z -w $size -h $size icon.svg -e dist/$size.png
done

# Convert to mac icns format
png2icns icon.icns dist/512.png

# Convert to windows/browser ico format
convert dist/*.png icon.ico
identify icon.ico