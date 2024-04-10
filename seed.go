package main

import (
	"html/template"
	"net/http"
)

func seed(w http.ResponseWriter, r *http.Request) {

	rootmap := []map[string]interface{}{
		{"xomud_title": template.HTML(`<h1>URLMUD</h1> 
	`)},
		{"xomud_button": template.HTML(`<button onclick="navi(alice, 'alice.dir.demo_proc')">Click Me</button> 
		`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}

//
