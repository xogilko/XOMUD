package main

// url-mud official server

import (
	"fmt"
	"html/template"
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

var serviceURLs = map[string]string{ //:>>> server map
	"flippo": "http://localhost:8081",
}

func seed(w http.ResponseWriter, r *http.Request) {

	rootmap := []map[string]interface{}{
		{"xomud_img": template.HTML(`<center><img src="https://xomud.quest/static/resources/politicalarchitecture.png" alt="star"><br>`)},
		{"xomud_text": template.HTML(`<p>HYPERIMETRIK KARTOGFX<br><a href="https://xomud.quest/">xomud.quest</a></p></center>`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}

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
func proxyHandler(proxyUrl *url.URL, basePath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		proxy := httputil.NewSingleHostReverseProxy(proxyUrl)
		modifiedPath := "/" + r.URL.Path[len(basePath):]
		r.URL.Path = modifiedPath
		clientIP := r.RemoteAddr
		if forwardedIP := r.Header.Get("X-Forwarded-For"); forwardedIP != "" {
			clientIP = forwardedIP
		}
		enableCORS(proxy).ServeHTTP(w, r)
		log.Printf("Forwarding request from %s to %s: %s", clientIP, proxyUrl, modifiedPath)
	}
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// court direct proxy
	for prefix, urlString := range serviceURLs {
		proxyUrl, err := url.Parse(urlString)
		if err != nil {
			log.Fatalf("Error parsing URL for %s: %v", prefix, err)
		}
		handlerPath := "/" + prefix + "/"
		http.HandleFunc(handlerPath, proxyHandler(proxyUrl, handlerPath))
	}
	// /arch/ courtier proxy
	http.HandleFunc("/arch/", func(w http.ResponseWriter, r *http.Request) {
		// Dynamically select the first service URL for demonstration
		for _, urlString := range serviceURLs {
			proxyUrl, err := url.Parse(urlString)
			if err != nil {
				log.Printf("Error parsing URL: %v", err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}
			proxyHandler(proxyUrl, "/arch/")(w, r)
			return
		}
		http.Error(w, "Service not available", http.StatusServiceUnavailable)
	})
	//service worker scoper
	http.HandleFunc("/service-worker.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/service-worker.js")
	})
	//serve website
	http.HandleFunc("/", seed)
	//global service
	fmt.Println("xomud is active")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
