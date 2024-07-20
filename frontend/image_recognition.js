// See Google doc for adding credentials

async function imageProcess(fileName) {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');
    const fs = require('fs');
  
    // Creates a client
    const client = new vision.ImageAnnotatorClient(CONFIG);
  
    
    const request = {
        image: {content: fs.readFileSync(fileName)},
    };

    const [result] = await client.objectLocalization(request);
    const objects = result.localizedObjectAnnotations;
    objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    });
  }
  const fileName = `./frontend/src/banana.jpeg`;
  imageProcess(fileName);