package main

// url-mud official server

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

/*

pending quests:

fracture server into multiple modules

*/

// recieves set-message and returns a new form of tmpl containing only the log of set-msg . from there htmx adds it to the end of the cli list
func stem(w http.ResponseWriter, r *http.Request) {
	Message := template.HTMLEscapeString(r.PostFormValue("set-message"))
	log := fmt.Sprintf("<li>%s</li>", Message)
	tmpl, _ := template.New("t").Parse(log)
	tmpl.Execute(w, nil)
}

func seed(w http.ResponseWriter, r *http.Request) {

	rootmap := []map[string]interface{}{
		{"xomud_title": template.HTML(`<h1>xomud test area</h1>
	`)},
		{"xomud_command": template.HTML(`<div data-import='{"htmx":}' class="draggable"><div class="dragged_content"><div id="cli" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
	<ul id="command-feed">
	</ul>
	</div>				
	<form onsubmit="swoop()" hx-post="/command/" hx-trigger="submit" hx-target="#command-feed" hx-swap="beforeend">
	<input type = "text" name = "set-message" id = "entry-message">
	<input type = "submit" value = "send">
	</form>
	</div></div>
	`)},
		{"xomud_dragtest": template.HTML(`<div class="draggable">Drag me 1</div>
	<div class="draggable">Drag me 2</div>
	<div class="draggable">Drag me 3</div>
	`)},
		{"xomud_iframe": template.HTML(`<div class="draggable damnable" style="left: 50%;"><iframe src="https://www.wikipedia.com" id="embediframe" width="600" height="400" frameborder="0"></iframe></div>
	`)},
		{"iteration_test": template.HTML(`<div class="draggable"><div class="dragged_content" style="background-color: rgb(102, 19, 19);"><i>boom</i></div></div>
	`)},
	}

	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, map[string]interface{}{"rootmap": rootmap})
}

func main() {

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.HandleFunc("/", seed)
	http.HandleFunc("/command/", stem)

	fmt.Println("xomud is active")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
