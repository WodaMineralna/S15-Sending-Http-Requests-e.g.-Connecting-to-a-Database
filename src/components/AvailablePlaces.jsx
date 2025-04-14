import { useState, useEffect } from "react";

import Places from "./Places.jsx";

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/places")
      .then((response) => { // * metoda ktora definiuje funkcje ktora jest wykonywana,
      // * kiedy nasz Promise jest resolved i TYLKO wtedy, kiedy mamy nasz response
        return response.json(); // ^ metoda .json() zwraca kolejny Promise
      })
      .then((resData) => {
        setAvailablePlaces(resData.places);
      });
  }, []);

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
