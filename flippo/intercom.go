package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
)

func processTemplates(logContent string) string {
	// List of templates that require processing
	templates := []string{"{{calculate}}", "{{sum}}", "{{average}}"}

	// Check and replace each template if found
	for _, template := range templates {
		if strings.Contains(logContent, template) {
			action := strings.Trim(template, "{}") // Remove curly braces for action name
			result := complexCalculation(logContent, action)
			logContent = strings.Replace(logContent, template, result, -1)
		}
	}
	return logContent
}

func complexCalculation(log string, action string) string {
	// Perform different actions based on the action type
	switch action {
	case "sum":
		return "Sum result placeholder"
	case "average":
		return "Average result placeholder"
	default:
		return "Unknown calculation"
	}
}

func atc_com(w http.ResponseWriter, r *http.Request) {
	original := template.HTMLEscapeString(r.PostFormValue("set-message"))
	Message := strings.ToLower(original)
	log.Printf("Received message: %s", Message) // Log the received message
	// Load data from JSON file
	data := loadData()
	commands, ok := data["command"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: command data format incorrect", http.StatusInternalServerError)
		return
	}
	commandContent, ok := commands[Message].(string)
	if !ok {
		commandContent = Message // Use the message itself if not found in command data
	}

	formattedLog := fmt.Sprintf("<li><b><i>&></i></b> %s</li>", commandContent)
	formattedLog = processTemplates(formattedLog)

	tmpl, err := template.New("t").Parse(formattedLog)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
