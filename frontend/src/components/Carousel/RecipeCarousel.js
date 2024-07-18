import React, { Component } from "react";
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

class RecipeCarousel extends Component {

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
                
                <div className="CardContent">
                    
                    <div className="RecipeTitle">{this.props.recipeTitle}</div>
                    <div className="RecipeIngredients">{this.props.recipeIngredients}</div>
          
                </div>
                
            </Carousel>

        );
    }

}

export default RecipeCarousel;