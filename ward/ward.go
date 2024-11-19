package main

import (
	"bufio"
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
	"unicode"

	badger "github.com/dgraph-io/badger/v3"

	"github.com/dgrijalva/jwt-go"
	"github.com/dop251/goja"

	// New imports for PDS

	"github.com/bluesky-social/indigo/xrpc"
)

var proxy *httputil.ReverseProxy
var db *badger.DB
var dbsDB *badger.DB

type RegisterData struct {
	Username        string `json:"username"`
	Email           string `json:"email"`
	EmailVisibility bool   `json:"emailVisibility"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
	Name            string `json:"name"`
}

// Add PDS specific types
type HealthResponse struct {
	Version string `json:"version"`
}

func vending_send(w http.ResponseWriter, r *http.Request) {
	//access ward database
	data := loadData()
	department := r.URL.Path[len("/vending/"):]
	departments, ok := data["dirDatabase"].(map[string]interface{})["department"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: department data format incorrect", http.StatusInternalServerError)
		return
	}
	departmentData, ok := departments[department].(map[string]interface{})
	if !ok {
		http.Error(w, fmt.Sprintf("No data found for department: %s", department), http.StatusNotFound)
		return
	}
	var responseItems = make(map[string]map[string]interface{})
	for key, value := range departmentData {
		itemDetails, ok := value.(map[string]interface{})
		if !ok {
			continue
		}
		price := int(itemDetails["price"].(float64))
		desc := itemDetails["desc"].(string)
		path := itemDetails["index"].(string)
		responseItems[key] = map[string]interface{}{
			"keyName": key,
			"price":   price,
			"desc":    desc,
			"path":    path,
		}
	}
	jsonResponse, err := json.Marshal(responseItems)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
func solicit_offer(w http.ResponseWriter, r *http.Request) {
	keyName := r.URL.Path[len("/solicit/"):]
	data := loadData()
	departments, ok := data["dirDatabase"].(map[string]interface{})["department"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: department data format incorrect", http.StatusInternalServerError)
		return
	}
	for _, departmentData := range departments {
		item, ok := departmentData.(map[string]interface{})[keyName].(map[string]interface{})
		if ok {
			//request path is item, found in department(data.json), gives vendor -> check vendordata -> pubkey
			vendor := item["vendor"].(string)
			vendorData := data["vendorIndex"].(map[string]interface{})[vendor].(map[string]interface{})
			hdpub := vendorData["hdpub"].(string)

			address, err := generateAddress(hdpub)
			if err != nil {
				log.Printf("Error generating address: %v", err)
				http.Error(w, "Error generating address", http.StatusInternalServerError)
				return
			}

			catalog("vendor/"+vendor, "new_address: "+address)

			skellykey := data["dirDatabase"].(map[string]interface{})["skellykey"].(string)
			constructedString := fmt.Sprintf("%s %s %s", address, vendor, skellykey)
			hasher := sha256.New()
			hasher.Write([]byte(constructedString))
			fullHash := hasher.Sum(nil)
			hexhash := hex.EncodeToString(fullHash)
			hashed := hexhash[:32]

			response := map[string]interface{}{
				"address": address,
				"hash":    hashed,
			}

			jsonResponse, err := json.Marshal(response)
			if err != nil {
				http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.Write(jsonResponse)
			return
		}
	}
	http.Error(w, "Item not found", http.StatusNotFound)
}
func dvrmod_send(w http.ResponseWriter, r *http.Request) {
	// Load data from JSON file
	data := loadData() // Ensure loadData() is defined to read from 'data.json'
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: dirDatabase format incorrect", http.StatusInternalServerError)
		return
	}
	// Extract the module path from the request URL
	modulePath := r.URL.Path[len("/dvrmod/"):]
	moduleFilePath := "module/" + modulePath
	log.Printf("%s request serving: %s", r.Method, moduleFilePath)

	// Check for permit conditions
	permits, ok := dirDatabase["permit"].(map[string]interface{})
	if !ok {
		log.Println("No permit conditions found")
	} else {
		if permitDetails, ok := permits[modulePath].(map[string]interface{}); ok {
			log.Printf("Permit details for %s: %v", modulePath, permitDetails)
			// Permit condition exists, check for POST and body content
			if r.Method != http.MethodPost {
				http.Error(w, "Forbidden: POST request required", http.StatusForbidden)
				return
			}

			// Read and check the request body
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Error reading request body", http.StatusInternalServerError)
				return
			}
			var requestData map[string]interface{}
			err = json.Unmarshal(body, &requestData)
			if err != nil {
				http.Error(w, "Error parsing request body", http.StatusInternalServerError)
				return
			}
			// pull out receipt variables
			txid, ok := requestData["tx"].(string)
			if !ok {
				http.Error(w, "Invalid client data", http.StatusBadRequest)
				return
			}
			// research tx
			log.Printf("transaction details: %v", txid)
			txDetails, err := fetchTX(txid)
			if err != nil {
				log.Printf("Error fetching transaction details: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			extractHash, address, err := extractTXdata(txDetails)
			if err != nil {
				log.Printf("Error extracting data: %v", err)
				http.Error(w, "Error extracting data", http.StatusInternalServerError)
				return
			}
			//identify vendor
			vendor, ok := permitDetails["vendor"].(string)
			if !ok {
				http.Error(w, "Invalid client data", http.StatusBadRequest)
				return
			}
			skellykey := dirDatabase["skellykey"].(string)
			// recreate the hash
			constructedString := fmt.Sprintf("%s %s %s", address, vendor, skellykey)
			hasher := sha256.New()
			hasher.Write([]byte(constructedString))
			fullHash := hasher.Sum(nil)
			hexhash := hex.EncodeToString(fullHash)
			hashed := hexhash[:32]

			log.Printf("Extracted vendor: %s", vendor)
			log.Printf("Extracted address: %s", address)
			log.Printf("Extracted data: %s", extractHash)
			log.Printf("reconstructed hash: %s", hashed)
			logEntry(fmt.Sprintf("valid receipt for vendor %s = %s ", vendor, txid))
			//compare to verify transaction
			if extractHash != hashed {
				http.Error(w, "Forbidden: Hash mismatch", http.StatusForbidden)
				return
			}
			//add logic for receipt use count via log
		}
	}
	// Serve the file based on the module path
	http.ServeFile(w, r, moduleFilePath)
}
func dvrbox_send(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	//unpack request json
	var requestData map[string]interface{}
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusInternalServerError)
		return
	}
	//unpack request data
	client, ok := requestData["client"].(map[string]interface{})
	if !ok {
		http.Error(w, "Invalid client data", http.StatusBadRequest)
		return
	}
	var auxs []string
	auxList, ok := client["aux"].([]interface{})
	if !ok {
		http.Error(w, "aux data is missing or not a list", http.StatusBadRequest)
		return
	}
	for _, aux := range auxList {
		auxStr, ok := aux.(string)
		if !ok {
			http.Error(w, "aux contains non-string elements", http.StatusBadRequest)
			return
		}
		auxs = append(auxs, auxStr)
	}
	hostName, ok := client["href"].(string)
	if !ok {
		http.Error(w, "Host data is missing or not a string", http.StatusBadRequest)
		return
	}
	// Process database auxs and hostnames
	data := loadData()
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: dirDatabase format incorrect", http.StatusInternalServerError)
		return
	}
	auxMap, ok := dirDatabase["aux"].(map[string]interface{})
	if !ok {
		log.Fatal("Expected 'aux' to be a map[string]interface{}")
	}
	hostsMap, ok := dirDatabase["hosts"].(map[string]interface{})
	if !ok {
		log.Fatal("Expected 'hosts' to be a map[string]interface{}")
	}
	//collect urls
	var urls []string
	for _, aux := range auxs {
		if dirNames, ok := auxMap[aux].([]interface{}); ok {
			for _, dirName := range dirNames {
				dirNameStr, ok := dirName.(string)
				if !ok {
					log.Printf("Expected directory name to be a string, got: %v", dirName)
					continue
				}
				urls = append(urls, "/flippo/"+dirNameStr)
			}
		}
	}
	hostEntries, ok := hostsMap[hostName].(map[string]interface{})
	if ok {
		// Process host entries
		for _, aux := range auxs {
			if dirNames, ok := hostEntries["aux"].(map[string]interface{})[aux].([]interface{}); ok {
				for _, dirName := range dirNames {
					dirNameStr, ok := dirName.(string)
					if !ok {
						log.Printf("Expected directory name to be a string, got: %v", dirName)
						continue
					}
					urls = append(urls, "/flippo/dvrmod/"+dirNameStr)
				}
			}
		}
	}

	log.Printf("dvrbox urls: %s", urls)
	// Convert the list of URLs to JSON and send it back to the client
	jsonResponse, err := json.Marshal(urls)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
func serve(w http.ResponseWriter, r *http.Request) {
	data := loadData()
	skellykey := "0254578b3cd7bcb348cd97bdd0493ef0f5f336abd2590b2aef34a59bd287bc96a6"

	pathSegments := strings.Split(r.URL.Path[1:], "/") // Split path and remove the leading slash
	// Navigate through the nested JSON structure
	currentData := data["index"].(map[string]interface{})
	var parentPath string
	var targetIndexPHP bool
	for i, segment := range pathSegments {
		if nextData, ok := currentData["/"+segment].(map[string]interface{}); ok {
			currentData = nextData
			parentPath += "/" + segment
		} else {
			// If the segment does not exist, assume it should be handled by index.php in the parent directory
			// If it's the last segment, set the filePath to the parent directory's index.php
			r.URL.Path = parentPath + "/index.php"
			// Add the remaining path as a query parameter
			query := r.URL.Query()
			query.Set("path", strings.Join(pathSegments[i:], "/"))
			r.URL.RawQuery = query.Encode()
			targetIndexPHP = true
			break
		}
	}

	// Determine the file path
	filePath := r.URL.Path[1:]
	if !strings.Contains(filePath, ".") {
		filePath = strings.TrimSuffix(filePath, "/") + "/index.php"
		targetIndexPHP = true
	}

	// Check the fee at the final segment or the identified index.php
	var fee float64
	if targetIndexPHP {
		if indexData, ok := currentData["/index.php"].(map[string]interface{}); ok {
			fee, ok = indexData["fee"].(float64)
			if !ok {
				http.Error(w, "Fee data missing or incorrect format", http.StatusBadRequest)
				return
			}
		} else {
			http.Error(w, "Fee data missing or incorrect format", http.StatusBadRequest)
			return
		}
	} else {
		var isok bool
		fee, isok = currentData["fee"].(float64)
		if !isok {
			http.Error(w, "Fee data missing or incorrect format", http.StatusBadRequest)
			return
		}
	}

	if fee == 0 {
		if strings.HasSuffix(filePath, ".php") {
			log.Printf("php rq at %s", filePath)
			r.URL.Path = "/" + filePath
			log.Printf("php url rq at %s", r.URL.Path)
			proxy.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, filePath)
	} else {
		httxid := r.Header.Get("httx")
		if httxid == "" {
			queryParams := r.URL.Query()
			httxid = queryParams.Get("httxid")
			if httxid == "" {
				log.Printf("httx: no header no queryparam")
				http.Error(w, "receipt is required", http.StatusBadRequest)
				return
			}
		}
		// Use the httxHeader for processing
		log.Printf("Handling non-zero fee for %s", r.URL.Path)
		txDetails, err := fetchTX(httxid)
		if err != nil {
			log.Printf("error: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		extractHash, address, err := extractTXdata(txDetails)
		if err != nil {
			log.Printf("Error extracting data: %v", err)
			http.Error(w, "Error extracting data", http.StatusInternalServerError)
			return
		}
		//identify vendor
		vendor, ok := currentData["vendor"].(string)
		if !ok {
			http.Error(w, "Forbidden: unidentified httx vendor", http.StatusBadRequest)
			return
		}
		// recreate the hash
		constructedString := fmt.Sprintf("%s %s %s", address, vendor, skellykey)
		hasher := sha256.New()
		hasher.Write([]byte(constructedString))
		fullHash := hasher.Sum(nil)
		hexhash := hex.EncodeToString(fullHash)
		hashed := hexhash[:32]
		//compare to verify transaction
		if extractHash != hashed {
			log.Printf("hash mismatch: %s vs %s", hashed, extractHash)
			http.Error(w, "Forbidden: receipt hash mismatch", http.StatusForbidden)
			return
		}

		//survived check

		if strings.HasSuffix(filePath, ".php") {
			log.Printf("php rq at %s", filePath)
			r.URL.Path = "/" + filePath
			log.Printf("php url rq at %s", r.URL.Path)
			proxy.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, filePath)
	}
}
func subscribe(w http.ResponseWriter, r *http.Request) {
	log.Printf("subscribe function called")
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData map[string]string
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil || requestData["email"] == "" {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}

	email := requestData["email"]
	catalog("email", "mailing list entry:"+email)
	// Here you would add logic to save the email to your mailing list
	log.Printf("Email subscribed: %s", email)

	response := map[string]string{"message": "Successfully subscribed!"}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
func dbs(w http.ResponseWriter, r *http.Request) {
	// Load data from JSON file
	data := loadData()
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		log.Printf("Error: dirDatabase format incorrect")
		http.Error(w, "Internal Server Error: dirDatabase format incorrect", http.StatusInternalServerError)
		return
	}

	chanIndex, ok := dirDatabase["chan_register"].(map[string]interface{})
	if !ok {
		log.Printf("Error: chan_register format incorrect")
		http.Error(w, "Internal Server Error: chan_register format incorrect", http.StatusInternalServerError)
		return
	}

	// Read and parse request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	var msg map[string]interface{}
	err = json.Unmarshal(body, &msg)
	if err != nil {
		log.Printf("Error parsing request body: %v", err)
		http.Error(w, "Error parsing request body", http.StatusInternalServerError)
		return
	}

	// Extract properties
	config, ok := msg["config"].(map[string]interface{})
	if !ok {
		log.Printf("Error: Invalid config")
		http.Error(w, "Invalid config", http.StatusBadRequest)
		return
	}

	chanValue, ok := config["chan"].(string)
	if !ok {
		log.Printf("Error: Invalid chan value")
		http.Error(w, "Invalid chan value", http.StatusBadRequest)
		return
	}

	chanAddress, ok := chanIndex[chanValue].(string)
	if !ok {
		log.Printf("Error: Invalid chan address")
		http.Error(w, "Invalid chan address", http.StatusInternalServerError)
		return
	}

	ccList, ok := msg["to"].([]interface{})
	if !ok {
		log.Printf("Error: Invalid cc list %s", msg)
		http.Error(w, "Invalid cc list", http.StatusBadRequest)
		return
	}

	// Create a slice to track successful compositions
	var successfulCompositions []string

	// Initialize combinedData with metadata
	combinedData := make(map[string]interface{})
	combinedData["_dbs_meta"] = map[string]interface{}{
		"signature":   "0254578b3cd7bcb348cd97bdd0493ef0f5f336abd2590b2aef34a59bd287bc96a6", // skellykey
		"chanValue":   chanValue,
		"chanAddress": chanAddress,
		"note":        "this is for metadata from dbs",
		"index":       &successfulCompositions,
	}

	for _, ccItem := range ccList {
		ccStr, ok := ccItem.(string)
		if !ok {
			log.Printf("Error: Invalid cc item")
			continue
		}

		composition, err := parseCompositionString(ccStr)
		if err != nil {
			log.Printf("Error parsing composition string: %v", err)
			continue
		}

		var jsonData map[string]interface{}

		// Read JSON data from the file or directory
		if composition.Art != "" {
			filePath := filepath.Join("dbs/main", composition.Path, composition.Art+".json")
			jsonData, err = readJSONFile(filePath)
			if err != nil {
				log.Printf("Error reading file: %v", err)
				continue
			}
		} else {
			dirPath := filepath.Join("dbs/main", composition.Path)
			jsonData, err = readJSONDir(dirPath)
			if err != nil {
				log.Printf("Error reading directory: %v", err)
				continue
			}

			// NEW CODE: Process registry array if it exists
			if metaData, ok := jsonData[filepath.Base(composition.Path)].(map[string]interface{}); ok {
				if registry, ok := metaData["registry"].([]interface{}); ok {
					log.Printf("Found registry with %d items", len(registry))
					for _, artName := range registry {
						if artStr, ok := artName.(string); ok {
							artPath := filepath.Join(composition.Path, artStr+".json")
							artData, err := readJSONFile(filepath.Join("dbs/main", artPath))
							if err != nil {
								log.Printf("Error reading art file %s: %v", artPath, err)
								continue
							}
							jsonData[artStr] = artData
							log.Printf("Added art file: %s", artStr)
						}
					}
				}
			}
		}

		var fee, subfee, vendor, userfriendly interface{}
		if composition.Art != "" {
			vendor = jsonData["vendor"]
			fee = jsonData["fee"]
			subfee = jsonData["subfee"]
			userfriendly = jsonData["user-friendly"]
		} else {
			pathParts := strings.Split(composition.Path, "/")
			lastPart := pathParts[len(pathParts)-1]
			key := "_" + lastPart
			if metaData, ok := jsonData[key].(map[string]interface{}); ok {
				vendor = metaData["vendor"]
				fee = metaData["fee"]
				subfee = metaData["subfee"]
				userfriendly = metaData["user-friendly"]
			}
		}

		// Only check fee requirements if vendor property exists and userfriendly is nil
		if vendor != nil && userfriendly == "true" {
			if !checkFee(composition, fee, vendor, subfee) {
				continue
			}
		}

		// If we made it here, the composition was successful
		successfulCompositions = append(successfulCompositions, ccStr)

		// Add JSON data to combinedData
		if composition.Art != "" {
			combinedData[composition.Art] = jsonData
		} else {
			for key, value := range jsonData {
				combinedData[key] = value
			}
		}
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(combinedData); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}
func port(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	var requestData map[string]interface{}
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusInternalServerError)
		return
	}

	// Get the IP address of the request
	ipAddress := r.RemoteAddr

	// Combine request data and IP address to form the secret key
	secretKey := fmt.Sprintf("%v:%s", requestData, ipAddress)

	// Create a new JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"data": "presentdaypresenttime",
	})

	// Sign the token with the secret key
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		http.Error(w, "Error signing the token", http.StatusInternalServerError)
		return
	}

	// Send the token as a JSON response
	response := map[string]string{
		"token": tokenString,
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
func httx_get(w http.ResponseWriter, r *http.Request) {
	// Extract the txid from the URL path
	txid := r.URL.Path[len("/httx_get/"):]

	// Validate the txid (assuming it should be alphanumeric)
	if !isAlphanumeric(txid) {
		http.Error(w, "Invalid txid format", http.StatusBadRequest)
		return
	}

	// Construct the path to the JSON file
	filePath := filepath.Join("httx_raw", txid+".json")

	// Read the JSON file
	fileContent, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "HTTX not found", http.StatusNotFound)
		} else {
			log.Printf("Error reading HTTX file: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
		return
	}

	// Parse the JSON content
	var httxData map[string]interface{}
	if err := json.Unmarshal(fileContent, &httxData); err != nil {
		log.Printf("Error parsing HTTX JSON: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Extract the "render" property
	render, ok := httxData["render"].(string)
	if !ok {
		http.Error(w, "Invalid HTTX data format", http.StatusInternalServerError)
		return
	}

	// Set the content type to HTML and write the render content
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(render))
}

// Helper function to check if a string is alphanumeric
func isAlphanumeric(s string) bool {
	for _, r := range s {
		if !unicode.IsLetter(r) && !unicode.IsNumber(r) {
			return false
		}
	}
	return true
}

//WARDEN

func compileScrypt(code, fileName string) (string, error) {
	// Define the path to save the file
	dirPath := filepath.Join("service/compilescrypt", "src", "contracts")
	filePath := filepath.Join(dirPath, fileName+".ts")

	// Ensure the directory exists
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return "", fmt.Errorf("directory does not exist: %s", dirPath)
	}

	// Write the code to the file
	err := os.WriteFile(filePath, []byte(code), 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	// Change directory to compilescript
	err = os.Chdir("service/compilescrypt")
	if err != nil {
		return "", fmt.Errorf("failed to change directory: %w", err)
	}

	// Run 'npm run compile'
	cmd := exec.Command("npm", "run", "compile")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to run compile: %w, output: %s", err, string(output))
	}

	// Run 'npm run generate <fileName>'
	cmd = exec.Command("npm", "run", "generate", fileName)
	output, err = cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to run generate: %w, output: %s", err, string(output))
	}

	// Return to the original directory
	err = os.Chdir("..")
	if err != nil {
		return "", fmt.Errorf("failed to change back to original directory: %w", err)
	}

	return string(output), nil
}
func testscrypt() {
	code := `
	
	import { assert, ByteString, method, prop, sha256, Sha256, SmartContract } from 'scrypt-ts'

	export class Helloworld extends SmartContract {

		@prop()
		hash: Sha256;

		constructor(hash: Sha256){
			super(...arguments);
			this.hash = hash;
		}

		@method()
		public unlock(message: ByteString) {
			assert(sha256(message) == this.hash, 'Hash does not match')
		}
	}`
	fileName := "Helloworld"
	output, err := compileScrypt(code, fileName)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Output from generate command:", output)
}
func fetchTX(txid string) (map[string]interface{}, error) {
	txURL := fmt.Sprintf("https://api.whatsonchain.com/v1/bsv/test/tx/hash/%s", txid)
	resp, err := http.Get(txURL)
	if err != nil {
		log.Printf("Failed to fetch transaction details: %v", err)
		return nil, fmt.Errorf("failed to fetch transaction details: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Non-OK HTTP status: %d", resp.StatusCode)
		return nil, fmt.Errorf("httx error: status code %d", resp.StatusCode)
	}

	// Decode the JSON response
	var txDetails map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&txDetails); err != nil {
		log.Printf("Error decoding transaction details: %v", err)
		return nil, fmt.Errorf("error decoding transaction details: %w", err)
	}

	return txDetails, nil
}
func generateAddress(pubkey string) (string, error) {
	bsvJS, err := loadJavaScriptFile("lib/bsv.min.js")
	if err != nil {
		return "", fmt.Errorf("error loading bsv library: %w", err)
	}

	vm := goja.New()
	_, err = vm.RunString(bsvJS) // Execute the bsv library code
	if err != nil {
		return "", fmt.Errorf("error executing bsv library: %w", err)
	}

	// Get the current date in mmddyyyy format
	currentTime := time.Now()
	dateString := currentTime.Format("0102200615") // mmddyyyy format

	// JavaScript to generate the address
	jsCode := fmt.Sprintf(`
        const hdPublicKey = bsv.HDPublicKey.fromString('%s');
        const childKey = hdPublicKey.deriveChild('m/0/0/' + %s);
        const address = childKey.publicKey.toAddress('testnet');
        address.toString();
    `, pubkey, dateString)

	val, err := vm.RunString(jsCode)
	if err != nil {
		return "", fmt.Errorf("error running js code: %w", err)
	}

	address, ok := val.Export().(string)
	if !ok {
		return "", fmt.Errorf("failed to convert result to string")
	}

	return address, nil
}
func extractTXdata(txDetails map[string]interface{}) (string, string, error) {
	// Load the JavaScript BSV library
	bsvJS, err := loadJavaScriptFile("lib/bsv.min.js")
	if err != nil {
		return "", "", fmt.Errorf("error loading bsv library: %w", err)
	}

	// Initialize the JavaScript VM
	vm := goja.New()
	_, err = vm.RunString(bsvJS) // Execute the BSV library code
	if err != nil {
		return "", "", fmt.Errorf("error executing bsv library: %w", err)
	}

	// Extract vout array from the transaction details
	vouts, ok := txDetails["vout"].([]interface{})
	if !ok {
		return "", "", fmt.Errorf("vout data is missing or not in expected format")
	}

	// Define the markers to look for in the asm string
	markerStart := "0 OP_IF 6582895 1 "
	markerEnd := " OP_ENDIF"
	addressStartMarker := "OP_DUP OP_HASH160 "
	addressEndMarker := " OP_EQUALVERIFY"

	for _, vout := range vouts {
		voutMap, ok := vout.(map[string]interface{})
		if !ok {
			continue
		}
		scriptPubKey, ok := voutMap["scriptPubKey"].(map[string]interface{})
		if !ok {
			continue
		}
		asm, ok := scriptPubKey["asm"].(string)
		if !ok {
			continue
		}

		// Extract address
		addressStartIndex := strings.Index(asm, addressStartMarker)
		if addressStartIndex == -1 {
			continue
		}
		addressStartIndex += len(addressStartMarker)

		addressEndIndex := strings.Index(asm[addressStartIndex:], addressEndMarker)
		if addressEndIndex == -1 {
			continue
		}

		pubKeyHash := asm[addressStartIndex : addressStartIndex+addressEndIndex]

		// Find the start and end of the data segment
		startIndex := strings.Index(asm, markerStart)
		if startIndex == -1 {
			continue
		}
		startIndex += len(markerStart)

		endIndex := strings.Index(asm[startIndex:], markerEnd)
		if endIndex == -1 {
			continue
		}
		endIndex += startIndex

		// Extract the pubKeyHash and data segments
		segments := strings.Split(asm[startIndex:endIndex], " ")
		if len(segments) < 2 {
			return "", "", fmt.Errorf("data segments not found")
		}

		hexData := segments[2]
		log.Printf("hexdata: %s", hexData)
		log.Printf("pubkey: %s", pubKeyHash)
		// Convert hexData to ASCII
		decodedBytes, err := hex.DecodeString(hexData)
		if err != nil {
			return "", "", fmt.Errorf("error decoding hex to ASCII: %w", err)
		}
		asciiData := string(decodedBytes)

		// Convert pubKeyHash to address using the bsv library
		val, err := vm.RunString(fmt.Sprintf(`bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from('%s', 'hex'), 'testnet').toString()`, pubKeyHash))
		if err != nil {
			return "", "", fmt.Errorf("error converting pubkeyhash to address: %w", err)
		}
		address, ok := val.Export().(string)
		if !ok {
			return "", "", fmt.Errorf("failed to convert result to string")
		}

		return asciiData, address, nil
	}

	return "", "", fmt.Errorf("no data found with specified markers")
}
func loadJavaScriptFile(filepath string) (string, error) {
	bytes, err := os.ReadFile(filepath)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}
func loadData() map[string]interface{} {
	result := make(map[string]interface{})

	err := db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			k := string(item.Key())

			err := item.Value(func(v []byte) error {
				var value interface{}
				if err := json.Unmarshal(v, &value); err != nil {
					return err
				}
				result[k] = value
				return nil
			})
			if err != nil {
				log.Printf("Error loading key %s: %v", k, err)
			}
		}
		return nil
	})

	if err != nil {
		log.Printf("Error loading data: %v", err)
		return nil
	}

	return result
}
func checkFee(composition CompositionPath, fee, vendor, subfee interface{}) bool {
	if fee != nil {
		if fee == 0 { //free regardless of parent
			return true
		}

		// Check for direct fee receipt
		for _, receipt := range composition.Receipts {
			if receipt.Type == "fee" {
				if validateReceipt(receipt.TXID, fee, subfee, vendor) {
					return true
				}
			}
		}

		if subfee != nil {
			for _, receipt := range composition.Receipts {
				if receipt.Type == "sub" {
					if validateReceipt(receipt.TXID, fee, subfee, vendor) {
						return checkParentFee(composition.Path, composition.Receipts)
					}
				}
			}
			return false
		}
		return false
	}

	// Check for subfee
	if subfee != nil {
		for _, receipt := range composition.Receipts {
			if receipt.Type == "sub" {
				if validateReceipt(receipt.TXID, fee, subfee, vendor) {
					return checkParentFee(composition.Path, composition.Receipts)
				}
			}
			return false
		}
	}
	return checkParentFee(composition.Path, composition.Receipts)
}

func checkParentFee(auxPath string, feeParts []Receipt) bool {
	parentPath := auxPath
	for {
		parentPath = filepath.Dir(parentPath)
		if parentPath == "." || parentPath == "/" {
			break
		}
		// Read the meta JSON file for the parent aux
		metaFilePath := filepath.Join("dbs/main", parentPath, "_"+filepath.Base(parentPath)+".json")
		metaFileData, err := readJSONFile(metaFilePath)
		if err != nil {
			continue
		}

		// Check for direct fee in the parent directory
		if fee, ok := metaFileData["fee"]; ok {
			if fee == nil {
				return true // No fee required
			}
			// Validate the receipt for the direct fee
			for _, part := range feeParts {
				if part.TXID == fee {
					return true
				}
			}
			return false
		}
		if subfee, ok := metaFileData["subfee"]; ok {
			// Validate the receipt for the subfee
			for _, part := range feeParts {
				if part.TXID == subfee {
					return true
				}
			}
			return false
		}
	}
	return false
}
func validateReceipt(receipt string, fee, subfee, vendor interface{}) bool {
	// Implement your receipt validation logic here
	// Use fee, subfee, and vendor as needed
	log.Printf("Handling receipt: %s", receipt)
	txDetails, err := fetchTX(receipt)
	if err != nil {
		log.Printf("error: %v", err)
		return false
	}
	extractHash, address, err := extractTXdata(txDetails)
	if err != nil {
		log.Printf("Error extracting data: %v", err)
		return false
	}
	// recreate the hash
	// this style of address hash confirm is called skelly method tx
	// the skellykey is always the following, it is used by generateAddress and in validateReceipt
	skellykey := "0254578b3cd7bcb348cd97bdd0493ef0f5f336abd2590b2aef34a59bd287bc96a6"
	constructedString := fmt.Sprintf("%s %s %s", address, vendor, skellykey)
	hasher := sha256.New()
	hasher.Write([]byte(constructedString))
	fullHash := hasher.Sum(nil)
	hexhash := hex.EncodeToString(fullHash)
	hashed := hexhash[:32]
	//compare to verify transaction
	if extractHash != hashed {
		log.Printf("hash mismatch: %s vs %s", hashed, extractHash)
		return false
	}
	log.Printf("receipt cleared validation: %s", receipt)
	return true
}
func readJSONFile(path string) (map[string]interface{}, error) {
	// Convert file path to key using the same logic as boom:
	key := strings.ReplaceAll(path, "/", "\\") // Normalize to backslashes to match storage
	key = strings.TrimPrefix(key, "dbs\\")     // Remove dbs prefix if present
	key = strings.TrimSuffix(key, ".json")

	log.Printf("Reading from BadgerDB - Key: %s", key)

	var result map[string]interface{}
	err := dbsDB.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(key))
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			return json.Unmarshal(val, &result)
		})
	})

	if err != nil {
		log.Printf("Error reading from BadgerDB - Key: %s, Error: %v", key, err)
		return nil, err
	}

	// Check if the result contains a "reference" property
	if reference, ok := result["reference"].(string); ok {
		return readJSONFile(reference)
	}

	return result, nil
}
func readJSONDir(dirPath string) (map[string]interface{}, error) {
	// Extract the last segment of the path
	lastSegment := filepath.Base(dirPath)

	// Convert directory path to key
	dirKey := strings.ReplaceAll(dirPath, "/", "\\")
	dirKey = strings.TrimPrefix(dirKey, "dbs\\")
	metaKey := dirKey + "\\_" + lastSegment

	log.Printf("Reading directory from BadgerDB - Key: %s", metaKey)

	// Read meta file
	var metaFileData map[string]interface{}
	err := dbsDB.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(metaKey))
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			return json.Unmarshal(val, &metaFileData)
		})
	})

	if err != nil {
		log.Printf("Error reading meta file from BadgerDB - Key: %s, Error: %v", metaKey, err)
		return nil, err
	}

	// Check for "compose" property
	compose, ok := metaFileData["compose"].(bool)
	if !ok || !compose {
		log.Printf("Compose is not true for %s, skipping directory reading", metaKey)
		return nil, nil
	}

	dirData := make(map[string]interface{})
	dirData[lastSegment] = metaFileData

	// List all keys with this prefix
	prefix := dirKey
	if !strings.HasSuffix(prefix, "\\") {
		prefix += "\\"
	}

	err = dbsDB.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = []byte(prefix)
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			k := string(item.Key())

			// Skip meta file
			if strings.HasSuffix(k, "\\_"+lastSegment) {
				continue
			}

			err := item.Value(func(v []byte) error {
				var fileData map[string]interface{}
				if err := json.Unmarshal(v, &fileData); err != nil {
					return err
				}

				key := filepath.Base(k)
				key = strings.TrimSuffix(key, ".json")
				dirData[key] = fileData
				return nil
			})

			if err != nil {
				log.Printf("Error reading value for key %s: %v", k, err)
			}
		}
		return nil
	})

	if err != nil {
		log.Printf("Error iterating through directory: %v", err)
		return nil, err
	}

	return dirData, nil
}

//SCRIBE

var logEntries = make(chan string, 1000) // Buffered channel
func initLogger() {
	file, err := os.OpenFile("ward.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for entry := range logEntries {
			if _, err := file.WriteString(time.Now().Format(time.RFC3339) + " " + entry + "\n"); err != nil {
				log.Printf("Error writing to log file: %v", err)
			}
		}
	}()
}
func logEntry(message string) {
	logEntries <- message // Non-blocking send to the channel
}
func catalog(logFileName, message string) error {
	// Open the log file with append mode, create if not exists
	file, err := os.OpenFile("log/"+logFileName+".log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close() // Ensure file is closed after writing

	// Prepare log entry with timestamp
	logEntry := message + " " + time.Now().Format(time.RFC3339) + "\n"

	// Write the log entry to the file
	if _, err := file.WriteString(logEntry); err != nil {
		return err
	}

	return nil
}

//INTERCOM

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

//// VENDING

func vendor_check(w http.ResponseWriter, r *http.Request) {
	// Get waltar token and ID from headers
	waltarToken := r.Header.Get("Authorization")
	waltarID := r.Header.Get("X-Waltar-ID")

	// Verify token
	if !verifyWaltarToken(waltarToken, waltarID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if vendor exists in BadgerDB
	err := db.View(func(txn *badger.Txn) error {
		key := []byte("vendorIndex:" + waltarID)
		_, err := txn.Get(key)
		return err
	})

	if err == badger.ErrKeyNotFound {
		http.Error(w, "Vendor not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
}
func register_vendor(w http.ResponseWriter, r *http.Request) {
	waltarToken := r.Header.Get("Authorization")
	waltarID := r.Header.Get("X-Waltar-ID")

	// Verify token
	if !verifyWaltarToken(waltarToken, waltarID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get pubkey from Hypercloud
	pubkey, err := getPubKeyFromHypercloud(waltarID)
	if err != nil {
		http.Error(w, "Failed to get pubkey", http.StatusInternalServerError)
		return
	}

	// Create vendor entry
	vendorData := map[string]interface{}{
		"hdpub": pubkey,
		"items": []string{},
	}

	// Store in BadgerDB
	err = db.Update(func(txn *badger.Txn) error {
		data, err := json.Marshal(vendorData)
		if err != nil {
			return err
		}
		return txn.Set([]byte("vendorIndex:"+waltarID), data)
	})

	if err != nil {
		http.Error(w, "Failed to create vendor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// // HTTX MANAGEMENT
func startTransactionCheck() {
	data := loadData()
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		log.Fatal("dirDatabase format incorrect")
	}

	listenCycle, ok := dirDatabase["listen_cycle"].(map[string]interface{})
	if !ok {
		log.Fatal("listen_cycle format incorrect")
	}

	whatsonchain, ok := listenCycle["whatsonchain"].(map[string]interface{})
	if !ok {
		log.Fatal("whatsonchain format incorrect")
	}

	for key, value := range whatsonchain {
		prop, ok := value.(map[string]interface{})
		if !ok {
			log.Printf("Skipping invalid property: %s", key)
			continue
		}

		address, ok := prop["address"].(string)
		if !ok {
			log.Printf("Address not found for property: %s", key)
			continue
		}

		minutes, ok := prop["minute"].(float64)
		if !ok {
			log.Printf("Minute not found for property: %s", key)
			continue
		}

		go startCycle(address, int(minutes))
	}
}

func startCycle(address string, minutes int) {
	log.Printf("Starting cycle for address: %s with interval: %d minutes", address, minutes)

	// Perform the initial check immediately
	log.Printf("Performing initial transaction check for address: %s", address)
	checkAndFetchTransactions(address)

	ticker := time.NewTicker(time.Duration(minutes) * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Printf("Performing scheduled transaction check for address: %s", address)
			checkAndFetchTransactions(address)
		}
	}
}

func checkAndFetchTransactions(address string) {
	log.Printf("Checking transactions for address: %s", address)
	utxoData, err := fetchUTXOData(address, false) // Fetch unconfirmed UTXOs
	if err != nil {
		log.Printf("Error fetching UTXO data: %v", err)
		return
	}

	if len(utxoData) == 0 {
		log.Printf("No unconfirmed UTXO data found for address: %s, checking confirmed UTXOs", address)
		utxoData, err = fetchUTXOData(address, true) // Fetch confirmed UTXOs if unconfirmed are empty
		if err != nil {
			log.Printf("Error fetching confirmed UTXO data: %v", err)
			return
		}
	}

	if len(utxoData) == 0 {
		log.Printf("No UTXO data found for address: %s", address)
		return
	}

	for _, utxo := range utxoData {
		txHash := utxo["tx_hash"].(string)
		filePath := filepath.Join("dbs/main/bitcoin_testnet", txHash+".json")

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			log.Printf("Transaction %s not found, fetching data...", txHash)
			txData, err := fetchTransactionData(txHash)
			if err != nil {
				log.Printf("Error fetching transaction data for %s: %v", txHash, err)
				continue
			}

			err = writeTransactionJSON(filePath, txHash, txData)
			if err != nil {
				log.Printf("Error writing JSON file for %s: %v", txHash, err)
			}
		} else {
			log.Printf("Transaction %s already exists, skipping...", txHash)
		}
	}
}

func fetchUTXOData(address string, confirmed bool) ([]map[string]interface{}, error) {
	log.Printf("Fetching UTXO data for address: %s (confirmed: %t)", address, confirmed)
	var lookup string
	if confirmed {
		lookup = fmt.Sprintf("https://api.whatsonchain.com/v1/bsv/test/address/%s/confirmed/unspent", address)
	} else {
		lookup = fmt.Sprintf("https://api.whatsonchain.com/v1/bsv/test/address/%s/unconfirmed/unspent", address)
	}

	resp, err := http.Get(lookup)
	if err != nil {
		log.Printf("HTTP request failed for address %s: %v", address, err)
		return nil, fmt.Errorf("failed to fetch UTXOs: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Non-OK HTTP status for address %s: %d", address, resp.StatusCode)
		return nil, fmt.Errorf("unexpected HTTP status: %d", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body for address %s: %v", address, err)
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		log.Printf("Error parsing JSON for address %s: %v", address, err)
		return nil, fmt.Errorf("error parsing JSON: %w", err)
	}

	if result, ok := data["result"].([]interface{}); ok {
		if len(result) == 0 {
			log.Printf("No UTXOs found for address: %s", address)
		} else {
			log.Printf("Found %d UTXOs for address: %s", len(result), address)
		}

		var utxos []map[string]interface{}
		for _, item := range result {
			if utxo, ok := item.(map[string]interface{}); ok {
				utxos = append(utxos, utxo)
			}
		}
		return utxos, nil
	}

	log.Printf("Unexpected data structure for address %s", address)
	return nil, fmt.Errorf("unexpected data structure: %v", data)
}

func fetchTransactionData(txid string) (map[string]interface{}, error) {
	log.Printf("Fetching transaction data for txid: %s", txid)
	lookup := fmt.Sprintf("https://api.whatsonchain.com/v1/bsv/test/tx/%s", txid)
	resp, err := http.Get(lookup)
	if err != nil {
		log.Printf("HTTP request failed: %v", err)
		return nil, fmt.Errorf("failed to fetch transaction: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Non-OK HTTP status: %d", resp.StatusCode)
		return nil, fmt.Errorf("unexpected HTTP status: %d", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		return nil, fmt.Errorf("error parsing JSON: %w", err)
	}

	return data, nil
}

func writeTransactionJSON(filePath, txHash string, txData map[string]interface{}) error {
	log.Printf("Writing transaction JSON for txid: %s", txHash)
	jsonData := map[string]interface{}{
		"uri":   fmt.Sprintf("httxid:%s", txHash),
		"aux":   "bitcoin_testnet",
		"kind":  "httx",
		"name":  fmt.Sprintf("xomud.quest/xo/httx %s...", txHash[:10]),
		"media": txData,
	}

	jsonBytes, err := json.MarshalIndent(jsonData, "", "  ")
	if err != nil {
		log.Printf("Error marshalling JSON: %v", err)
		return fmt.Errorf("error marshalling JSON: %w", err)
	}

	err = ioutil.WriteFile(filePath, jsonBytes, 0644)
	if err != nil {
		log.Printf("Error writing JSON file: %v", err)
		return fmt.Errorf("error writing JSON file: %w", err)
	}

	log.Printf("Transaction JSON written for %s", txHash)
	return nil
}

///WALTAR

func waltar_register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendError(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		sendError(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	var data struct {
		Username        string `json:"username"`
		Email           string `json:"email"`
		EmailVisibility bool   `json:"emailVisibility"`
		Password        string `json:"password"`
		PasswordConfirm string `json:"passwordConfirm"`
		Name            string `json:"name"`
		Signature       string `json:"signature"`
	}

	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		sendError(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// Create the message that was signed
	messageObj := struct {
		PublicKey string `json:"publicKey"`
		Timestamp string `json:"timestamp"`
	}{
		PublicKey: data.Username,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	messageBytes, err := json.Marshal(messageObj)
	if err != nil {
		sendError(w, "Error creating message", http.StatusInternalServerError)
		return
	}

	log.Printf("Message to verify: %s", string(messageBytes))
	log.Printf("Received signature: %s", data.Signature)
	log.Printf("Public key: %s", data.Username)

	// Forward to Hypercloud using the stored body
	pbURL := "https://hypercloud.pockethost.io/api/collections/users/records"
	resp, err := http.Post(pbURL, "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		sendError(w, "Error forwarding to Hypercloud", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		sendError(w, fmt.Sprintf("Hypercloud error: %s", string(body)), resp.StatusCode)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "User registered successfully")
}
func sendError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
func waltar_login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendError(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Read request body
	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		sendError(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Parse request data
	var loginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.Unmarshal(bodyBytes, &loginRequest); err != nil {
		log.Printf("Error parsing request JSON: %v", err)
		sendError(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// Create Hypercloud request
	pbRequest := map[string]string{
		"identity": loginRequest.Email,
		"password": loginRequest.Password,
	}

	pbBody, err := json.Marshal(pbRequest)
	if err != nil {
		log.Printf("Error creating Hypercloud request body: %v", err)
		sendError(w, "Error creating request", http.StatusInternalServerError)
		return
	}

	// Make request to Hypercloud
	pbURL := "https://hypercloud.pockethost.io/api/collections/users/auth-with-password"
	pbReq, err := http.NewRequest("POST", pbURL, bytes.NewReader(pbBody))
	if err != nil {
		log.Printf("Error creating Hypercloud request: %v", err)
		sendError(w, "Error creating request", http.StatusInternalServerError)
		return
	}
	pbReq.Header.Set("Content-Type", "application/json")

	// Execute request
	client := &http.Client{}
	pbResp, err := client.Do(pbReq)
	if err != nil {
		log.Printf("Error making Hypercloud request: %v", err)
		sendError(w, "Error connecting to Hypercloud", http.StatusInternalServerError)
		return
	}
	defer pbResp.Body.Close()

	// Read Hypercloud response
	pbRespBody, err := ioutil.ReadAll(pbResp.Body)
	if err != nil {
		log.Printf("Error reading Hypercloud response: %v", err)
		sendError(w, "Error reading Hypercloud response", http.StatusInternalServerError)
		return
	}

	// If Hypercloud request failed, forward the error
	if pbResp.StatusCode != http.StatusOK {
		log.Printf("Hypercloud error response: %s", string(pbRespBody))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(pbResp.StatusCode)
		w.Write(pbRespBody)
		return
	}

	// Parse Hypercloud response to extract necessary data
	var pbResponse struct {
		Token  string `json:"token"`
		Record struct {
			ID       string `json:"id"`
			Username string `json:"username"`
			Email    string `json:"email"`
		} `json:"record"`
	}

	if err := json.Unmarshal(pbRespBody, &pbResponse); err != nil {
		log.Printf("Error parsing Hypercloud response: %v", err)
		sendError(w, "Error processing authentication response", http.StatusInternalServerError)
		return
	}

	// Create our response with the necessary data
	response := map[string]interface{}{
		"token":    pbResponse.Token,
		"id":       pbResponse.Record.ID,
		"username": pbResponse.Record.Username,
		"email":    pbResponse.Record.Email,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		sendError(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	log.Printf("Login successful for user: %s (ID: %s)", pbResponse.Record.Username, pbResponse.Record.ID)
}
func verifyWaltarToken(token string, id string) bool {
	// Remove "Bearer " prefix if present
	token = strings.TrimPrefix(token, "Bearer ")

	// Make request to Hypercloud to verify token
	url := fmt.Sprintf("https://hypercloud.pockethost.io/api/collections/users/records/%s", id)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		return false
	}

	// Add token to request
	req.Header.Add("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making request: %v", err)
		return false
	}
	defer resp.Body.Close()

	// If response is 200, token is valid
	return resp.StatusCode == 200
}
func getPubKeyFromHypercloud(id string) (string, error) {
	url := fmt.Sprintf("https://xomud.pockethost.io/api/collections/users/records/%s", id)
	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to get user data: %v", err)
	}
	defer resp.Body.Close()

	var userData struct {
		Username string `json:"username"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&userData); err != nil {
		return "", fmt.Errorf("failed to decode user data: %v", err)
	}

	if userData.Username == "" {
		return "", fmt.Errorf("no public key found for user")
	}

	return userData.Username, nil
}

