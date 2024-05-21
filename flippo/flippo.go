package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	mrand "math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/dop251/goja"
)

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
		return nil, fmt.Errorf("error fetching transaction details: status code %d", resp.StatusCode)
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

	src := mrand.NewSource(time.Now().UnixNano())
	rnd := mrand.New(src)
	randomIndex := rnd.Intn(1000000)

	// JavaScript to generate the address
	jsCode := fmt.Sprintf(`
        const hdPublicKey = bsv.HDPublicKey.fromString('%s');
        const childKey = hdPublicKey.deriveChild('m/0/0/' + %d);
        const address = childKey.publicKey.toAddress('testnet');
        address.toString();
    `, pubkey, randomIndex)

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
	vouts, ok := txDetails["vout"].([]interface{})
	if !ok {
		return "", "", fmt.Errorf("vout data is missing or not in expected format")
	}

	vins, ok := txDetails["vin"].([]interface{})
	if !ok {
		return "", "", fmt.Errorf("vin data is missing or not in expected format")
	}

	// Collect all addresses from vin to exclude them
	vinAddresses := make(map[string]bool)
	for _, vin := range vins {
		vinMap, ok := vin.(map[string]interface{})
		if !ok {
			continue
		}
		scriptSig, ok := vinMap["scriptSig"].(map[string]interface{})
		if !ok {
			continue
		}
		addresses, ok := scriptSig["addresses"].([]interface{})
		if ok {
			for _, addr := range addresses {
				addrStr, ok := addr.(string)
				if ok {
					vinAddresses[addrStr] = true
				}
			}
		}
	}

	var opReturnData string
	var address string

	// First, extract OP_RETURN data if available
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
		if ok && strings.HasPrefix(asm, "OP_RETURN ") {
			hexData := strings.TrimPrefix(asm, "OP_RETURN ")
			decodedBytes, err := hex.DecodeString(hexData)
			if err != nil {
				return "", "", fmt.Errorf("error decoding hex to ASCII: %w", err)
			}
			opReturnData = string(decodedBytes)
			break // OP_RETURN data found, no need to check further
		}
	}

	// Then, find the first valid address not in vin
	for _, vout := range vouts {
		voutMap, ok := vout.(map[string]interface{})
		if !ok {
			continue
		}
		scriptPubKey, ok := voutMap["scriptPubKey"].(map[string]interface{})
		if !ok {
			continue
		}
		if scriptPubKey["type"].(string) == "pubkeyhash" {
			addresses, ok := scriptPubKey["addresses"].([]interface{})
			if ok && len(addresses) > 0 {
				firstAddress, ok := addresses[0].(string)
				if ok && !vinAddresses[firstAddress] {
					address = firstAddress
					break // Found a valid address not in vin
				}
			}
		}
	}

	if opReturnData == "" {
		return "", "", fmt.Errorf("no OP_RETURN data found")
	}
	if address == "" {
		return "", "", fmt.Errorf("no valid address found")
	}

	return opReturnData, address, nil
}

