import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import axios from "axios";

//api key & id
const API_KEY = "f4f40e87fdf407a5802bad9ab366f28d";
const APP_ID = "0a4fbef3";

const FoodEntry = ({ onAddToDiary, style }) => {
  const [foodName, setFoodName] = useState("");
  const [nutritionData, setNutritionData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [servingSize, setServingSize] = useState(1);  //default serving size

  //fetch suggestions
  const fetchSuggestions = async (query) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://trackapi.nutritionix.com/v2/search/instant?query=${query}`,
        {
          headers: {
            "x-app-id": APP_ID,
            "x-app-key": API_KEY,
          },
        }
      );
      setSuggestions(response.data.common); 
    } catch (err) {
      console.error("Error fetching suggestions", err);
    }
  };

  //selection of food from suggestions
  const handleSuggestionClick = async (selectedFood) => {
    try {
      const response = await axios.post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        { query: selectedFood },
        {
          headers: {
            "x-app-id": APP_ID,
            "x-app-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      setNutritionData(response.data.foods[0]);
      setError(null);
      setShowModal(true);  
      setSuggestions([]);  
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      setError("Error fetching data. Please try again.");
      setNutritionData(null);
    }
  };

  //add to food diary
  const addToDiary = () => {
    const foodItem = {
      name: nutritionData.food_name,
      calories: nutritionData.nf_calories * servingSize,
    };
    onAddToDiary(foodItem);
    setShowModal(false);  //close
  };

  return (
    <div className="food-entry" style={style}>
      <h1>Track Your Calories</h1>
      <label htmlFor="foodName">What did you eat today?</label>
      <input
        type="text"
        id="foodName"
        value={foodName}
        onChange={(e) => {
          setFoodName(e.target.value);
          fetchSuggestions(e.target.value); 
        }}
        placeholder="e.g., sandwich"
        required
      />

      {/* suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion.food_name)}>
              <img src={suggestion.photo.thumb} alt={suggestion.food_name} />
              <span>{suggestion.food_name}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p>{error}</p>}

      {/* modal for food details */}
      {showModal && nutritionData && (
        <div className="modal">
          <div className="modal-content">
          <button className="cancel-button" onClick={() => setShowModal(false)}><MdClose /></button>
            <h2>{nutritionData.food_name}</h2>
            {nutritionData.photo && nutritionData.photo.thumb && (
              <img 
                src={nutritionData.photo.thumb} 
                alt={nutritionData.food_name} 
                className="food-image"
              />
            )}
            <p><strong>Calories:</strong> {nutritionData.nf_calories}</p>
            <p><strong>Serving Size:</strong> {nutritionData.serving_qty} {nutritionData.serving_unit}</p>

            <label htmlFor="servingSize">Enter Serving Size:</label>
            <input
              type="number"
              id="servingSize"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              min="1"
            />

            <button onClick={addToDiary}>Add to Diary</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodEntry;
