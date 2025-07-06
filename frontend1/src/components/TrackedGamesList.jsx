import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Form,
  ListGroup,
  ListGroupItem,
  FormCheck,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";

const TrackedGamesList = ({ games, searchTexts }) => {
  const [trackedGames, setTrackedGames] = useState([]);
  const [selected, setSelected] = useState([]);

  const fetchTrackedGames = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/tracked-games");
      setTrackedGames(response.data);
    } catch (error) {
      console.error("Error fetching tracked games:", error);
    }
  };

  useEffect(() => {
    fetchTrackedGames();
  }, []);

  const trackedGameTitles = trackedGames.map((game) => game.title);

  const availableGames = [
    ...new Set(
      searchTexts.filter(
        (game) =>
          !trackedGameTitles.some((tracked) =>
            tracked?.toLowerCase().includes(game?.toLowerCase())
          )
      )
    ),
  ];

  const handleAddTrackedGame = async () => {
    if (selected.length === 0) return;

    const selectedGame = selected[0];
    try {
      await axios.post("http://127.0.0.1:5000/add-tracked-game", {
        name: selectedGame,
      });
      setSelected([]);
      fetchTrackedGames();
    } catch (error) {
      console.error("Error adding tracked game:", error);
    }
  };

  const handleToggleTrackedGame = async (gameId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/tracked-game/${gameId}`);
      fetchTrackedGames();
    } catch (error) {
      console.error("Error toggling tracked game:", error);
    }
  };

  const handleRemoveTrackedGame = async (gameId) => {
    try {
      await axios.post("http://127.0.0.1:5000/remove-tracked-game", {
        id: gameId,
      });
      fetchTrackedGames();
    } catch (error) {
      console.error("Error removing tracked game:", error);
    }
  };

  return (
    <div className="container mt-5">
      <center>
        <h1 className="mb-4">Add Tracked Game</h1>
      </center>
      <div className="d-flex mb-3 justify-content-center align-items-center">
        <Typeahead
          id="basic-example"
          onChange={setSelected}
          options={availableGames}
          placeholder="Choose a game..."
          selected={selected}
        />
        <Button onClick={handleAddTrackedGame} className="ml-2">
          Add
        </Button>
      </div>
      <div
        className="container mt-5"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <center>
          <h1 className="mb-3">Tracked Games:</h1>
        </center>
        <ListGroup>
          {trackedGames.map((game) => (
            <ListGroupItem
              key={game.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>{game.title}</div>
              <div className="d-flex align-items-center">
                <FormCheck
                  type="checkbox"
                  onChange={() => handleToggleTrackedGame(game.id)}
                  checked={game.tracked}
                  label="Tracked"
                />
                <div style={{ width: "20px" }} />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveTrackedGame(game.id)}
                >
                  Remove
                </Button>
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default TrackedGamesList;
