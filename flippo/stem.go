package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

// accept *
// Q - need to verify header X- in middleware
// Q - need to route navi to 8081 + add verification header

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next(w, r)
	}
}

// /command/ stem functionality

func stem(w http.ResponseWriter, r *http.Request) {
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

// server to ping component

func main() {
	router := http.NewServeMux()
	router.HandleFunc("/command/", corsMiddleware(stem))
	fmt.Println("Command server is active")
	log.Fatal(http.ListenAndServe(":8081", router))
}