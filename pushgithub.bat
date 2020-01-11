rmdir /Q /S doc && git add -A && git commit -m "Prepare pushing github repo" && git push --force github dev:master && git reset --hard origin/dev
