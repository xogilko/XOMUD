package main

// url-mud official server

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

/*//////   BLUEPRINT   ///////

	<< RESOURCE >>        (( POLICY ))        [[ TARGET ]]

	uniform interface   system that emerges from constraint where state
						is transfigured through the representation of hypermedia
	hypermedia          media that produces intersecting patterns w/ explicit controls
	hypermedia client   general interface that can interpret any hypermedia without context
						the web browser is a hypermedia client that interprets via HTML

	a schema-agnostic client may be extended out by proxy
	the web browser (DOM, XML) may be used as a temporary footstool

	cascading selection constraints:
		domain (proxy policy/technical conditions)
		resource (digital rights management)
		client (user defined preferences)
		native (hardware/user-agent defaults)

	SYNOPTIC WEB: mattdown, markup, lukewrite;
		ordinal inscriptions attest bits of data and notation
		bytes are addressed as index.utxo on the public ledger
		parallel controls point to address spans
		user queries overlay network with constraints
		proxy transfigures output using content-negotiation algorithms

	Go4 STRATEGY + Fowler TRANSFORM VIEW
	scripts may be cached and initialized in the browser real-time by proxy;
	fetched http responses may be intercepted and dependencies pre-injected into the dom.

	the market may be permitted to specialize:
		1) interface: userscripts, style, structures and applications
		2) daemon: compute, storage, middleware, constraints, and other faculties
		3) representor: interpretable namespaces and transformations for rendering

    SYNOPTIC PRINCIPLE
    an ideal uniform distributed information system is agnostic towards its elements
    it uses abstraction and extensibility to pursue an unopinionated generic interface

    HYPERMEDIATRIX INTERCESSION
    by negotiating the mediation of a session against the state of a trusted proxy, latency is made equitable

    SURFER PARADOX
    in reality only movement is real and state is an illusion
    in virtuality only state is real and movement is an illusion

    RESTFUL POSTULATE
    its impossible to know where on the web anyone is
    we can only infer based on the actions that are made

    ALICE ZERO SUM{
        overlay network simpage
            for a grid of a room via scrypt
                then arrays of objects in simpage
                    passing around tx vs trust
                    u pass a tx to the overlay which inits a websocket

    }
    base content + 2 markup options
    overlay network + query
        user preferences
        custom schema
        representor
            ordfs
        custom css
    put draggables in context
        wiki
            a series of pages
            text would be marked up with hyperlinks to other pages
        dropdown - based on inputs and events
            requires tom-select.js + plugins OR select2 based on user preference
            import a script and css / generating unique IDs for element ids? vs classes?
*/

/*
	this is for the xomud.quest website
*/

/*
	CLIENT -> LOADBALANCE -> GOVERNOR -> SUBJEX
	/call/ in order to return testkit dir and call navi
	seperate handler of main website and the xomud specific functionality
	command vs /
	maybe each call will have a prefix ? (testkit/) going to a testkit.go and following /com/
	website.go
	testkit.go
	custom header X-O-testkit-atc-set-message
	for each custom header split off into handling
*/

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// proxy box
	proxyUrl, _ := url.Parse("http://localhost:8081")
	proxy := httputil.NewSingleHostReverseProxy(proxyUrl)
	//reverse proxy handlers
	http.HandleFunc("/stem/", func(w http.ResponseWriter, r *http.Request) {
		modifiedPath := "/" + r.URL.Path[len("/stem/"):]
		log.Printf("Forwarding request to stem.go: %s", modifiedPath)
		r.URL.Path = modifiedPath
		proxy.ServeHTTP(w, r)
	})

	//serve website
	http.HandleFunc("/", seed)

	//global service
	fmt.Println("xomud is active")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
