declare -a sourcefiles=("header.js" "html.js" "util.js" "main.js")

echo "" > transfer-cleanup.user.js
for filename in sourcefiles:
    cat filename >> transfer-cleanup.user.js

# minify it or something
