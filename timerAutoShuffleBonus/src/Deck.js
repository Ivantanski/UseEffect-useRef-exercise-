import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "https://deckofcardsapi.com/api/deck";

function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const timerRef = useRef(null);

  // Load deck on mount
  useEffect(() => {
    const fetchDeck = async () => {
      const { data } = await axios.get(`${API_BASE_URL}/new/shuffle/`);
      setDeck(data);
    };
    fetchDeck();
  }, []);

  // Draw cards at intervals
  useEffect(() => {
    const drawCard = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/${deck.deck_id}/draw/`);
        if (data.remaining === 0) throw new Error("Deck empty!");
        const card = data.cards[0];
        setDrawn(d => [...d, { id: card.code, name: `${card.suit} ${card.value}`, image: card.image }]);
      } catch (err) {
        setIsDrawing(false);
        alert(err.message);
      }
    };

    if (isDrawing) {
      timerRef.current = setInterval(drawCard, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => clearInterval(timerRef.current);
  }, [isDrawing, deck]);

  // Shuffle deck
  useEffect(() => {
    const shuffleDeck = async () => {
      try {
        await axios.get(`${API_BASE_URL}/${deck.deck_id}/shuffle/`);
        setDrawn([]);
      } catch (err) {
        alert("Error shuffling deck");
      } finally {
        setIsShuffling(false);
        setIsDrawing(false);
      }
    };

    if (isShuffling && deck) shuffleDeck();
  }, [isShuffling, deck]);

  return (
    <main className="Deck">
      {deck && (
        <>
          <button className="Deck-gimme" onClick={() => setIsDrawing(d => !d)} disabled={isShuffling}>
            {isDrawing ? "STOP" : "KEEP"} DRAWING
          </button>
          <button className="Deck-gimme" onClick={() => setIsShuffling(true)} disabled={isShuffling}>
            SHUFFLE DECK
          </button>
        </>
      )}
      <div className="Deck-cardarea">
        {drawn.map(card => (
          <Card key={card.id} name={card.name} image={card.image} />
        ))}
      </div>
    </main>
  );
}

export default Deck;