func atc_com(w http.ResponseWriter, r *http.Request) {
	Message := template.HTMLEscapeString(r.PostFormValue("set-message"))
	log.Printf("Received message: %s", Message) // Log the received message

	formattedLog := fmt.Sprintf("<li><i>&></i> %s</li>", Message)
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

func vending_send(w http.ResponseWriter, r *http.Request) {
	//access flippo database
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
		responseItems[key] = map[string]interface{}{
			"keyName": key,
			"price":   price,
			"desc":    desc,
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
			vendor := item["vendor"].(string)
			vendorData := data["vendorIndex"].(map[string]interface{})[vendor].(map[string]interface{})
			hdpub := vendorData["hdpub"].(string)

			address, err := generateAddress(hdpub)
			if err != nil {
				log.Printf("Error generating address: %v", err)
				http.Error(w, "Error generating address", http.StatusInternalServerError)
				return
			}

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
func dirmod_send(w http.ResponseWriter, r *http.Request) {
	// Load data from JSON file
	data := loadData() // Ensure loadData() is defined to read from 'data.json'
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: dirDatabase format incorrect", http.StatusInternalServerError)
		return
	}
	log.Printf("Request method: %s", r.Method) // Log the method of the request
	// Extract the module path from the request URL
	modulePath := r.URL.Path[len("/dirmod/"):]
	if !strings.HasSuffix(modulePath, ".js") {
		modulePath += ".js"
	}
	moduleFilePath := "module/" + modulePath
	log.Printf("dirmod serving: %s", moduleFilePath)

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
			//		performer, ok := requestData["performer"].(string)
			if !ok {
				http.Error(w, "Invalid client data", http.StatusBadRequest)
				return
			}
			txid, ok := requestData["tx"].(string)
			if !ok {
				http.Error(w, "Invalid client data", http.StatusBadRequest)
				return
			}
			// research tx
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
			log.Printf("Extracted OP_RETURN data: %s", extractHash)
			log.Printf("reconstructed hash: %s", hashed)

			//compare to verify transaction
			if extractHash != hashed {
				http.Error(w, "Forbidden: Hash mismatch", http.StatusForbidden)
				return
			}
		}
	}
	// Serve the file based on the module path
	http.ServeFile(w, r, moduleFilePath)
}
func dirbox_send(w http.ResponseWriter, r *http.Request) {
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
	var uris []string
	uriInterface, ok := client["uri"].([]interface{})
	if !ok {
		http.Error(w, "URI data is missing or not a list", http.StatusBadRequest)
		return
	}
	for _, uri := range uriInterface {
		uriStr, ok := uri.(string)
		if !ok {
			http.Error(w, "URI contains non-string elements", http.StatusBadRequest)
			return
		}
		uris = append(uris, uriStr)
	}
	hostName, ok := client["href"].(string)
	if !ok {
		http.Error(w, "Host data is missing or not a string", http.StatusBadRequest)
		return
	}
	// Process databse URIs and hostnames
	data := loadData()
	dirDatabase, ok := data["dirDatabase"].(map[string]interface{})
	if !ok {
		http.Error(w, "Internal Server Error: dirDatabase format incorrect", http.StatusInternalServerError)
		return
	}
	uriMap, ok := dirDatabase["uri"].(map[string]interface{})
	if !ok {
		log.Fatal("Expected 'uri' to be a map[string]interface{}")
	}
	hostsMap, ok := dirDatabase["hosts"].(map[string]interface{})
	if !ok {
		log.Fatal("Expected 'hosts' to be a map[string]interface{}")
	}
	hostEntries, ok := hostsMap[hostName].(map[string]interface{})
	if !ok {
		log.Printf("No host entries found for hostname: %s", hostName)
	}
	//collect urls
	var urls []string
	for _, uri := range uris {
		if dirNames, ok := uriMap[uri].([]interface{}); ok {
			for _, dirName := range dirNames {
				dirNameStr, ok := dirName.(string)
				if !ok {
					log.Printf("Expected directory name to be a string, got: %v", dirName)
					continue
				}
				urls = append(urls, "/flippo/dirmod/"+dirNameStr)
			}
		}
	}
	for _, uri := range uris {
		dirNames, ok := hostEntries[uri].([]interface{})
		if !ok {
			log.Printf("No directory names found for URI: %s", uri)
			continue
		}
		for _, dirName := range dirNames {
			dirNameStr, ok := dirName.(string)
			if !ok {
				log.Printf("Expected directory name to be a string, got: %v", dirName)
				continue
			}
			urls = append(urls, "/flippo/dirmod/"+dirNameStr)
		}
	}

	log.Printf("dirbox urls: %s", urls)
	// Convert the list of URLs to JSON and send it back to the client
	jsonResponse, err := json.Marshal(urls)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func main() {
	router := http.NewServeMux()
	router.HandleFunc("/command/", atc_com)
	//atc tower simulation for mud style clients
	router.HandleFunc("/dirbox/", dirbox_send)
	//a request is received for a list of imports
	router.HandleFunc("/dirmod/", dirmod_send)
	//a request is received for import of module
	router.HandleFunc("/vending/", vending_send)
	//list of contents from department
	router.HandleFunc("/solicit/", solicit_offer)

	fmt.Println("Command server is active")
	log.Fatal(http.ListenAndServe(":8081", router))
}
