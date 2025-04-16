import { useRef, useState, useCallback, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import ErrorPage from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetchingUserPlaces, setIsFetchingUserPlaces] = useState(false);
  const [errorFetchingUserPlaces, setErrorFetchingUserPlaces] = useState(null);

  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces); // ! rollback - jezeli cos poszlo nie tak, to nie dodajemy tego miejsca do userPlaces
      setErrorUpdatingPlaces({
        message:
          error.message || "Could not update places, please try again later",
      });
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      );

      // * niby usuwamy nasz userPLace, ale robimy to nieoptymalnie
      // ! poniewaz zamiast robic HTTP Delete, to robimy HTTP Put - 1 element
      // i moga byc problemy, jak tych elementow bedzie duzo wiecej
      try {
        await updateUserPlaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id)
        );
      } catch (error) {
        setUserPlaces(userPlaces); // ! rollback - jezeli cos poszlo nie tak, to nie usuwamy tego miejsca z userPlaces
        setErrorUpdatingPlaces({
          message:
            error.message || "Could not delete place, please try again later",
        });
      }

      setModalIsOpen(false);
    },
    [userPlaces]
  );

  function handleCloseError() {
    setErrorUpdatingPlaces(null);
  }

  useEffect(() => {
    async function fetchPlaces() {
      setIsFetchingUserPlaces(true);

      try {
        const places = await fetchUserPlaces();
        setUserPlaces(places);
        setIsFetchingUserPlaces(false);
      } catch (error) {
        setErrorFetchingUserPlaces({
          message:
            error.message ||
            "Could not fetch selected user places, please try again later",
        });
        setIsFetchingUserPlaces(false);
      }
    }

    fetchPlaces();
  }, []);

  return (
    <>
      {errorUpdatingPlaces && (
        <Modal open={errorUpdatingPlaces} onClose={handleCloseError}>
          <ErrorPage
            title="An error occurred!"
            message={errorUpdatingPlaces.message}
            onConfirm={handleCloseError}
          />
        </Modal>
      )}

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {errorFetchingUserPlaces && (
          <ErrorPage
            title="An error occured!"
            message={errorFetchingUserPlaces.message}
          />
        )}
        {!errorFetchingUserPlaces && (
          <Places
            title="I'd like to visit ..."
            places={userPlaces}
            isLoading={isFetchingUserPlaces}
            loadingText="Fetchingqs previously selected places..."
            fallbackText="Select the places you would like to visit below."
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
