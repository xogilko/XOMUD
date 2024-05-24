package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	mrand "math/rand"
	"net/http"
	"os"
	"strconv"
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
func compileScrypt(w http.ResponseWriter, r *http.Request) {
	// Read TypeScript code from the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	// Load the Scrypt compiler JavaScript code (assuming it's stored locally)
	scryptCompilerJS, err := os.ReadFile("path/to/scrypt-compiler.js")
	if err != nil {
		http.Error(w, "Failed to load Scrypt compiler", http.StatusInternalServerError)
		return
	}

	// Initialize the JavaScript runtime
	vm := goja.New()
	_, err = vm.RunString(string(scryptCompilerJS)) // Load the Scrypt compiler
	if err != nil {
		http.Error(w, "Failed to execute Scrypt compiler code", http.StatusInternalServerError)
		return
	}

	// Prepare the TypeScript code as a JavaScript string
	tsCode := string(body)

	// Construct the JavaScript command to compile the TypeScript code
	compileCmd := fmt.Sprintf(`ScryptCompiler.compile(%s)`, strconv.Quote(tsCode))

	// Run the compilation
	val, err := vm.RunString(compileCmd)
	if err != nil {
		http.Error(w, "Scrypt compilation failed", http.StatusInternalServerError)
		return
	}

	// Extract the compiled script from the result
	compiledScript, ok := val.Export().(string)
	if !ok {
		http.Error(w, "Failed to convert compilation result to string", http.StatusInternalServerError)
		return
	}

	// Send the compiled script as response
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(compiledScript))
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
