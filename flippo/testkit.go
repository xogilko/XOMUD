package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
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

	// Construct the full path to the module file
	moduleFilePath := "module/" + modulePath + ".js"
	log.Print(moduleFilePath)
	// Serve the module file
	http.ServeFile(w, r, moduleFilePath)
}

// respond to POST context with dir contents for navi

func dirbox_send(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	for name, values := range r.Header {
		// http currently free for this server
		log.Printf("Header name: %s, Header values: %v", name, values)
	}
	var requestData map[string]interface{}
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusInternalServerError)
		return
	}
	//	REQUEST LOGIC
	var key string

	msg := requestData["msg"].(map[string]interface{})
	client := requestData["client"].(map[string]interface{})

	/*

		we want to give uri dir
		then
		we want to give hostname(uri) dir

	*/

	if value, ok := msg["someKey"].(string); ok {
		key = value
	}
	if hostname, ok := client["href"].(string); ok {
		key = hostname
	}

	// search database for matching key
	dirName, found := dirDatabase[key]
	if !found {
		dirName = dirDatabase["default"] //give them the default key value
	}
	//construct path to response payload
	dirPath := "module/" + dirName.(string)
	log.Printf("dirPath: " + dirPath + " key: " + key)

	// seems likely this will have to send a list of URLS
	// and then dirmod is used to send more requests for individual files
	// instead of bundling all the files

	//serve the payload
	http.ServeFile(w, r, dirPath)
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
