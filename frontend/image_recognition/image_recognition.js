// See Google doc for adding credentials

const fs = require('fs');
const directory_name = "frontend/image_recognition/images"
let filenames = fs.readdirSync(directory_name);

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient(CONFIG);

async function imageProcess(fileName) {
  
    const request = {
        image: {content: fs.readFileSync(fileName)},
    };

    console.log(`File: ${fileName}`);

    const [result] = await client.objectLocalization(request);
    const objects = result.localizedObjectAnnotations;
    objects.forEach(object => {
        
        console.log(`Name: ${object.name}`);
        console.log(`Confidence: ${object.score}`);
        
    });
  }

function recognizeImages(filenames) {
    for (i in filenames) {
        imageProcess(directory_name + '/' + filenames[i])
    }
}

recognizeImages(filenames)
