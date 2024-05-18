package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

//navi appeals to server map for initial dir

func plant(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// hardcoded server assuming serviceURLs["testkit"] is accessible
	url, err := url.Parse(serviceURLs["flippo"] + "/dirbox")
	if err != nil {
		http.Error(w, "Error parsing URL", http.StatusInternalServerError)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(url)
	proxy.ServeHTTP(w, r)
}
