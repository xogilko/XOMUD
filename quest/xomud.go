package main

// url-mud official server

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

/* * * * * *  BLUEPRINT  * * * * * *

	<< RESOURCE >>        (( POLICY ))        [[ TARGET ]]

	uniform interface   system that emerges from constraint where state
						is transfigured through the representation of hypermedia
	hypermedia          media that produces intersecting patterns w/ explicit controls
	hypermedia client   general interface that can interpret any hypermedia without context
						the web browser is a hypermedia client that interprets via HTML

	a schema-agnostic client may be extended out by proxy
	the web browser (DOM, XML) may be used as a temporary footstool

	cascading selection constraints:
		server (proxy policy/technical conditions)
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

	poc:
        wiki
            a series of pages
            text would be marked up with hyperlinks to other pages
        dropdown - based on inputs and events
            requires tom-select.js + plugins OR select2 based on user preference
*/

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow any domain
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, hx-current-url, hx-request, hx-target")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

var serviceURLs = map[string]string{ //:>>> server map
	"flippo": "http://localhost:8081",
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	// proxy handler setup via server map
	for prefix, urlString := range serviceURLs {
		proxyUrl, err := url.Parse(urlString)
		if err != nil {
			log.Fatalf("Error parsing URL for %s: %v", prefix, err)
		}
		proxy := httputil.NewSingleHostReverseProxy(proxyUrl)

		handlerPath := "/" + prefix + "/"
		http.HandleFunc(handlerPath, func(proxy *httputil.ReverseProxy, handlerPath, prefix string) http.HandlerFunc {
			return func(w http.ResponseWriter, r *http.Request) {
				enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					modifiedPath := "/" + r.URL.Path[len(handlerPath):]
					log.Printf("Forwarding request to %s: %s", prefix, modifiedPath)
					log.Printf("Original request method: %s", r.Method) // Log the original method

					r.URL.Path = modifiedPath
					proxy.ServeHTTP(w, r)

					log.Printf("Request method after proxy: %s", r.Method) // Log the method after proxy handling
				})).ServeHTTP(w, r)
			}
		}(proxy, handlerPath, prefix))
	}
	//send navi dir files *post rq: body(domain context)*
	http.HandleFunc("/collect_dir/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(http.HandlerFunc(plant)).ServeHTTP(w, r)
	})
	//serve website
	http.HandleFunc("/", seed)
	//global service
	fmt.Println("xomud is active")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
