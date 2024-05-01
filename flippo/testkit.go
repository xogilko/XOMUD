package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
)

/*
	this server may use conditions to negotiate responses
	this can be coded into the middleware logic
	currently:
	accept * cors origin

	future: sse
*/

//	http middleware

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next(w, r)
	}
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

// respond to POST with dir contents for navi

func dirbox_send(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	// Check if the domain exists in dirDatabase
	dirName, found := dirDatabase[string(body)]
	if !found {
		dirName = dirDatabase["default"]
	}
	dirPath := "module/" + dirName.(string)

	http.ServeFile(w, r, dirPath)
}

func main() {
	router := http.NewServeMux()

	router.HandleFunc("/command/", corsMiddleware(atc_com))
	router.HandleFunc("/dirbox/", corsMiddleware(dirbox_send))

	fmt.Println("Command server is active")
	log.Fatal(http.ListenAndServe(":8081", router))
}
