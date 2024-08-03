import React, { useState, useEffect, useRef } from "react";
import * as SDCCore from "scandit-web-datacapture-core";
import * as SDCBarcode from "scandit-web-datacapture-barcode";

const Add_Item = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeData, setBarcodeData] = useState("");
  const [scannedCodes, setScannedCodes] = useState([]);
  const [productDetailsList, setProductDetailsList] = useState([]);
  const [itemScannedMessage, setItemScannedMessage] = useState(false);
  const scannerRef = useRef(null);
  const [formData, setFormData] = useState({
    iname: "",
    unit: "count",
    quantity: 1,
    ripeRating: "",
    itemDescription: "",
  });
  const [image, setImageData] = useState({
    preview: '',
    data: ''
  });

  const licenseKey = process.env.REACT_APP_SCANDIT_LICENSE_KEY;

  useEffect(() => {
    let context, barcodeCapture, camera;

    const initializeScanner = async () => {
      if (isScanning) {
        try {
          await SDCCore.configure({
            licenseKey,
            libraryLocation: "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-barcode@6.x/build/engine/",
            moduleLoaders: [SDCBarcode.barcodeCaptureLoader()],
          });

          context = await SDCCore.DataCaptureContext.create(licenseKey);
          const settings = new SDCBarcode.BarcodeCaptureSettings();

          const allSymbologies = Object.values(SDCBarcode.Symbology);
          settings.enableSymbologies(allSymbologies);

          settings.codeDuplicateFilter = 5000;

          barcodeCapture = await SDCBarcode.BarcodeCapture.forContext(context, settings);

          barcodeCapture.addListener({
            didScan: async (_, session) => {
              const recognizedBarcodes = session.newlyRecognizedBarcodes;
              recognizedBarcodes.forEach(async barcode => {
                if (!scannedCodes.includes(barcode.data)) {
                  console.log("Scanned barcode:", barcode.data);
                  setScannedCodes(prevCodes => [...prevCodes, barcode.data]);
                  const itemDetails = await fetchItemDetails(barcode.data);
                  if (itemDetails) {
                    setProductDetailsList(prevDetails => [...prevDetails, itemDetails]);
                    setFormData({
                      ...formData,
                      iname: itemDetails.name,
                      unit: "count",
                      quantity: 1,
                      ripeRating: "",
                      itemDescription: `${itemDetails.brand} - ${itemDetails.categories} - ${itemDetails.description}`,
                    });
                    setItemScannedMessage(true);
                    setTimeout(() => setItemScannedMessage(false), 3000);
                  }
                }
              });
            },
          });

          camera = SDCCore.Camera.default;
          await camera.applySettings(SDCBarcode.BarcodeCapture.recommendedCameraSettings);
          await context.setFrameSource(camera);

          const view = await SDCCore.DataCaptureView.forContext(context);
          view.connectToElement(scannerRef.current);
          await SDCBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);

          barcodeCapture.enabled = true;
          await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
        } catch (error) {
          console.error("Error initializing scanner:", error);
        }
      }
    };

    initializeScanner();

    return () => {
      if (camera) {
        camera.switchToDesiredState(SDCCore.FrameSourceState.Off);
      }
      if (barcodeCapture) {
        barcodeCapture.enabled = false;
      }
    };
  }, [isScanning, licenseKey]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVisionChange = (e) => {

    const img = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    } 
    setImageData(img);
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

  const handleAddItem = async (product) => {
    const dataToSend = {
      iname: product.name,
      itemDescription: product.itemDescription,
      unit: product.unit,
      quantity: product.quantity,
      barcode: product.barcode,
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

  const handleVision = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append('imgfile', image.data);

    const response = await fetch("http://localhost:3001/detectionObject", {
      method: "POST",
        
      body: dataToSend,
    })
      .then((res) => {
        if(!res.ok) {
          console.log("Failure:" + res.statusText);
          throw new Error('HTTP ' + res.status);
      } else {
          console.log("Success :" + res.statusText);
          return res.text();
      }
      }).then(function(data) {
        console.log(data);
        var img_str = String(data);
          setFormData({
            ...formData,
            iname: img_str
          });
      })

  };

  const fetchItemDetails = async (barcode) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 1) {
          return {
            imageUrl: data.product.image_front_small_url || "No Image",
            name: data.product.product_name || "Unknown Product",
            brand: data.product.brands || "Unknown Brand",
            categories: data.product.categories_tags ? data.product.categories_tags.join(", ") : "Unknown Category",
            description: data.product.generic_name || "No description available",
            barcode: barcode,
          };
        } else {
          console.error("Product not found");
          return null;
        }
      } else {
        console.error("Failed to fetch item details:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      return null;
    }
  };


  return (
    <div className="additem-core">
      <div className="manual-entry">
          
        <br></br>
        <h2>Manual Input</h2>
        <form onSubmit={handleSubmit}>
        <label htmlFor="iname">Item name:</label>
          <input
            type="text"
            id="iname"
            name="iname"
            value={formData.iname}
            onChange={handleInputChange}
          />
          <label htmlFor="itemDescription">Item Description:</label>
          <input
            type="text"
            id="itemDescription"
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleInputChange}
          />
          <label htmlFor="unit">Item Measurement Unit:</label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
          >
            <option value="count">Count</option>
            <option value="gallons">Gallons</option>
            <option value="grams">Grams</option>
          </select>
          <label htmlFor="quantity">Quantity of Item:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <label htmlFor="ripeRating">Item Ripeness Rating (optional):</label>
          <input
            type="text"
            id="ripeRating"
            name="ripeRating"
            value={formData.ripeRating}
            onChange={handleInputChange}
          />
          <input type="submit" className="button submit-button" value="Submit" />
        </form>
      </div>

      <br/>
      
      <div>
        <h2>Take Photo or Upload</h2>
        {image.preview && <img src={image.preview} width='100' height='100'/>}
        <form onSubmit={handleVision} encType="multipart/form-data">
          <input 
            type="file" 
            accept="image/*" 
            id="imgfile" 
            name="imgfile" 
            onChange={handleVisionChange} 
          />
          <button type="submit" className="upload-button">Analyze Image</button>
        </form>
      </div>

      <br/>

      <div className="barcode-scanning">
        <h2>Barcode Scanning</h2>
        <button
          className="button scan-button"
          onClick={() => {
            setScannedCodes([]);
            setIsScanning(!isScanning);
          }}
        >
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
        {isScanning && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setIsScanning(false)}>&times;</span>
              <div ref={scannerRef} className="scanner-view" />
              {itemScannedMessage && <div className="item-scanned-message">Item Scanned</div>}
            </div>
          </div>
        )}
      </div>

      {productDetailsList.length > 0 && (
        <div className="product-details">
          <h3>Scanned Product Details</h3>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Barcode</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {productDetailsList.map((product, index) => (
                <tr key={index}>
                  <td><img src={product.imageUrl} alt="Product" /></td>
                  <td>{product.name}</td>
                  <td>{formData.quantity}</td>
                  <td>{product.barcode}</td>
                  <td>{formData.itemDescription}</td>
                  <td>
                    <button className="button add-button" onClick={() => handleAddItem(product)}>
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Add_Item;