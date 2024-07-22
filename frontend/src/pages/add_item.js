import React, { useState, useEffect, useRef } from "react";
import { FaUpload, FaCamera } from "react-icons/fa";
import Quagga from "quagga";
import { debounce } from "lodash";

const Add_Item = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeData, setBarcodeData] = useState("");
  const [scannedCodes, setScannedCodes] = useState([]);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const [formData, setFormData] = useState({
    iname: "",
    unit: "count",
    quantity: 1,
    ripeRating: "",
    itemDescription: "",
  });

  const handleDetected = debounce((data) => {
    if (data && data.codeResult && data.codeResult.code) {
      const code = data.codeResult.code;
      console.log("Detected code:", code);
      setScannedCodes((prevCodes) => [...prevCodes, code]);
    }
  }, 300);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      const videoElement = videoRef.current;

      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          videoElement.srcObject = stream;
          videoElement.play();
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });

      Quagga.init({
        inputStream: {
          type: "LiveStream",
          constraints: {
            facingMode: "environment",
            width: 640,
            height: 480,
          },
          target: videoElement,
        },
        locator: {
          patchSize: "large",
          halfSample: false,
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "upc_reader",
          ],
          debug: {
            drawBoundingBox: true,
            drawScanline: true,
            showPattern: true,
          },
        },
        locate: true,
        numOfWorkers: navigator.hardwareConcurrency,
        frequency: 20,
      }, (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        console.log("Quagga initialized");
        Quagga.start();
      });

      Quagga.onProcessed((result) => {
        const drawingCtx = overlayRef.current.getContext("2d");
        const drawingCanvas = overlayRef.current;

        if (result) {
          drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
          if (result.boxes) {
            result.boxes
              .filter((box) => box !== result.box)
              .forEach((box) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                  color: "green",
                  lineWidth: 2,
                });
              });
          }

          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
              color: "#00F",
              lineWidth: 2,
            });
          }

          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: "x", y: "y" }, drawingCtx, {
              color: "red",
              lineWidth: 3,
            });
            console.log("Barcode detected: ", result.codeResult.code);
          }
        }
      });

      Quagga.onDetected(handleDetected);

      return () => {
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        Quagga.stop();
        Quagga.offDetected(handleDetected);
      };
    }
  }, [isScanning, handleDetected]);

  useEffect(() => {
    if (scannedCodes.length > 0) {
      const counts = {};
      scannedCodes.forEach((code) => {
        counts[code] = (counts[code] || 0) + 1;
      });

      const mostFrequentCode = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
      if (counts[mostFrequentCode] > 2) {
        console.log("Most frequent code:", mostFrequentCode);
        setBarcodeData(mostFrequentCode);
        setIsScanning(false);
      }
    }
  }, [scannedCodes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      barcode: barcodeData,
    };

    try {
      const response = await fetch("http://localhost:3001/api/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Item added successfully");
      } else {
        const errorText = await response.text();
        console.error("Failed to add item:", errorText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="core">
      <h2>Image Input</h2>
      <form>
        <input type="file" accept="image/*" style={{ display: "none" }} id="button-upload" />
        <label htmlFor="button-upload">
          <FaUpload className="image-icon"/>
        </label>
        <input accept="image/*" id="icon-button-file" type="file" capture="user" style={{ display: "none" }} />
        <label htmlFor="icon-button-file">
          <FaCamera className="image-icon"/>
        </label>
      </form>
      <h2>Manual Input</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="iname">Item name:</label> <br />
        <input type="text" id="iname" name="iname" value={formData.iname} onChange={handleInputChange} /> <br />
        <label htmlFor="itemDescription">Item Description:</label> <br />
        <input type="text" id="itemDescription" name="itemDescription" value={formData.itemDescription} onChange={handleInputChange} /> <br />
        <label htmlFor="unit">Item Measurement Unit:</label> <br />
        <select id="unit" name="unit" value={formData.unit} onChange={handleInputChange}>
          <option value="count">Count</option>
          <option value="gallons">Gallons</option>
          <option value="grams">Grams</option>
        </select>
        <br />
        <label htmlFor="quantity">Quantity of Item:</label> <br />
        <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} /> <br />
        <label htmlFor="ripeRating">Item Ripeness Rating (optional):</label> <br />
        <input type="text" id="ripeRating" name="ripeRating" value={formData.ripeRating} onChange={handleInputChange} /> <br />
        <input type="submit" value="Submit" />
      </form>

      <h2>Barcode Scanning</h2>

      <button
        onClick={() => {
          setScannedCodes([]);
          setBarcodeData("");
          setIsScanning(!isScanning);
        }}
      >
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </button>


      {isScanning && (

        <div style={{ position: "relative", width: '640px', height: '480px', margin: '10% 0'}}>

          <video id="scanner" ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay />

          <canvas ref={overlayRef} className="drawingBuffer" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }} />

        </div>
      )}

      {barcodeData && <p>Scanned Barcode: {barcodeData}</p>}
    </div>
  );
};

export default Add_Item;
