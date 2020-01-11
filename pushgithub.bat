ren doc _doc
&& git add -A
&& git commit -m "Prepare pushing github repo"
&& git push github dev:master
&& git fetch origin
&& git reset --hard origin/dev
&& rmdir /Q /S _doc
