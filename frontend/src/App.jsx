import { useState, useEffect } from 'react'
import SearchTextList from './components/SearchTextList'
import PriceHistoryTable from './components/PriceHistoryTable'
import TrackedGamesList from './components/TrackedGamesList'
import axios from "axios"

const URL = "http://127.0.0.1:5000";

function App() {
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [searchTexts, setSearchTexts] = useState([]);
  const [newSearchText, setNewSearchText] = useState("");

  useEffect(() => {
    const savedSearchTexts = localStorage.getItem('searchTexts');
    
    if (savedSearchTexts) {
      setSearchTexts(JSON.parse(savedSearchTexts));
    } else {
      fetchUniqueSearchTexts();
    }
  }, []);

  const fetchUniqueSearchTexts = async () => {
    try {
      const response = await axios.get(`${URL}/unique_search_texts`);
      const data = response.data;
      
      localStorage.setItem('searchTexts', JSON.stringify(data));
      
      setSearchTexts(data);
    } catch (error) {
      console.error("Error fetching unique search texts:", error);
    }
  };

  const handleSearchTextClick = async (searchText) => {
    try {
      const response = await axios.get(
        `${URL}/results?search_text=${searchText}`
      );

      const data = response.data;
      setPriceHistory(data);
      setShowPriceHistory(true);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  }

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

      const updatedSearchTexts = [...searchTexts, newSearchText];
      setSearchTexts(updatedSearchTexts);

      localStorage.setItem('searchTexts', JSON.stringify(updatedSearchTexts));

      setNewSearchText("");
    } catch (error) {
      console.error("Error details:", error.response || error.message || error);
      alert("Error sending request:", error);
    }
  };

  const handleRemoveSearchText = (searchTextToRemove) => {
    const updatedSearchTexts = searchTexts.filter((searchText) => searchText !== searchTextToRemove);

    setSearchTexts(updatedSearchTexts);
    localStorage.setItem('searchTexts', JSON.stringify(updatedSearchTexts));
  };

  return (
    <div className="main">
      <h1>Game Search Tool</h1>
      <form onSubmit={handleNewSearchTextSubmit}>
        <label>Search for a new game:</label>
        <input
          type="text"
          value={newSearchText}
          onChange={handleNewSearchTextChange}
        />
        <button type="submit">Search</button>
      </form>
      <SearchTextList
        searchTexts={searchTexts}
        onSearchTextClick={handleSearchTextClick}
        onRemoveTextClick={handleRemoveSearchText}
      />
      <TrackedGamesList />
      {showPriceHistory && (
        <PriceHistoryTable
          priceHistory={priceHistory}
          onClose={handlePriceHistoryClose}
        />
      )}
    </div>
  );
}

export default App;
