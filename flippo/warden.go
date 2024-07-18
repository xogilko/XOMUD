package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/dop251/goja"
)

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
