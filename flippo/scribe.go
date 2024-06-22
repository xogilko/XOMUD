package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
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

// sqlite for the management of json
func book_init() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "file:flippo_database?cache=shared&mode=rwc")
	if err != nil {
		return nil, err
	}

	// Create a table if it doesn't exist
	createTableSQL := `CREATE TABLE IF NOT EXISTS pages (
		page_name TEXT,
		key TEXT,
		value TEXT NOT NULL,
		PRIMARY KEY (page_name, key)
	);`
	_, err = db.Exec(createTableSQL)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// book_write adds a new entry to a specified page in the database
func book_write(db *sql.DB, pageName, key string, value map[string]interface{}) error {
	valueJSON, err := json.Marshal(value)
	if err != nil {
		return err
	}

	insertSQL := `INSERT INTO pages (page_name, key, value) VALUES (?, ?, ?)`
	statement, err := db.Prepare(insertSQL)
	if err != nil {
		return err
	}
	_, err = statement.Exec(pageName, key, string(valueJSON))
	return err
}

// book_read retrieves an entry from a specified page in the database
func book_read(db *sql.DB, pageName, key string) (map[string]interface{}, error) {
	row := db.QueryRow("SELECT value FROM pages WHERE page_name = ? AND key = ?", pageName, key)

	var valueJSON string
	err := row.Scan(&valueJSON)
	if err != nil {
		return nil, err
	}

	var value map[string]interface{}
	err = json.Unmarshal([]byte(valueJSON), &value)
	if err != nil {
		return nil, err
	}

	return value, nil
}