// New structs for request parsing
type Receipt struct {
	Type string // "fee" or "sub"
	TXID string
}

type CompositionPath struct {
	Path     string
	Art      string
	Receipts []Receipt
}

func parseCompositionString(s string) (CompositionPath, error) {
	params, err := url.ParseQuery(s)
	if err != nil {
		return CompositionPath{}, err
	}

	composition := CompositionPath{
		Path: params.Get("path"),
		Art:  params.Get("art"),
	}

	// Parse receipts
	for key, values := range params {
		if strings.HasPrefix(key, "r") && len(values) > 0 {
			parts := strings.Split(values[0], ":")
			if len(parts) == 2 {
				composition.Receipts = append(composition.Receipts, Receipt{
					Type: parts[0],
					TXID: parts[1],
				})
			}
		}
	}

	return composition, nil
}

func saveData(key string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return db.Update(func(txn *badger.Txn) error {
		return txn.Set([]byte(key), data)
	})
}

func startTerminalInput() {
	scanner := bufio.NewScanner(os.Stdin)
	for {
		if scanner.Scan() {
			input := scanner.Text()
			handleTerminalCommand(input)
		}
	}
}

func handleTerminalCommand(cmd string) {
	// Split the command to handle arguments
	parts := strings.Fields(cmd)
	if len(parts) == 0 {
		return
	}

	switch strings.ToLower(parts[0]) {
	case "status":
		fmt.Printf("\nStatus: good!\n")
		fmt.Printf("Active since: %s\n", time.Now().Format(time.RFC3339))
		fmt.Printf("Database status: %s\n", getDatabaseStatus())
		fmt.Printf("Active connections: %d\n", getActiveConnections())
		fmt.Printf("Memory usage: %s\n\n", getMemoryUsage())
	case "help":
		fmt.Printf("\nAvailable commands:\n")
		fmt.Printf("- status: Show server status and diagnostics\n")
		fmt.Printf("- help: Show this help message\n")
		fmt.Printf("- boom: Migrate dbs json to badger (dbs/main -> dbsDB)\n")
		fmt.Printf("- unboom: Export badger contents to dbs json files (dbsDB -> dbs/main)\n")
		fmt.Printf("- vendorlist: Display all vendor keys\n")
		fmt.Printf("- dbsdel <path>: Delete an item from dbsDB (e.g., 'dbsdel testkit/dumb')\n")
		fmt.Printf("  Options: -f (file) or -d (directory)\n\n")
		fmt.Printf("- permaboom: Delete and rebuild the entire dbs database from scratch\n")
		fmt.Printf("  WARNING: This will delete all existing data in the database!\n\n")
	case "boom":
		performMigration()
	case "unboom":
		performReverseOperation()
	case "vendorlist":
		displayVendorList()
	case "dbsdel":
		if len(parts) < 3 {
			fmt.Printf("\nError: Please specify -f (file) or -d (directory) and a path\n")
			fmt.Printf("Example: 'dbsdel -f testkit/dumb' for a file\n")
			fmt.Printf("Example: 'dbsdel -d testkit/dumb' for a directory\n\n")
			return
		}
		flag := parts[1]
		path := parts[2]

		switch flag {
		case "-f":
			deleteDBSFile(path)
		case "-d":
			deleteDBSDirectory(path)
		default:
			fmt.Printf("\nError: Invalid flag. Use -f for file or -d for directory\n\n")
		}
	case "permaboom":
		fmt.Printf("\nWARNING: This will delete the entire dbs database and rebuild it from scratch.")
		fmt.Printf("\nAre you sure you want to continue? (yes/no): ")

		scanner := bufio.NewScanner(os.Stdin)
		if scanner.Scan() {
			response := strings.ToLower(strings.TrimSpace(scanner.Text()))
			if response == "yes" {
				performPermaboom()
			} else {
				fmt.Printf("\nPermaboom cancelled.\n\n")
			}
		}
	default:
		fmt.Printf("\nUnknown command. Type 'help' for available commands.\n\n")
	}
}

