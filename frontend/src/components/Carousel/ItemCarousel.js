import React, { Component, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import './ItemCarousel.css'

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

/* WIP: Custom arrows */

const CustomRightArrow = ({ onClick, ...rest }) => {
  const {
    onMove,
    carouselState: { currentSlide, deviceType }
  } = rest;
  // onMove means if dragging or swiping in progress.
  return <button onClick={() => onClick()} />;
};

const CustomLeftArrow = ({ onClick, ...rest }) => {
  const {
    onMove,
    carouselState: { currentSlide, deviceType }
  } = rest;
  // onMove means if dragging or swiping in progress.
  return <button onClick={() => onClick()} />;
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
                // customRightArrow={<CustomRightArrow />}
                // customLeftArrow={<CustomLeftArrow />}
            
                containerClass="carousel-container"
                itemClass="carousel-item"
                sliderClass="carousel-slider"
            >
                
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
                <div>Item 4</div>
                <div>Item 5</div>
                <div>Item 6</div>
                <div>Item 7</div>
                <div>Item 8</div>

            </Carousel>

        );
    }

}

export default ItemCarousel;