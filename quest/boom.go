package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/dgraph-io/badger/v3"
)

var dbsDB *badger.DB

func main() {
	// Initialize BadgerDB for DBS
	opts := badger.DefaultOptions("dbs_data").WithLogger(nil)
	var err error
	dbsDB, err = badger.Open(opts)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer dbsDB.Close()

	// Start migration from dbs/main directory
	startPath := "dbs/main"
	count := 0
	start := time.Now()

	err = filepath.Walk(startPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("Error accessing path %q: %v\n", path, err)
			return err
		}

		// Skip directories themselves
		if info.IsDir() {
			return nil
		}

		// Only process .json files
		if !strings.HasSuffix(strings.ToLower(path), ".json") {
			return nil
		}

		// Read the file
		data, err := ioutil.ReadFile(path)
		if err != nil {
			log.Printf("Error reading file %s: %v\n", path, err)
			return nil
		}

		// Verify it's valid JSON
		var jsonData interface{}
		if err := json.Unmarshal(data, &jsonData); err != nil {
			log.Printf("Error parsing JSON from file %s: %v\n", path, err)
			return nil
		}

		// Create key by removing "dbs/main/" prefix and ".json" suffix
		key := strings.TrimPrefix(path, startPath+"/")
		key = strings.TrimSuffix(key, ".json")

		// Store in BadgerDB
		err = dbsDB.Update(func(txn *badger.Txn) error {
			return txn.Set([]byte(key), data)
		})

		if err != nil {
			log.Printf("Error storing in BadgerDB - Key: %s, Error: %v\n", key, err)
			return nil
		}

		count++
		if count%100 == 0 {
			log.Printf("Processed %d files...\n", count)
		}

		log.Printf("Successfully migrated: %s -> %s\n", path, key)
		return nil
	})

	if err != nil {
		log.Printf("Error walking through directory: %v\n", err)
	}

	duration := time.Since(start)
	log.Printf("\nMigration completed:")
	log.Printf("Total files processed: %d", count)
	log.Printf("Time taken: %v", duration)
	log.Printf("\nVerifying migration...")

	// Verify migration
	err = dbsDB.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		it := txn.NewIterator(opts)
		defer it.Close()

		keyCount := 0
		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			k := string(item.Key())
			err := item.Value(func(v []byte) error {
				log.Printf("Found key in DB: %s (size: %d bytes)\n", k, len(v))
				return nil
			})
			if err != nil {
				return err
			}
			keyCount++
		}
		log.Printf("\nTotal keys in database: %d\n", keyCount)
		return nil
	})

	if err != nil {
		log.Printf("Error during verification: %v\n", err)
	}

	log.Println("\nPress Enter to exit...")
	fmt.Scanln() // Wait for user input before closing
}
