package main

import (
	"bytes"
	"io"
	"net/http"
)

//navi reports context, based on it, court is asked to provide dir

func spawn(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method!! not allowed??", http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	// Create client and request *hardcoded testkit* hit court members
	client := &http.Client{}
	req, err := http.NewRequest("POST", serviceURLs["testkit"]+"/dirbox", bytes.NewBuffer(body))
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	} //send request
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to send request", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	// Write response back to client
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}
