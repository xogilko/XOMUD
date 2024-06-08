import { sha256, toByteString, SmartContract } from 'scrypt-ts'
import * as fs from 'fs'
import * as path from 'path'

async function generateLockingScript(contractName: string) {
    const contractPath = path.join(__dirname, 'src', 'contracts', `${contractName}.ts`)
    if (!fs.existsSync(contractPath)) {
        console.error(`Contract ${contractName} does not exist at path ${contractPath}`)
        return
    }

    // Dynamically import the contract
    const contractModule = await import(contractPath)
    const ContractClass = contractModule[contractName]

    if (!ContractClass) {
        console.error(`Contract class ${contractName} not found in ${contractPath}`)
        return
    }

    await ContractClass.loadArtifact()

    const instance = new ContractClass(
        sha256(toByteString('hello world', true))
    )

    const lockingScript = instance.lockingScript.toASM()
    console.log(`ASM Locking Script for ${contractName}: ${lockingScript}`)

    // Function to delete all contents of a directory
    function deleteDirectoryContents(directoryPath: string) {
        fs.readdir(directoryPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                fs.lstat(filePath, (err, stats) => {
                    if (err) throw err;

                    if (stats.isDirectory()) {
                        deleteDirectoryContents(filePath);
                        fs.rmdir(filePath, (err) => {
                            if (err) throw err;
                        });
                    } else {
                        fs.unlink(filePath, (err) => {
                            if (err) throw err;
                        });
                    }
                });
            }
        });
    }
        // Delete contents of the artifacts directory
        const artifactsDir = path.join(__dirname, 'artifacts');
        deleteDirectoryContents(artifactsDir);
    
        // Delete contents of the src/contracts directory
        const contractsDir = path.join(__dirname, 'src/contracts');
        deleteDirectoryContents(contractsDir);
}
generateLockingScript(process.argv[2])