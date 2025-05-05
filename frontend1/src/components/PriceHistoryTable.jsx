import React, { useState } from "react";
import axios from "axios";
import ModalComponent from "./Modal";
import GameDetailsPage from "./GameDetailsPage";
import Table from "react-bootstrap/Table";

function PriceHistoryTable({ priceHistory, onClose }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

  const openModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getPriceData = (product) => {
    return product.priceHistory[0];
  };

  const getPriceChange = (product) => {
    if (product.priceHistory.length < 2) return 0;
    const currentPrice = product.priceHistory[0].price / 100;
    const lastPrice = product.priceHistory[1].price / 100;
    const change = 100 - (currentPrice / lastPrice) * 100;
    return Math.round(change * 100) / 100;
  };

  const sendEmail = (product) => {
    if (getPriceChange(product) > 0) {
      try {
        const data = {
          name: product.title,
          price: product.currentPrice,
          date: product.d,
        };
        axios.post("/send-email", data);
      } catch (error) {
        console.error("Error sending price change email:", error);
      }
    }
  };

  return (
    <div>
      <center>
        <h2>Price History</h2>
      </center>
      {priceHistory.map((product) => {
        const priceData = getPriceData(product);
        const change = getPriceChange(product);

        return (
          <Table
            striped
            key={product.id}
            size="sm"
            style={{ maxWidth: "600px", margin: "auto" }}
          >
            <tr>
              <th>Updated At</th>
              <td>{priceData.date}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>
                <a onClick={() => openModal(product)}>{product.title}</a>
              </td>
            </tr>
            <tr>
              <th>Price</th>
              <td>{priceData.price / 100} zł</td>
            </tr>
            <tr>
              <th>Price Change</th>
              <td style={{ color: change > 0 ? "red" : "green" }}>
                {change >= 0 && "+"}
                {change}%
              </td>
            </tr>
          </Table>
        );
      })}

      <button onClick={onClose}>Close</button>
      <ModalComponent
        isOpen={isModalOpen}
        closeModal={closeModal}
        content={<GameDetailsPage product={currentProduct} />}
      />
    </div>
  );
}

export default PriceHistoryTable;
