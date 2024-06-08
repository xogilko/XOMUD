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
		{"xomud_title": template.HTML(`<center><img src="https://xomud.quest/static/resources/starquest.png" alt="star"><br>`)},
		{"xomud_button": template.HTML(`<button onclick="navi(alice, 'alice.rom.enclose_draggable(alice.dir.testkit_menu_html)', 'document.body')">⋆⋅☆⋅⋆</button><br>`)},
		{"xomud_button": template.HTML(`<p>POLITICAL ARCHITECTURE 2024<br><a href="https://xomud.quest/">xomud.quest</a></p></center>`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}
