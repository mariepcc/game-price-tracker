import React, { useState, useEffect } from "react";
import axios from "axios";

const TrackedGamesList = () => {
    const [trackedGames, setTrackedGames] = useState([]);
    const [newTrackedGame, setNewTrackedGame] = useState("");

    useEffect(() => {
        const savedTrackedGames = localStorage.getItem('trackedGames');
        if (savedTrackedGames) {
            setTrackedGames(JSON.parse(savedTrackedGames));
        } else {
            fetchTrackedGames();
        }
    }, []);

    const fetchTrackedGames = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/tracked-games");
            setTrackedGames(response.data);

            localStorage.setItem('trackedGames', JSON.stringify(response.data));
        } catch (error) {
            console.error("Error fetching tracked games:", error);
        }
    };

    const handleNewTrackedGameChange = (event) => {
        setNewTrackedGame(event.target.value);
    };

    const handleAddTrackedGame = async () => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/add-tracked-game",
                { name: newTrackedGame }
            );
            const { id } = response.data;
            const newGame = { id, name: newTrackedGame, tracked: true };

            setTrackedGames((prevGames) => {
                const updatedGames = [...prevGames, newGame];
                
                localStorage.setItem('trackedGames', JSON.stringify(updatedGames));

                return updatedGames;
            });
            setNewTrackedGame(""); 
        } catch (error) {
            console.error("Error adding tracked game:", error);
        }
    };

    const handleToggleTrackedGame = async (gameId) => {
        try {
            await axios.put(`http://127.0.0.1:5000/tracked-game/${gameId}`);
            setTrackedGames((prevGames) =>
                prevGames.map((game) =>
                    game.id === gameId
                        ? { ...game, tracked: !game.tracked }
                        : game
                )
            );
            const updatedGames = trackedGames.map((game) =>
                game.id === gameId
                    ? { ...game, tracked: !game.tracked }
                    : game
            );
            localStorage.setItem('trackedGames', JSON.stringify(updatedGames));

        } catch (error) {
            console.error("Error toggling tracked game:", error);
        }
    };

    const handleRemoveTrackedGame = (gameId) => {
        const updatedGames = trackedGames.filter((game) => game.id !== gameId);
        
        setTrackedGames(updatedGames);

        localStorage.setItem('trackedGames', JSON.stringify(updatedGames));
    };

    return (
        <div>
            <h2>Tracked Games</h2>
            <ul>
                {trackedGames.map((game) => (
                    <li key={game.id}>
                        {game.name}{" "}
                        <input
                            type="checkbox"
                            onChange={() => handleToggleTrackedGame(game.id)}
                            checked={game.tracked}
                        />
                         <button onClick={() => handleRemoveTrackedGame(game.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <div>
                <h3>Add Tracked Game</h3>
                <input
                    type="text"
                    value={newTrackedGame}
                    onChange={handleNewTrackedGameChange}
                />
                <button onClick={handleAddTrackedGame}>Add</button>
            </div>
        </div>
    );
};

export default TrackedGamesList;
