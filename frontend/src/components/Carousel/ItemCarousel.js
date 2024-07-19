import React, { Children, Component } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import './Carousel.css'

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

            <a href={this.props.link}>
            <div className="CardContent">
                    
              <img 
                src={this.props.imagePath}
                style={{ width: "100%", 
                        height: "80%" }}
                alt={this.props.altText} 
              />

                <div className="item-name">{this.props.itemName}</div>
                <div className="item-quantity">{this.props.itemQuantity} {this.props.itemUnit}</div>

            </div>
          </a>

        </Carousel>

        );
    }

}

export default ItemCarousel;