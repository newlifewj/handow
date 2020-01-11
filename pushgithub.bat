ren test _test
&& git add -A
&& git commit -m "Prepare pushing github repo"
&& git push github dev:master
&& git reset --hard HEAD
&& git pull
