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
		{"xomud_img": template.HTML(`<center><img src="https://xomud.quest/static/resources/politicalarchitecture.png" alt="star"><br>`)},
		{"xomud_text": template.HTML(`<p>POLITICAL ARCHITECTURE<br><a href="https://xomud.quest/">xomud.quest</a></p></center>`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}
