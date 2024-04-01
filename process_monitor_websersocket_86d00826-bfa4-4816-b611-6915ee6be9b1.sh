pid_websersocket=$(pgrep -f "websersocket_86d00826-bfa4-4816-b611-6915ee6be9b1.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd