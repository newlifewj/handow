rmdir /Q /S devDoc && ^
rmdir /Q /S lib\render\src && ^
git add -A && ^
git commit -m "Prepare pushing to github repository" && ^
git push --force github dev:master --tags && ^
git reset --hard origin/dev
