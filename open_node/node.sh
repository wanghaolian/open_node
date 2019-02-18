#!/bin/bash
SERVICE_NAME=open_node
HOME=./
PID_PATH_NAME=$HOME./pid/open_node.pid
port=8281
pid=$(netstat -nlp | grep $port | awk '{print $7}' | awk -F"/" '{ print $1 }');
	if [ -n "$pid" ]; then
	kill -9 $pid
		echo "$SERVICE_MAME kill $pid success ..."
	fi
case $1 in 
	start)
        echo "Starting $SERVICE_NAME ..."
        if [ ! -f $PID_PATH_NAME ]; then
            cd $HOME/

            nohup npm start &

                        echo $! > $PID_PATH_NAME
            echo "$SERVICE_NAME started ..."
        else
            echo "$SERVICE_NAME is already running ..."
        fi
    ;;
	stop) 
	if [ -f $PID_PATH_NAME ]; then 
	rm -rf $PID_PATH_NAME
	echo "$SERVICE_NAME Stoping... "
	else 
	echo "$SERVICE_NAME is not running ... "
	fi 
    ;;
esac

	


