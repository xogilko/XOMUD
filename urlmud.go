package main

// url-mud official server

import (
	"fmt"
	"log"
	"net/http"
)

/*

pending quests:

remove es static import maps entirely

*/

func main() {

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	//server op

	http.HandleFunc("/", seed)
	http.HandleFunc("/command/", stem)

	fmt.Println("xomud is active")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