func deleteDBSFile(path string) {
	fmt.Printf("\nAttempting to delete file: %s\n", path)

	err := dbsDB.Update(func(txn *badger.Txn) error {
		return txn.Delete([]byte(path))
	})

	if err == badger.ErrKeyNotFound {
		fmt.Printf("Error: File '%s' not found in database\n\n", path)
		return
	}

	if err != nil {
		fmt.Printf("Error deleting file: %v\n\n", err)
		return
	}

	fmt.Printf("Successfully deleted file: %s\n\n", path)
}

func deleteDBSDirectory(path string) {
	fmt.Printf("\nAttempting to delete directory: %s/\n", path)

	deleteCount := 0
	err := dbsDB.Update(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = []byte(path + "/")
		it := txn.NewIterator(opts)
		defer it.Close()

		// Collect keys to delete
		var keysToDelete []string
		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			key := string(item.Key())
			keysToDelete = append(keysToDelete, key)
		}

		// Delete all collected keys
		for _, key := range keysToDelete {
			fmt.Printf("Deleting: %s\n", key)
			if err := txn.Delete([]byte(key)); err != nil {
				return err
			}
			deleteCount++
		}

		return nil
	})

	if err != nil {
		fmt.Printf("Error during directory deletion: %v\n\n", err)
		return
	}

	if deleteCount == 0 {
		fmt.Printf("No entries found in directory: %s/\n\n", path)
		return
	}

	fmt.Printf("\nSuccessfully deleted %d entries from directory: %s/\n\n", deleteCount, path)
}

