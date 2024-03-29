package main

import (
	"html/template"
	"net/http"
)

func seed(w http.ResponseWriter, r *http.Request) {

	rootmap := []map[string]interface{}{
		{"xomud_title": template.HTML(`<h1>xomud test area</h1>
	`)},
		/*{"xomud_command": template.HTML(`
		<div class="draggable"><div class="dragged_content">
		<div id="cli" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
		<ul id="command-feed">
		</ul>
		</div>
		<form hx-post="/command/" hx-trigger="submit" hx-target="#command-feed" hx-swap="beforeend">
		<input type = "text" name = "set-message" id = "entry-message">
		<input type = "submit" value = "send">
		</form>
		</div></div>
		`)}, */
	}

	//onsubmit="swoop()"

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}

//construct base webpage template
