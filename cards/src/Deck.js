import React, { useEffect, useState, useCallback } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "https://deckofcardsapi.com/api/deck";

/** Deck: uses deck API, allows drawing one card at a time. */
function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);

  // Load deck on initial render
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/new/shuffle/`);
        setDeck(data);
      } catch (error) {
        console.error("Error loading deck:", error);
      }
    };
    fetchDeck();
  }, []);

  /** Draw a card from the deck */
  const draw = useCallback(async () => {
    if (!deck) return;

    try {
      const { data } = await axios.get(`${API_BASE_URL}/${deck.deck_id}/draw/`);

      if (data.remaining === 0) {
        throw new Error("Deck empty!");
      }

      const card = data.cards[0];
      setDrawn((prevDrawn) => [
        ...prevDrawn,
        {
          id: card.code,
          name: `${card.suit} ${card.value}`,
          image: card.image,
        },
      ]);
    } catch (error) {
      alert(error.message);
    }
  }, [deck]);

  /** Shuffle the deck and reset drawn cards */
  const shuffleDeck = useCallback(async () => {
    if (!deck) return;

    setIsShuffling(true);
    try {
      await axios.get(`${API_BASE_URL}/${deck.deck_id}/shuffle/`);
      setDrawn([]);
    } catch (error) {
      alert("Error shuffling the deck");
    } finally {
      setIsShuffling(false);
    }
  }, [deck]);

  return (
    <main className="Deck">
      {deck && (
        <>
          <button
            className="Deck-gimme"
            onClick={draw}
            disabled={isShuffling}
          >
            DRAW
          </button>
          <button
            className="Deck-gimme"
            onClick={shuffleDeck}
            disabled={isShuffling}
          >
            SHUFFLE DECK
          </button>
        </>
      )}

      <div className="Deck-cardarea">
        {drawn.map((c) => (
          <Card key={c.id} name={c.name} image={c.image} />
        ))}
      </div>
    </main>
  );
}

export default Deck;

