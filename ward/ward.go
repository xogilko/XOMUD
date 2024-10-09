package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/dop251/goja"
)

var proxy *httputil.ReverseProxy

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
	logEntry(fmt.Sprintf("mailing list entry! %s", email))
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
	data := loadData() // Ensure loadData() is defined to read from 'data.json'
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		log.Printf("Error: dirDatabase format incorrect")
		http.Error(w, "Internal Server Error: dirDatabase format incorrect", http.StatusInternalServerError)
		return
	}
	chanIndex, ok := dirDatabase["chan_register"].(map[string]interface{})
	if !ok {
		log.Printf("Error: chan_register format incorrect, dirDatabase: %v, chanIndex: %v", dirDatabase, dirDatabase["chan_register"])
		http.Error(w, "Internal Server Error: chan_register format incorrect", http.StatusInternalServerError)
		return
	}
	log.Printf("request serving: %s", "dbs begun")
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
	userfriendly, ok := config["user-friendly"]
	if !ok {
		userfriendly = "true" // user-friendly implicitly true unless prop exist
	}
	chanValue, ok := config["chan"].(string)
	if !ok {
		log.Printf("Error: Invalid chan value")
		http.Error(w, "Invalid chan value", http.StatusBadRequest)
		return
	}
	ccList, ok := msg["to"].([]interface{})
	if !ok {
		log.Printf("Error: Invalid cc list %s", msg)
		http.Error(w, "Invalid cc list", http.StatusBadRequest)
		return
	}
	log.Printf("dbs ccList %s chan: %s", ccList, chanValue)
	combinedData := make(map[string]interface{})
	// Create a JSON entry for metadata - address etc.
	dbsSig := "0254578b3cd7bcb348cd97bdd0493ef0f5f336abd2590b2aef34a59bd287bc96a6" // skelly pubkey
	chanAddress, ok := chanIndex[chanValue].(string)
	if !ok {
		log.Printf("Error: Invalid chan address")
		http.Error(w, "Invalid chan address", http.StatusInternalServerError)
		return
	}
	combinedData["_dbs_meta"] = map[string]interface{}{
		"signature":   dbsSig,
		"chanValue":   chanValue,
		"chanAddress": chanAddress,
		"note":        "this is for metadata from dbs",
	}
	// Iterate through ccList
	for _, ccItem := range ccList {
		ccStr, ok := ccItem.(string)
		if !ok {
			log.Printf("Error: Invalid cc item")
			http.Error(w, "Invalid cc item", http.StatusBadRequest)
			return
		}

		// Split the entry into aux path and art name
		auxArtParts := strings.Split(ccStr, ":&:")
		auxPath := auxArtParts[0]
		var artName string
		if len(auxArtParts) > 1 {
			artName = auxArtParts[1]
		}

		// Read JSON data from the file or directory
		var jsonData map[string]interface{}
		if artName != "" {
			// Specific art file
			log.Printf("dbs auxparts %s", auxArtParts)
			filePath := filepath.Join("dbs/main", auxPath, artName+".json")
			jsonData, err = readJSONFile(filePath)
			if err != nil {
				log.Printf("Error reading file: %v", err)
				combinedData[artName] = map[string]interface{}{
					"error": fmt.Sprintf("Error reading file: %v", err),
				}
				continue
			}
		} else {
			// Entire aux directory
			dirPath := filepath.Join("dbs/main", auxPath)
			jsonData, err = readJSONDir(dirPath)
			if err != nil {
				log.Printf("Error reading directory: %v", err)
				combinedData[auxPath] = map[string]interface{}{
					"error": fmt.Sprintf("Error reading directory: %v", err),
				}
				continue
			}
		}
		var fee, subfee, vendor interface{}
		if artName != "" {
			vendor = jsonData["vendor"]
			fee = jsonData["fee"]
			subfee = jsonData["subfee"]
			userfriendly = jsonData["user-friendly"]
		} else {
			// Find the key that matches the last portion of the auxPath with an underscore prefix
			auxPathParts := strings.Split(auxPath, "/")
			lastPart := auxPathParts[len(auxPathParts)-1]
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
			// Split the remaining parts on ';;' to handle fee and subfee receipts
			feeParts := strings.Split(ccStr, ";;")

			// Check fee requirements
			if !checkFee(auxPath, artName, feeParts, fee, vendor, subfee) {
				continue
			}
		}

		// Add JSON data to combinedData
		if artName != "" {
			combinedData[artName] = jsonData
		} else {
			for key, value := range jsonData {
				combinedData[key] = value
			}
		}
	}

	jsonResponse, err := json.Marshal(combinedData)
	if err != nil {
		log.Printf("Error creating JSON response: %v", err)
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
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
	// Open the JSON file
	jsonFile, err := os.Open("data.json")
	if err != nil {
		log.Fatalf("Error opening JSON file: %v", err)
	}
	defer jsonFile.Close()

	// Read the JSON file into a byte array
	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		log.Fatalf("Error reading JSON file: %v", err)
	}

	// Use a map of string to interface{} to hold the JSON data
	var jsonData map[string]interface{}
	err = json.Unmarshal(byteValue, &jsonData)
	if err != nil {
		log.Fatalf("Error unmarshalling JSON: %v", err)
	}

	return jsonData
}
func checkFee(auxPath, artName string, feeParts []string, fee, vendor, subfee interface{}) bool {
	// Check for direct fee
	if fee != nil {
		if fee == 0 { //free regardless of parent
			return true
		}
		if artName != "" {
			// Validate the art for the direct fee
			for _, part := range feeParts {
				if strings.HasPrefix(part, auxPath+":&:"+artName+";fee") {
					receipt := strings.TrimPrefix(part, auxPath+":&:"+artName+";fee;")
					// Placeholder for actual receipt validation
					// if fee is null
					if validateReceipt(receipt, fee, subfee, vendor) {
						return true
					}
				}
			}
			if subfee != nil {
				for _, part := range feeParts {
					if strings.HasPrefix(part, auxPath+":&:"+artName+";sub") {
						receipt := strings.TrimPrefix(part, auxPath+":&:"+artName+";sub;")
						// Placeholder for actual receipt validation
						if validateReceipt(receipt, fee, subfee, vendor) {
							return checkParentFee(auxPath, feeParts)
						}
					}
				}
				return false // Subfee exists but no valid receipt found
			}
		}
		// Validate the aux for the direct fee
		for _, part := range feeParts {
			if strings.HasPrefix(part, auxPath+";fee") {
				receipt := strings.TrimPrefix(part, auxPath+";fee;")
				// Placeholder for actual receipt validation
				if validateReceipt(receipt, fee, subfee, vendor) {
					return true
				}
			}
		}
		//client gave no valid directfee
		return false
	}

	// Check for subfee
	if subfee != nil {
		// Validate the receipt for the subfee
		for _, part := range feeParts {
			if strings.HasPrefix(part, auxPath+";sub") {
				receipt := strings.TrimPrefix(part, auxPath+";sub;")
				// Placeholder for actual receipt validation
				if validateReceipt(receipt, fee, subfee, vendor) {
					// Check parent directories for a direct fee
					return checkParentFee(auxPath, feeParts)
				}
			}
		}
		return false
	}

	// No fee or subfee found, check parent directories
	return checkParentFee(auxPath, feeParts)
}
func checkParentFee(auxPath string, feeParts []string) bool {
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
				if strings.HasPrefix(part, parentPath+";fee") {
					receipt := strings.TrimPrefix(part, parentPath+";fee;")
					// Placeholder for actual receipt validation
					if validateReceipt(receipt, fee, metaFileData["subfee"], metaFileData["vendor"]) {
						return true
					}
				}
			}
			return false
		}
		if subfee, ok := metaFileData["subfee"]; ok {
			// Validate the receipt for the subfee
			for _, part := range feeParts {
				if strings.HasPrefix(part, parentPath+";sub") {
					receipt := strings.TrimPrefix(part, parentPath+";sub;")
					// Placeholder for actual receipt validation
					// Check parent directories for a direct fee
					if validateReceipt(receipt, metaFileData["fee"], subfee, metaFileData["vendor"]) {
						// Continue to the next parent directory
						break
					}
				}
			}
			return false // Subfee exists but no valid receipt found
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
	// Prepend "dbs/main" to the file path

	fileContent, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var fileData map[string]interface{}
	err = json.Unmarshal(fileContent, &fileData)
	if err != nil {
		return nil, err
	}

	// Check if the fileData contains a "reference" property
	if reference, ok := fileData["reference"].(string); ok {
		// Perform the function again on the referenced path
		refpath := filepath.Join("dbs/main", reference)
		return readJSONFile(refpath)
	}

	return fileData, nil
}
func readJSONDir(dirPath string) (map[string]interface{}, error) {
	files, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}
	dirData := make(map[string]interface{})
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".json" {
			filePath := filepath.Join(dirPath, file.Name())
			fileData, err := readJSONFile(filePath)
			if err != nil {
				dirData[file.Name()] = map[string]interface{}{
					"error": fmt.Sprintf("Error reading file: %v", err),
				}
				continue
			}
			key := strings.TrimSuffix(file.Name(), ".json")
			dirData[key] = fileData
		}
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

func main() {

	initLogger()
	logEntry(fmt.Sprintf("ward was activated! %s", time.Now()))

	apacheServerURL, err := url.Parse("http://localhost:3301")
	if err != nil {
		log.Fatal(err)
	}
	proxy = httputil.NewSingleHostReverseProxy(apacheServerURL)

	router := http.NewServeMux()
	router.HandleFunc("/command/", atc_com)
	//atc tower simulation for mud style clients
	router.HandleFunc("/dvrbox/", dvrbox_send)
	//a request is received for a list of imports
	router.HandleFunc("/dvrmod/", dvrmod_send)
	//a request is received for import of module
	router.HandleFunc("/vending/", vending_send)
	//a request for a list of contents from department
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

	fmt.Println("ward transponder is active")
	catalog("ward", "transponder is active")
	log.Fatal(http.ListenAndServe(":8081", router))
	defer close(logEntries)
}
