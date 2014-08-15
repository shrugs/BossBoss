#! /bin/sh
gunicorn -b api.bossboss.tk:8081 ofcourse:app