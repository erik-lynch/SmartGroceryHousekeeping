import { React, Component } from "react";
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
        
          {this.props.content.map((e) => (

            <a href={e.link}>
            <div className="CardContent">
                    
              <img 
                src={e.imagePath}
                style={{ width: "100%"}}
                alt={e.altText} 
              />

                <div className="item-name">{e.itemName}</div>
                <div className="item-quantity">{e.itemQuantity} {e.itemUnit}</div>

            </div>
            </a>

          ))}

        </Carousel>

        );
    }

}

export default ItemCarousel;