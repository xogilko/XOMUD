package main

// url-mud official server

import (
	"fmt"
	"log"
	"net/http"
)

/*

pending quests:

composition -
	user , proxy, master

	usersripts, proxy servers,  components /microservices , overlay network



edge cases:
	2 hypertext swaps
	first swap has same package particular address
	second swap has same package different address
		resolving libs for injection
	barn animals all need a shower system only when its time to shower
		import map style script lazy loading

	is it possible to segregate a server response on the client-side for DRM?

go server functions (?) represent unique API that can be adapted into the overlay network's response center

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
