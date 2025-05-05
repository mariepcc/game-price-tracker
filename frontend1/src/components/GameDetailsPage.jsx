import React from "react";
import ApexCharts from "react-apexcharts";
import "../styles/GameDetailsPage.css";

const GameDetailsPage = ({ product }) => {
  const {
    title,
    description, 
    image,
    screenshot,
    regular_price,
    url,
    created_at: createdAt,
    priceHistory,
  } = product;

  function formatDate(date) {
    var aaaa = date.getFullYear();
    var gg = date.getDate();
    var mm = date.getMonth() + 1;

    if (gg < 10) gg = "0" + gg;

    if (mm < 10) mm = "0" + mm;

    var cur_day = aaaa + "-" + mm + "-" + gg;

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    if (hours < 10) hours = "0" + hours;

    if (minutes < 10) minutes = "0" + minutes;

    if (seconds < 10) seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds;
  }

  const dates = priceHistory
    .map((history) => formatDate(new Date(history.date)))
    .reverse();
  const prices = priceHistory.map((history) => history.price / 100).reverse();
  console.log(prices)

  const chartData = {
    options: {
      chart: {
        id: "price-chart",
      },
      xaxis: {
        categories: dates, // Example categories (dates)
      },
    },
    series: [
      {
        name: "Price",
        data: prices, // Example data
      },
    ],
  };

  return (
    <div className="game-details-container"
    style={{
      backgroundImage: `url(${screenshot})`,
    }}>
      <h2 className="game-title">{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Game Description:</td>
            <td>{description}</td>
          </tr>
          <tr>
            <td>Url:</td>
            <td>{url}</td>
          </tr>
          <tr>
            <td>Newest Price At:</td>
            <td>{createdAt}</td>
          </tr>
          <tr>
            <td>Regular price:</td>
            <td>{regular_price / 100} zł</td>
          </tr>
          <tr>
            <td>Current Price:</td>
            <td>{prices.length > 0 ? prices[prices.length - 1] : "N/A"} zł</td>
          </tr>
        </tbody>
      </table>
      <div className="chart-container">
      <ApexCharts
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={300}
      />
      </div>
    </div>
  );
};

export default GameDetailsPage;