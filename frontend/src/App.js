import { useState, useEffect } from "react";
import SearchTextList from "./components/SearchTextList";
import PriceHistoryTable from "./components/PriceHistoryTable";
import TrackedGamesList from "./components/TrackedGamesList";
import { ToastContainer, toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import "./App.css";

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
      const response = await axios.post(`${URL}/get-game`, {
        search_text: newSearchText,
      });

      const newGame = response.data;
      console.log("New game data:", response);

      if (!newSearchText.trim()) {
        toast.warning("Please enter a valid game name.");
        return;
      }

      if (!newGame || !newGame.ps_store_url) {
        handleRemoveSearchText(newSearchText);
        toast.warning("Game not found.");
        return;
      }

      const alreadyExists = searchedGames.some(
        (game) => game.url === newGame.ps_store_url
      );

      if (alreadyExists) {
        toast.warning("This game is already on your list.");
        handleRemoveSearchText(newSearchText);
        return;
      }

      const updatedSearchTexts = [...searchTexts, newSearchText];
      setSearchTexts(updatedSearchTexts);
      setNewSearchText("");

      await fetchSearchedGames();
      await fetchUniqueSearchTexts();
    } catch (error) {
      console.error("Error details:", error.response || error.message || error);
      toast.error("Error sending request.");
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
          style={{
            width: "500px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#E5E2CF",
            border: "1px solid #570F07",
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: "50px",
          }}
        />

        <Button
          style={{
            backgroundColor: "#1a1a1a",
            border: "0.1px solid #570F07",
            color: "#E5E2CF",
            fontWeight: "bold",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
            marginBottom: "50px",
          }}
          onClick={handleNewSearchTextSubmit}
        >
          Search
        </Button>
      </div>

      <SearchTextList
        games={searchedGames}
        searchTexts={searchTexts}
        onSearchTextClick={handleSearchTextClick}
        onRemoveTextClick={handleRemoveSearchText}
        className="SearchTextList"
      />

      {showPriceHistory && (
        <PriceHistoryTable
          className="PriceHistoryTable"
          priceHistory={priceHistory}
          onClose={handlePriceHistoryClose}
        />
      )}

      <TrackedGamesList games={searchedGames} searchTexts={searchTexts} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
