package main

import (
	"log"
	"os"
	"time"
)

var logEntries = make(chan string, 1000) // Buffered channel

func initLogger() {
	file, err := os.OpenFile("flippo.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for entry := range logEntries {
			if _, err := file.WriteString(time.Now().Format(time.RFC3339) + " " + entry + "\n"); err != nil {
				log.Printf("Error writing to log file: %v", err)
			}
		}
	}()
}

func logEntry(message string) {
	logEntries <- message // Non-blocking send to the channel
}

func catalog(logFileName, message string) error {
	// Open the log file with append mode, create if not exists
	file, err := os.OpenFile("log/"+logFileName+".log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close() // Ensure file is closed after writing

	// Prepare log entry with timestamp
	logEntry := message + " " + time.Now().Format(time.RFC3339) + "\n"

	// Write the log entry to the file
	if _, err := file.WriteString(logEntry); err != nil {
		return err
	}

	return nil
}
