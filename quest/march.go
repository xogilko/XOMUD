package main

// url-mud official server

import (
	"html/template"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
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

*/

var serviceURLs = []string{ //:>>> server map
	"http://localhost:8081",
	// Add other service URLs here if needed
}

func seed(w http.ResponseWriter, r *http.Request) {

	rootmap := []map[string]interface{}{
		{"xomud_img": template.HTML(`<center><img src="https://xomud.quest/static/resources/kartogfx.gif" alt="star"><br>`)},
		{"xomud_text": template.HTML(`<p>HYPERIMETRIK KARTOGFX<br><a href="https://xomud.quest/">xomud.quest</a></p></center>`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		log.Printf("CORS request from origin: %s", "hidden")
		if origin != "" && w.Header().Get("Access-Control-Allow-Origin") == "" {
			// Set the Access-Control-Allow-Origin header to the request's origin
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "*")

		// Log headers for debugging
		log.Printf("Response Headers: %v", w.Header())

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func proxyHandler(proxyUrl *url.URL) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			// Handle preflight requests directly
			origin := r.Header.Get("Origin")
			if origin != "" && w.Header().Get("Access-Control-Allow-Origin") == "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, hx-current-url, hx-request, hx-target")
			w.WriteHeader(http.StatusOK)
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(proxyUrl)
		//clientIP := r.RemoteAddr
		if forwardedIP := r.Header.Get("X-Forwarded-For"); forwardedIP != "" {
			//clientIP = forwardedIP
		}

		// Strip the /arch/ prefix from the request path
		modifiedPath := strings.TrimPrefix(r.URL.Path, "/arch")
		r.URL.Path = modifiedPath

		// Set CORS headers before forwarding the request
		origin := r.Header.Get("Origin")
		if origin != "" && w.Header().Get("Access-Control-Allow-Origin") == "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, hx-current-url, hx-request, hx-target")

		// Log headers for debugging
		//log.Printf("Response Headers: %v", w.Header())

		// Log the request being forwarded
		log.Printf("Forwarding request from %s to %s: %s", "hidden", proxyUrl, r.URL.Path)

		// Forward the request
		proxy.ServeHTTP(w, r)
	}
}

func main() {
	// Create a new ServeMux and register the handlers
	mux := http.NewServeMux()
	for _, serviceURL := range serviceURLs {
		proxyUrl, err := url.Parse(serviceURL)
		if err != nil {
			log.Fatal(err)
		}
		mux.HandleFunc("/arch/", proxyHandler(proxyUrl))
	}

	// Wrap the mux with the enableCORS middleware
	handler := enableCORS(mux)
	//serve website
	mux.HandleFunc("/", seed)
	// Start the server
	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
