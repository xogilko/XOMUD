package main

import (
	"html/template"
	"net/http"
)

var serviceURLs = map[string]string{ //:>>> server map
	"flippo": "http://localhost:8081",
}

func seed(w http.ResponseWriter, r *http.Request) {

	rootmap := []map[string]interface{}{
		{"xomud_title": template.HTML(`<h1>URLMUD</h1> 
	`)},
		{"xomud_button": template.HTML(`<button onclick="navi(alice, 'alice.rom.enclose_draggable(alice.dir.testkit_menu_html)', document.body)">Click Me</button> 
		`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}