func displayVendorList() {
	fmt.Println("\nFetching vendor list...")

	data := loadData()
	vendorIndex, ok := data["vendorIndex"].(map[string]interface{})
	if !ok {
		fmt.Println("Error: Could not access vendor_index")
		return
	}

	fmt.Println("\nVendor List:")
	fmt.Println("------------")
	count := 0
	for key := range vendorIndex {
		count++
		fmt.Printf("%d. %s\n", count, key)
	}
	fmt.Printf("\nTotal vendors: %d\n\n", count)
}

// Helper functions for diagnostics
func getDatabaseStatus() string {
	if db == nil || dbsDB == nil {
		return "Offline"
	}
	return "Online"
}
func getActiveConnections() int {
	// This is a placeholder - implement actual connection tracking if needed
	return 0
}
func getMemoryUsage() string {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return fmt.Sprintf("Alloc=%v MiB, Sys=%v MiB", m.Alloc/1024/1024, m.Sys/1024/1024)
}
func performMigration() {
	fmt.Println("\nStarting migration from dbs directory...")
	count := 0
	overwritten := 0
	start := time.Now()

	// Walk through the dbs directory
	err := filepath.Walk("dbs", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("Error accessing path %q: %v\n", path, err)
			return err
		}

		// Skip the root dbs directory itself
		if path == "dbs" {
			return nil
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Only process .json files
		if !strings.HasSuffix(strings.ToLower(path), ".json") {
			return nil
		}

		// Read the file
		data, err := ioutil.ReadFile(path)
		if err != nil {
			log.Printf("Error reading file %s: %v\n", path, err)
			return nil
		}

		// Verify it's valid JSON
		var jsonData interface{}
		if err := json.Unmarshal(data, &jsonData); err != nil {
			log.Printf("Error parsing JSON from file %s: %v\n", path, err)
			return nil
		}

		// Get the relative path from the dbs directory
		relPath, err := filepath.Rel("dbs", path)
		if err != nil {
			log.Printf("Error getting relative path for %s: %v\n", path, err)
			return nil
		}

		// Remove .json extension to create the key
		key := strings.TrimSuffix(relPath, ".json")

		// Check if key already exists
		exists := false
		dbsDB.View(func(txn *badger.Txn) error {
			_, err := txn.Get([]byte(key))
			if err == nil {
				exists = true
			}
			return nil
		})

		// Debug output
		fmt.Printf("Processing: %s\n", path)
		fmt.Printf("→ Key: %s", key)
		if exists {
			fmt.Printf(" (overwriting existing entry)")
			overwritten++
		}
		fmt.Println()

		// Store in BadgerDB
		err = dbsDB.Update(func(txn *badger.Txn) error {
			return txn.Set([]byte(key), data)
		})

		if err != nil {
			log.Printf("Error storing in BadgerDB - Key: %s, Error: %v\n", key, err)
			return nil
		}

		count++
		return nil
	})

	if err != nil {
		fmt.Printf("\nError during migration: %v\n", err)
		return
	}

	duration := time.Since(start)
	fmt.Printf("\nMigration completed:\n")
	fmt.Printf("Files processed: %d\n", count)
	fmt.Printf("Entries overwritten: %d\n", overwritten)
	fmt.Printf("Time taken: %v\n\n", duration)

	// Verify migration
	fmt.Println("Database contents after migration:")
	fmt.Println("----------------------------------")
	dbsDB.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			k := string(item.Key())
			fmt.Printf("Key: %s\n", k)
		}
		return nil
	})
}
func performReverseOperation() {
	fmt.Println("\nStarting export from BadgerDB...")
	count := 0
	start := time.Now()

	err := dbsDB.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			key := string(item.Key())

			err := item.Value(func(v []byte) error {
				// Construct the file path in the root directory
				filePath := key + ".json"
				dirPath := filepath.Dir(filePath)

				// Debug output
				fmt.Printf("Exporting key: %s\n", key)
				fmt.Printf("→ To: %s\n", filePath)

				// Ensure the directory structure exists
				if err := os.MkdirAll(dirPath, 0755); err != nil {
					return fmt.Errorf("error creating directory %s: %v", dirPath, err)
				}

				// Verify and format JSON
				var jsonData interface{}
				if err := json.Unmarshal(v, &jsonData); err != nil {
					return fmt.Errorf("invalid JSON data for key %s: %v", key, err)
				}

				prettyJSON, err := json.MarshalIndent(jsonData, "", "  ")
				if err != nil {
					return fmt.Errorf("error formatting JSON for key %s: %v", key, err)
				}

				// Write the file
				if err := ioutil.WriteFile(filePath, prettyJSON, 0644); err != nil {
					return fmt.Errorf("error writing file %s: %v", filePath, err)
				}

				count++
				return nil
			})

			if err != nil {
				fmt.Printf("Error processing key %s: %v\n", key, err)
			}
		}
		return nil
	})

	if err != nil {
		fmt.Printf("\nError during export: %v\n", err)
		return
	}

	duration := time.Since(start)
	fmt.Printf("\nExport completed:\n")
	fmt.Printf("Files exported: %d\n", count)
	fmt.Printf("Time taken: %v\n\n", duration)

	// Verify file system
	fmt.Println("File system contents after export:")
	fmt.Println("----------------------------------")
	filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if !info.IsDir() && strings.HasSuffix(path, ".json") {
			fmt.Printf("File: %s\n", path)
		}
		return nil
	})
}

