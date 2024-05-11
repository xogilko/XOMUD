package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"strings"
)

//	http middleware

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers for all requests
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

//cant remember if this is deprecated

func ServeFileWithMIME(w http.ResponseWriter, r *http.Request, filePath string) {
	// Set the Content-Type header based on the file extension
	contentType := "text/plain" // Default to text/plain
	if strings.HasSuffix(filePath, ".js") {
		contentType = "application/javascript"
	}
	fmt.Println("servewithmime was useful?")
	w.Header().Set("Content-Type", contentType)
	http.ServeFile(w, r, filePath)
}

// /command/ atc simulation

func atc_com(w http.ResponseWriter, r *http.Request) {
	Message := template.HTMLEscapeString(r.PostFormValue("set-message"))
	log.Printf("Received message: %s", Message) // Log the received message

	formattedLog := fmt.Sprintf("<li><i>&></i> %s</li>", Message)
	tmpl, err := template.New("t").Parse(formattedLog)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

// specific dir module responses

func dirmod_send(w http.ResponseWriter, r *http.Request) {
	// Extract the module path from the request URL
	modulePath := r.URL.Path[len("/dirmod/"):]

	// Construct the full path to the module file
	moduleFilePath := "module/" + modulePath + ".js"
	log.Printf(moduleFilePath)
	// Serve the module file
	ServeFileWithMIME(w, r, moduleFilePath)
}

// respond to POST context with dir contents for navi

func dirbox_send(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	var requestData map[string]string
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusInternalServerError)
		return
	}
	key := requestData["msg"]
	if key == "" {
		key = requestData["domain"]
	}
	dirName, found := dirDatabase[key]
	if !found {
		dirName = dirDatabase["default"]
	}
	dirPath := "module/" + dirName.(string)
	log.Printf("dirPath: " + dirPath + " key: " + key)
	http.ServeFile(w, r, dirPath)
}

func main() {
	router := http.NewServeMux()

	router.HandleFunc("/command/", corsMiddleware(atc_com))
	router.HandleFunc("/dirbox/", corsMiddleware(dirbox_send))
	router.HandleFunc("/dirmod/", corsMiddleware(dirmod_send))

	fmt.Println("Command server is active")
	log.Fatal(http.ListenAndServe(":8081", router))
}
