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
