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
	if !strings.HasSuffix(modulePath, ".js") {
		modulePath += ".js"
	}
	moduleFilePath := "module/" + modulePath
	log.Printf("dirmod serving: %s", moduleFilePath)
	http.ServeFile(w, r, moduleFilePath)
}

// respond to POST context with dir contents for navi

func dirbox_send(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	//for name, values := range r.Header {
	// http currently free for this server
	//log.Printf("Header name: %s, Header values: %v", name, values)
	//}
	var requestData map[string]interface{}
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusInternalServerError)
		return
	}
	//	REQUEST LOGIC
	client, ok := requestData["client"].(map[string]interface{})
	if !ok {
		http.Error(w, "Invalid client data", http.StatusBadRequest)
		return
	}
	uriInterface, ok := client["uri"].([]interface{})
	if !ok {
		http.Error(w, "URI data is missing or not a string", http.StatusBadRequest)
		return
	}
	hostName, ok := client["href"].(string)
	if !ok {
		http.Error(w, "Host data is missing or not a string", http.StatusBadRequest)
		return
	}
	// Split the uriString into individual URIs
	var uris []string
	for _, uri := range uriInterface {
		uriStr, ok := uri.(string)
		if !ok {
			http.Error(w, "URI contains non-string elements", http.StatusBadRequest)
			return
		}
		uris = append(uris, uriStr)
	}
	var urls []string
	// Check each URI in the 'uri' section of dirDatabase
	for _, uri := range uris {
		if dirNames, ok := dirDatabase["uri"].(map[string]interface{})[uri].([]string); ok {
			for _, dirName := range dirNames {
				urls = append(urls, "/flippo/dirmod/"+dirName)
			}
		}
	}
	// Check the hostname and uri in the 'hosts' section of dirDatabase
	if hostEntries, ok := dirDatabase["hosts"].(map[string]interface{})[hostName].(map[string]interface{}); ok {
		for _, uri := range uris {
			if dirNames, ok := hostEntries[uri].([]string); ok {
				for _, dirName := range dirNames {
					urls = append(urls, "/flippo/dirmod/"+dirName)
				}
			}
		}
	}
	log.Printf("dirbox urls: %s", urls)
	// Convert the list of URLs to JSON and send it back to the client
	jsonResponse, err := json.Marshal(urls)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func main() {
	router := http.NewServeMux()

	router.HandleFunc("/command/", atc_com)
	//atc tower simulation for mud style clients
	router.HandleFunc("/dirbox/", dirbox_send)
	//a post request is received for a directory
	router.HandleFunc("/dirmod/", dirmod_send)
	//a get request is received for import of js module

	fmt.Println("Command server is active")
	log.Fatal(http.ListenAndServe(":8081", router))
}
