
$tsWatchArgs = "node .\node_modules\typescript\bin\tsc -b . --watch"

$liveServerArgs = "node .\live-server.js"

node .\node_modules\concurrently\dist\bin\concurrently.js "$tsWatchArgs" "$liveServerArgs"