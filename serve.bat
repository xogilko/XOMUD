@echo off

REM Change to the flippo directory and run the Go command in a new window
start cmd /c "cd flippo && go run . && pause"

REM Change to the quest directory and run the Go command in a new window
start cmd /c "cd quest && go run . && pause"

echo Done running Go commands in flippo and quest directories.