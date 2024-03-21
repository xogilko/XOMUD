package main

import (
	"fmt"
	"html/template"
	"net/http"
)

func stem(w http.ResponseWriter, r *http.Request) {
	Message := template.HTMLEscapeString(r.PostFormValue("set-message"))
	log := fmt.Sprintf("<li>%s</li>", Message)
	tmpl, _ := template.New("t").Parse(log)
	tmpl.Execute(w, nil)
}

//cli and etc. sample component
