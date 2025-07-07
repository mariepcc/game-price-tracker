import React from "react";
import Slider from "react-slick";
import { Button, Card } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ReactComponent as MyIcon } from "../icons/trash-bin-remove-svgrepo-com.svg";

function SearchTextList({
  games,
  searchTexts,
  onSearchTextClick,
  onRemoveTextClick,
}) {
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

  const getImageForSearchText = (searchText) => {
    const match = games
      .filter((game) => game && typeof game.title === "string" && game.title)
      .find((game) =>
        game.title.toLowerCase().includes(searchText.toLowerCase())
      );
    return match?.image || match?.screenshot;
  };

  return (
    <div className="content">
      <h3 className="header">All searched games:</h3>
      <div className="container">
        <Slider {...settings}>
          {searchTexts.map((searchText) => (
            <div key={searchText} className="search-card">
              <Card className="game-card">
                <Card.Img
                  variant="top"
                  className="card-img"
                  src={getImageForSearchText(searchText)}
                  alt={searchText}
                  onClick={() => onSearchTextClick(searchText)}
                />
                <Card.Body
                  className="card-body"
                  style={{ backgroundColor: "black" }}
                >
                  <h3>{searchText}</h3>
                  <Button
                    size="sm"
                    variant="light"
                    className="icon-button"
                    onClick={() => onRemoveTextClick(searchText)}
                  >
                    <MyIcon style={{ width: "18px", height: "16px" }} />
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default SearchTextList;
