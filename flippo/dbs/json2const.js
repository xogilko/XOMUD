const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'main/testkit');
const outputFilePath = path.join(__dirname, 'const_output.js');

let combinedObject = {};

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }

    files.forEach((file) => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(directoryPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const key = path.basename(file, '.json');
            combinedObject[key] = JSON.parse(fileContent);
        }
    });

    const outputContent = `const content = ${JSON.stringify(combinedObject, null, 2)};`;

    fs.writeFile(outputFilePath, outputContent, (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Combined object has been written to boom.js');
        }
    });
});