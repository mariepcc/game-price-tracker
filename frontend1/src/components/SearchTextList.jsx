import React from "react";
import Slider from "react-slick";
import { Button} from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SearchTextList({
  games,
  searchTexts,
  onSearchTextClick,
  onRemoveTextClick,
}) {
  const getImageForSearchText = (searchText) => {
    const match = games
      .filter((game) => game && typeof game.title === "string" && game.title)
      .find((game) =>
        game.title.toLowerCase().includes(searchText.toLowerCase())
      );
    return match?.image || "/Users/marysiapacocha/Downloads/IMG_9201.PNG";
  };

  const settings = {
    className: "center",
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 5,
    swipeToSlide: true,
    slidesToScroll: 2,
    afterChange: function (index) {
      console.log(`Slider Changed to: ${index + 1}`);
    },
  };

  return (
    <div className="content">
      <h1 className="header">All searched games:</h1>
      <div className="container">
        <Slider {...settings}>
          {searchTexts.map((searchText) => (
            <div key={searchText}>
              <div className="img-body">
                <img
                  src={getImageForSearchText(searchText)}
                  alt={searchText}
                  onClick={() => onSearchTextClick(searchText)}
                />
              </div>
              <div>
                <h2>{searchText}</h2>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onRemoveTextClick(searchText)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default SearchTextList;
