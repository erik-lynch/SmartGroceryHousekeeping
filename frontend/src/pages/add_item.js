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

  const handleDetected = debounce((data) => {
    if (data && data.codeResult && data.codeResult.code) {
      const code = data.codeResult.code;
      console.log("Detected code:", code); 
      setScannedCodes((prevCodes) => [...prevCodes, code]);
    }
  }, 300); 

  useEffect(() => {
    if (isScanning && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
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
          target: videoRef.current,
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
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        Quagga.stop();
        Quagga.offDetected(handleDetected);
      };
    }
  }, [isScanning]);

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

  return (
    <div className="core">
      <h2>Image Input</h2>
      <form>
        <input type="file" accept="image/*" style={{ display: "none" }} id="button-upload" />
        <label htmlFor="button-upload">
          <FaUpload class="image-icon"/>
        </label>
        <input accept="image/*" id="icon-button-file" type="file" capture="user" style={{ display: "none" }} />
        <label htmlFor="icon-button-file">
          <FaCamera class="image-icon"/>
        </label>
      </form>
      <h2>Manual Input</h2>
      <form>
        <label htmlFor="iname">Item name:</label> <br />
        <input type="text" id="iname" name="iname" /> <br />
        <label htmlFor="unit">Item Measurement Unit:</label> <br />
        <select id="unit" name="unit">
          <option value="count">Count</option>
          <option value="gallons">Gallons</option>
          <option value="grams">Grams</option>
        </select>
        <br />
        <label htmlFor="quantity">Quantity of Item:</label> <br />
        <input type="number" id="quantity" name="quantity" /> <br />
        <label htmlFor="ripe-rating">Item Ripeness Rating (optional):</label> <br />
        <input type="text" id="ripe-rating" name="ripe-rating" /> <br />
        <p>Tags</p>
        <input type="submit" value="Submit"></input>
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
        <div style={{ position: "relative", width: '640px', height: '480px' }}>
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