func performPermaboom() {
	fmt.Printf("\nStarting permaboom operation...\n")

	// Close the existing database connection
	if err := dbsDB.Close(); err != nil {
		fmt.Printf("Error closing database: %v\n", err)
		return
	}

	// Delete the database directory
	if err := os.RemoveAll("dbs_data"); err != nil {
		fmt.Printf("Error deleting database directory: %v\n", err)
		return
	}

	fmt.Printf("Database deleted successfully.\n")

	// Reopen the database with fresh options
	opts := badger.DefaultOptions("dbs_data").WithLogger(nil)
	var err error
	dbsDB, err = badger.Open(opts)
	if err != nil {
		fmt.Printf("Error reopening database: %v\n", err)
		return
	}

	fmt.Printf("Database reopened successfully.\n")
	fmt.Printf("Starting fresh migration...\n\n")

	// Perform the migration
	performMigration()

	fmt.Printf("\nPermaboom completed successfully!\n\n")
}

//////////////

func main() {
	// Initialize BadgerDB
	opts := badger.DefaultOptions("ward_data").WithLogger(nil)
	var err error
	db, err = badger.Open(opts)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Initialize BadgerDB for DBS
	opts = badger.DefaultOptions("dbs_data").WithLogger(nil)
	dbsDB, err = badger.Open(opts)
	if err != nil {
		log.Fatalf("Failed to open DBS database: %v", err)
	}
	defer dbsDB.Close()

	initLogger()
	logEntry(fmt.Sprintf("ward was activated! %s", time.Now()))

	apacheServerURL, err := url.Parse("http://localhost:3301")
	if err != nil {
		log.Fatal(err)
	}
	proxy = httputil.NewSingleHostReverseProxy(apacheServerURL)

	// Start the periodic transaction check
	startTransactionCheck()

	// Start terminal input in a separate goroutine
	go startTerminalInput()

	router := http.NewServeMux()
	router.HandleFunc("/httx_get/", httx_get)
	//a request for html from a httx cached
	//router.HandleFunc("/httx_set/", httx_set)
	//a request to cache a broadcast(?) httx
	router.HandleFunc("/command/", atc_com)
	//atc tower simulation for mud style clients
	router.HandleFunc("/dvrbox/", dvrbox_send)
	//DEPRICATED
	router.HandleFunc("/dvrmod/", dvrmod_send)
	//DEPRECATED
	router.HandleFunc("/vending/", vending_send)
	//DEPRECATED
	router.HandleFunc("/solicit/", solicit_offer)
	//a request for an offer to be generated for a program
	router.HandleFunc("/dbs/", dbs)
	//a request for dvr items
	router.HandleFunc("/port/", port)
	//a request for a JWT token
	router.HandleFunc("/subscribe", subscribe)
	//mailing list
	router.HandleFunc("/", serve)
	//default to attempting to serve file via route
	router.HandleFunc("/waltar_register/", waltar_register)
	router.HandleFunc("/waltar_login/", waltar_login)
	//WALTAR
	router.HandleFunc("/vendor_check", vendor_check)
	router.HandleFunc("/register_vendor", register_vendor)
	//VENDING

	fmt.Println("ward transponder is active")
	fmt.Println("Type 'help' for available commands")
	catalog("ward", "transponder is active")

	// New PDS routes
	router.HandleFunc("/xrpc/_health", pdsHealth)
	router.HandleFunc("/tls-check", pdsTLSCheck)

	log.Fatal(http.ListenAndServe(":8081", router))
	defer close(logEntries)
}

// PDS health check endpoint
func pdsHealth(w http.ResponseWriter, r *http.Request) {
	resp := HealthResponse{Version: "0.0.1"}
	json.NewEncoder(w).Encode(resp)
}

// PDS TLS check endpoint
func pdsTLSCheck(w http.ResponseWriter, r *http.Request) {
	domain := r.URL.Query().Get("domain")
	if domain == "" {
		http.Error(w, `{"error":"InvalidRequest","message":"bad or missing domain query param"}`, http.StatusBadRequest)
		return
	}

	// Create XRPC client for domain check
	client := &xrpc.Client{
		Host: "https://" + domain,
	}

	// Attempt to connect to domain
	req, err := http.NewRequest("GET", client.Host+"/xrpc/_health", nil)
	if err != nil {
		http.Error(w, `{"error":"InvalidRequest","message":"failed to create request"}`, http.StatusBadRequest)
		return
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, `{"error":"NotFound","message":"handle not found for this domain"}`, http.StatusNotFound)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}
