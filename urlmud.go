package main

// url-mud official server

import (
	"fmt"
	"log"
	"net/http"
)

/*

pending quests:

go server functions (?) represent unique API that can be adapted into the overlay network's response center

current pieces:

seed = mapping of template and rendering the initial webpage

stem = functionality for the cli (and other basic components)
	what basic components will we use:
		cli
		guide
		task manager
		market

*/

func main() {

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.HandleFunc("/", seed)
	http.HandleFunc("/command/", stem)

	fmt.Println("xomud is active")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
