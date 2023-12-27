package main

// url-mud official server

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

//root represent server-side renderings , the fibers are designed by the overlay network
// HTML(SSR) + JAVASCRIPT(CSR)
// use an import map on the html page to import javascript modules

// web interface

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

/*

	import map setup:

	remove imports from the head map

	all import maps will be stored as json on the servermesh

		import maps are hashed and are referenced by their nonce


	put both import maps into the <head> the first one is rendered and the second is from local storage, local will override.

		put a header in client->server http request containing serialized list of import keys the client has
			if the list is missing the returning hypertext data-key then include the key in the response header

	create cookie on client detailing dependencies / local demands

	the client needs to prioritize the local storage import map over the returned one

	then the client uses the import map to append the relevant scripts matching the data-script attributes in the divs

	//////////// THIS CODE IS FOR TAKING A KEY FROM DATA-IMPORT ATTRIBUTE AND ADDING IT TO AN IMPORT MAP

					<!-- Assuming you have an existing import map in JavaScript -->
				<script>
				let importMap = {
				lodash: '',
				axios: '',
				};

				// Access the element with the data-import attribute
				const element = document.querySelector('[data-import]');

				// Parse the JSON-encoded string into a JavaScript object
				const importData = JSON.parse(element.dataset.import);

				// Add new key-value pairs to the import map based on the data-import attribute
				Object.keys(importData).forEach(key => {
				importMap[key] = importData[key];
				});

				console.log(importMap);
				</script>

*/
