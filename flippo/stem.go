package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

/*
	this is for the distribution of the navi via sse
	the navi needs to have a babbage try catch and then modify X- headers for sse req
*/

// accept * (navi sse will not require xomud.quest dns origin)

// Q - need to verify header X- in middleware

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next.ServeHTTP(w, r)
	})
}

// /command/ stem functionality

func stem(w http.ResponseWriter, r *http.Request) {
	Message := template.HTMLEscapeString(r.PostFormValue("set-message"))
	log := fmt.Sprintf("<li><i>&></i> %s</li>", Message)
	tmpl, _ := template.New("t").Parse(log)
	tmpl.Execute(w, nil)
}

// server to ping component

func main() {
	router := http.NewServeMux()
	http.Handle("/command/", corsMiddleware(http.HandlerFunc(stem)))
	fmt.Println("Command server is active")
	log.Fatal(http.ListenAndServe(":8081", router))
}
