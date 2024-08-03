import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import * as SDCCore from "scandit-web-datacapture-core";
import * as SDCBarcode from "scandit-web-datacapture-barcode";


const Add_Item = () => {

  const [categories, setCategories] = useState(null);
  const [selectCategory, setSelectCategory] = useState(null);
  const [productCategory, setProductCategory] = useState(null);
  const [selectProduct, setSelectProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  const [units, setUnits] = useState(null);
  const [today, setToday] = useState(null);
  const [spoilageDate, setSpoilageDate] = useState(null);

  const [isScanning, setIsScanning] = useState(false);
  const [barcodeData, setBarcodeData] = useState("");
  const [scannedCodes, setScannedCodes] = useState([]);
  const [productDetailsList, setProductDetailsList] = useState([]);
  const [itemScannedMessage, setItemScannedMessage] = useState(false);
  const scannerRef = useRef(null);
  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    unit: "",
    quantity: 1,
    ripeRating: "",
    expirationDate: "",

  });

  const licenseKey = process.env.REACT_APP_SCANDIT_LICENSE_KEY;

  // set today to current date
  useEffect(() => {
    setToday(Date());
    console.log(today);
  }, [])

  // fetch units on initial load
  useEffect(() => {

    async function fetchUnits() {

      try {
          const response = await fetch(`http://localhost:3001/units`);
          if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
          }
          setUnits(await response.json());

      } catch (error) {
          console.error(error.message);
          }
  };

  fetchUnits();

  }, [])

  // Spoilage: fetch categories on initial load 
  useEffect(() => {

    async function fetchCategories() {

      try {
          const response = await fetch(`http://localhost:3001/spoilage/categories`);
          if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
          }
          setCategories(await response.json());

      } catch (error) {
          console.error(error.message);
          }
  };

  fetchCategories();

  }, [])
  
  // Spoilage: fetch all items in a category (when a category has been selected)
  useEffect(() => {
    if (selectCategory) {

      async function fetchItems() {

        try {
            const response = await fetch(`http://localhost:3001/spoilage/${selectCategory}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            setProductCategory(await response.json());
  
        } catch (error) {
            console.error(error.message);
            }
    }; 

    fetchItems();

  }}, [selectCategory])

  // Spoilage: fetch item details (when an item has been selected)
  useEffect(() => {
    if (selectProduct) {

      async function fetchItemDetails() {

        try {
            const response = await fetch(`http://localhost:3001/spoilage/product/${selectProduct}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            setProductDetails(await response.json());
  
        } catch (error) {
            console.error(error.message);
            }
    }; 

    fetchItemDetails();

  };
    
  }, [selectCategory, selectProduct])

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
    console.log(formData);
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

  if (!categories || !units) {

    return(<h2>Loading...</h2>)

  } 
  else {

  return (
    <div className="additem-core">

      <div className="manual-entry">
          
        <h2>Manual Input</h2>
        <form onSubmit={handleSubmit}>

        <label htmlFor="itemName">Item name:</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            required
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
            required
          >
            <option value=""></option>
            {units.map((e) => (
            <option value={e.unitid}>{e.unitname}</option>
          ))}
          </select>

          <label htmlFor="quantity">Quantity of Item:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="ripeRating">Item Ripeness Rating (optional):</label>
          <input
            type="text"
            id="ripeRating"
            name="ripeRating"
            value={formData.ripeRating}
            onChange={handleInputChange}
          />

          <label htmlFor="expirationDate">Item Expiration Date:</label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleInputChange}
          />

          <input type="submit" className="button-submit-button" value="Submit" />
        </form>

      </div>

      <div className="spoilage-all">
        <h2>Food Shelf Life Guidelines</h2>

        <div className="spoilage-section-category-1">
        <h3>Select Category:</h3>
        <select name="spoilage-select" onChange={(e) => setSelectCategory(e.target.value)}>
            <option value=""></option>
            {categories.map((e) => (
            <option value={e.categoryid}>{e.categorysubcategory}</option>
          ))}
        </select>
        </div>

        <div className="spoilage-section-category-2">
        {selectCategory && productCategory && <div>
        <h3>Select Product:</h3>
        <select name="spoilage-select" onChange={(e) => setSelectProduct(e.target.value)}>
          <option value=""></option>
          {productCategory.map((e) => (
            <option value={e.productid}>{e.productname}</option>
          ))}
        </select>
        </div>}
        </div>

        
        {selectProduct && productDetails && <div className="spoilage-section-product">
        
        {productDetails.map((e) => (
          <div>
          
          {/* Title and Subtitle */}
          {(e.name && e.subtitle) && <h1>{e.name} - {e.subtitle}</h1>}
          {(e.name && !e.subtitle) && <h1>{e.name}</h1>}
    
          {/* Pantry */}
          {(e.p_min && e.p_max && e.p_metric) && (e.p_min === e.p_max) && <p><b>Pantry:</b> {e.p_max} {e.p_metric}</p>}
          {(e.p_min && e.p_max && e.p_metric) && (e.p_min !== e.p_max) && <p><b>Pantry:</b> {e.p_min}-{e.p_max} {e.p_metric}</p>}
          {(e.dop_p_min && e.dop_p_max && e.dop_p_metric) && (e.dop_p_min === e.dop_p_max) && <p><b>Pantry:</b> {e.dop_p_max} {e.dop_p_metric}</p>}
          {(e.dop_p_min && e.dop_p_max && e.dop_p_metric) && (e.dop_p_min !== e.dop_p_max) && <p><b>Pantry:</b> {e.dop_p_min}-{e.dop_p_max} {e.dop_p_metric}</p>}
          {(e.p_after_opening_min && e.p_after_opening_max && e.p_after_opening_metric) && (e.p_after_opening_min === e.p_after_opening_max) && <p><b>Pantry (After Opening):</b> {e.p_after_opening_max} {e.p_after_opening_metric}</p>}
          {(e.p_after_opening_min && e.p_after_opening_max && e.p_after_opening_metric) && (e.p_after_opening_min !== e.p_after_opening_max) && <p><b>Pantry (After Opening):</b> {e.p_after_opening_min}-{e.p_after_opening_max} {e.p_after_opening_metric}</p>}

          {/* Refrigerator */}
          {(e.r_min && e.r_max && e.r_metric) && (e.r_min === e.r_max) && <p><b>Refrigerator:</b> {e.r_max} {e.r_metric}</p>}
          {(e.r_min && e.r_max && e.r_metric) && (e.r_min !== e.r_max) && <p><b>Refrigerator:</b> {e.r_min}-{e.r_max} {e.r_metric}</p>}
          {(e.dop_r_min && e.dop_r_max && e.dop_r_metric) && (e.dop_r_min === e.dop_r_max) && <p><b>Refrigerator:</b> {e.dop_r_max} {e.dop_r_metric}</p>}
          {(e.dop_r_min && e.dop_r_max && e.dop_r_metric) && (e.dop_r_min !== e.dop_r_max) && <p><b>Refrigerator:</b> {e.dop_r_min}-{e.dop_r_max} {e.dop_r_metric}</p>}
          {(e.r_after_opening_min && e.r_after_opening_max && e.r_after_opening_metric) && (e.r_after_opening_min === e.r_after_opening_max) && <p><b>Refrigerator (After Opening):</b> {e.r_after_opening_max} {e.r_after_opening_metric}</p>}
          {(e.r_after_opening_min && e.r_after_opening_max && e.r_after_opening_metric) && (e.r_after_opening_min !== e.r_after_opening_max) && <p><b>Refrigerator (After Opening):</b> {e.r_after_opening_min}-{e.r_after_opening_max} {e.r_after_opening_metric}</p>}
          {(e.r_after_thawing_min && e.r_after_thawing_max && e.r_after_thawing_metric) && (e.r_after_thawing_min === e.r_after_thawing_max) && <p><b>Refrigerator (After Thawing):</b> {e.r_after_thawing_max} {e.r_after_thawing_metric}</p>}
          {(e.r_after_thawing_min && e.r_after_thawing_max && e.r_after_thawing_metric) && (e.r_after_thawing_min !== e.r_after_thawing_max) && <p><b>Refrigerator (After Thawing):</b> {e.r_after_thawing_min}-{e.r_after_thawing_max} {e.r_after_thawing_metric}</p>}

          {/* Freezer */}
          {(e.f_min && e.f_max && e.f_metric) && (e.f_min === e.f_max) && <p><b>Freezer:</b> {e.f_max} {e.f_metric}</p>}
          {(e.f_min && e.f_max && e.f_metric) && (e.f_min !== e.f_max) && <p><b>Freezer:</b> {e.f_min}-{e.f_max} {e.f_metric}</p>}
          {(e.dop_f_min && e.dop_f_max && e.dop_f_metric) && (e.dop_f_min !== e.dop_f_max) && <p><b>Freezer:</b> {e.dop_f_max} {e.dop_f_metric}</p>}
          {(e.dop_f_min && e.dop_f_max && e.dop_f_metric) && (e.dop_f_min !== e.dop_f_max) && <p><b>Freezer:</b> {e.dop_f_min}-{e.dop_f_max} {e.dop_f_metric}</p>}
          

          <br/>

          {/* Tips */}
          {(e.p_tips || e.r_tips || e.f_tips || e.dop_p_tips || e.dop_r_tips || e.dop_f_tips) && <h2>Tips</h2>}
          {e.p_tips && <p><b>Pantry:</b> {e.p_tips}</p>}
          {e.dop_p_tips && <p><b>Pantry:</b> {e.dop_p_tips}</p>}
          {e.r_tips && <p><b>Refrigerator: </b> {e.r_tips}</p>}
          {e.dop_r_tips && <p><b>Refrigerator:</b> {e.dop_r_tips}</p>}
          {e.f_tips && <p><b>Freezer: </b>{e.f_tips}</p>}
          {e.dop_f_tips && <p><b>Freezer:</b> {e.dop_f_tips}</p>}

          <br/>

          {/* Use Expiration Date */}
          <h2>Use Expiration Date</h2>
          <p>The average of the selected expiration values will be added to the manual entry form above.</p>

          {/* Pantry: pantry, pantry (opened) */}
          {((e.p_min && e.p_max && e.p_metric) || (e.dop_p_min && e.dop_p_max && e.dop_p_metric) || (e.p_after_opening_min && e.p_after_opening_max && e.p_after_opening_metric)) 
          && <button type="submit">Pantry</button>}
          {((e.p_after_opening_min && e.p_after_opening_max && e.p_after_opening_metric)) 
          && <button type="submit">Pantry (opened)</button>}

          {/* Refrigerator: refrigerator, refrigerator (opened), refrigerator (thawed) */}
          {((e.r_min && e.r_max && e.r_metric) || (e.dop_r_min && e.dop_r_max && e.dop_r_metric)) 
          && <button type="submit">Refrigerator</button>}
          {(e.r_after_opening_min && e.r_after_opening_max && e.r_after_opening_metric) 
          && <button type="submit">Refrigerator (opened)</button>}
          {(e.r_after_thawing_min && e.r_after_thawing_max && e.r_after_thawing_metric) 
          && <button type="submit">Refrigerator (thawed)</button>}
          
          {/* Freezer */}
          {((e.f_min && e.f_max && e.f_metric) || (e.dop_f_min && e.dop_f_max && e.dop_f_metric)) 
          && <button type="submit">Freezer</button>}

    
          </div>
        ))}
        </div>}

        
      </div>


      <div>
        <h2>Take Photo or Upload</h2>
        <form action="http://localhost:3001/detectionObject" method="post" encType="multipart/form-data">
          <input type="file" accept="image/*" id="imgfile" name="imgfile" />
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
}};

export default Add_Item;