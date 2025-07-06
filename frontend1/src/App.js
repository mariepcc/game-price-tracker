import { useState, useEffect } from "react";
import SearchTextList from "./components/SearchTextList";
import PriceHistoryTable from "./components/PriceHistoryTable";
import TrackedGamesList from "./components/TrackedGamesList";
import axios from "axios";
import "./App.css";
import { Button, Form } from "react-bootstrap";

const URL = "http://127.0.0.1:5000";

function App() {
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [searchedGames, setSearchedGames] = useState([]);
  const [searchTexts, setSearchTexts] = useState([]);
  const [newSearchText, setNewSearchText] = useState("");

  useEffect(() => {
    fetchUniqueSearchTexts();
    fetchSearchedGames();
  }, []);

  const fetchUniqueSearchTexts = async () => {
    try {
      const response = await axios.get(`${URL}/unique_search_texts`);
      setSearchTexts(response.data);
    } catch (error) {
      console.error("Error fetching unique search texts:", error);
    }
  };

  const fetchSearchedGames = async () => {
    try {
      const response = await axios.get(`${URL}/all-results`);
      setSearchedGames(response.data);
    } catch (error) {
      console.error("Error fetching all searched games:", error);
    }
  };

  const handleSearchTextClick = async (searchText) => {
    try {
      const response = await axios.get(
        `${URL}/results?search_text=${searchText}`
      );
      setPriceHistory(response.data);
      setShowPriceHistory(true);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  const handlePriceHistoryClose = () => {
    setShowPriceHistory(false);
    setPriceHistory([]);
  };

  const handleNewSearchTextChange = (event) => {
    setNewSearchText(event.target.value);
  };

  const handleNewSearchTextSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(`${URL}/get-game`, {
        search_text: newSearchText,
      });

      await fetchUniqueSearchTexts();
      await fetchSearchedGames();

      setNewSearchText("");
    } catch (error) {
      console.error("Error details:", error.response || error.message || error);
      alert("Error sending request:", error);
    }
  };

  const handleRemoveSearchText = async (searchTextToRemove) => {
    try {
      await axios.post(
        `${URL}/remove-game?name=${encodeURIComponent(searchTextToRemove)}`
      );

      await fetchUniqueSearchTexts();
      await fetchSearchedGames();
    } catch (error) {
      console.error("Error removing game from searched:", error);
    }
  };

  return (
    <div className="main">
      <center>
        <h3>PS Store Game Search Tool</h3>
      </center>

      <div style={{ height: "50px" }} />

      <div className="d-flex justify-content-center mb-3">
        <Form.Control
          type="text"
          value={newSearchText}
          onChange={handleNewSearchTextChange}
          placeholder="Search for a new game..."
          className="mr-2"
          style={{ width: "500px" }}
        />
        <div style={{ width: "20px" }} />
        <Button onClick={handleNewSearchTextSubmit}>Search</Button>
      </div>

      <SearchTextList
        games={searchedGames}
        searchTexts={searchTexts}
        onSearchTextClick={handleSearchTextClick}
        onRemoveTextClick={handleRemoveSearchText}
      />

      {showPriceHistory && (
        <PriceHistoryTable
          priceHistory={priceHistory}
          onClose={handlePriceHistoryClose}
        />
      )}

      <TrackedGamesList games={searchedGames} searchTexts={searchTexts} />
    </div>
  );
}

export default App;
