package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

//navi reports context, based on it, court is asked to provide dir

func spawn(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Assuming serviceURLs["testkit"] is properly defined and accessible
	url, err := url.Parse(serviceURLs["testkit"] + "/dirbox")
	if err != nil {
		http.Error(w, "Error parsing URL", http.StatusInternalServerError)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(url)
	proxy.ServeHTTP(w, r)
}
