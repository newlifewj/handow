rmdir /Q /S doc && ^
rmdir /Q /S lib\render\src && ^
git add -A && ^
git commit -m "Prepare pushing to github repository" && ^
git push --force github dev:master && ^
git reset --hard origin/dev
