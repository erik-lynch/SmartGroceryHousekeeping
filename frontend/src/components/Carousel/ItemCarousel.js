import { React, Component } from "react";
import { Link } from 'react-router-dom';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const handleNoImage = (e) => {
  e.target.src='/images/no-image.jpg';
}

const responsive = {
  desktop: {
    breakpoint: {
      max: 3000,
      min: 1024
    },
    items: 4,
    partialVisibilityGutter: 40
  },
  mobile: {
    breakpoint: {
      max: 464,
      min: 0
    },
    items: 1,
    partialVisibilityGutter: 30
  },
  tablet: {
    breakpoint: {
      max: 1024,
      min: 464
    },
    items: 2,
    partialVisibilityGutter: 30
  }
};


class ItemCarousel extends Component {

    render() {

        return(

          <Carousel 
            additionalTransfrom={0}
            centerMode={true}
            responsive={responsive}
            ssr={true}              // means to render carousel on server-side.
            infinite={true}
            autoPlay={false}
            deviceType={this.props.deviceType}
            focusOnSelect={false}
            draggable={true}
            removeArrowOnDeviceType={["tablet", "mobile"]}
            containerClass="carousel-container"
            itemClass="carousel-item"
            sliderClass="carousel-slider"
        >  
        
          {this.props.content.map((e) => (

            <div key={e.itemId}>

            <Link to={{
              pathname: `/edit_item/${e.userId}/${e.itemId}/${e.usersItemsId}`,
            }}>
              <div className="card-content">
                      
                <img 
                  className="carousel-image"
                  src={e.imagePath}
                  style={{ width: "100%"}}
                  alt="Image not found"
                  onError={(e) => handleNoImage(e)}
                />

                <div className="card-text">
                  <div className="item-name">{e.itemName}</div>
                  <div className="item-quantity">{e.itemQuantity} {e.itemUnit}</div>
                  <div className="date">{e.formatspoilagedate}{e.formatdateadded}</div>
                </div>

              </div>
            </Link>
            </div>

          ))}
          

        </Carousel>

        );
    }

}

export default ItemCarousel;