import React, { useState } from "react";
import FoodEntry from "./components/FoodEntry";
import * as XLSX from "xlsx";  //xlsx library for chart
import './App.css';
import { IoArrowBackSharp } from "react-icons/io5";

const App = () => {
  const [userData, setUserData] = useState({
    height: '',
    weight: '',
    sex: '',
    age: '',
  });
  const [dailyCalories, setDailyCalories] = useState(null);
  const [isUserInfoComplete, setIsUserInfoComplete] = useState(false);
  const [foodDiary, setFoodDiary] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);

  //handle input change 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  //calculate recommended daily calorie intake
  const calculateCalories = () => {
    const { height, weight, sex, age } = userData;
    const heightInCm = parseFloat(height);
    const weightInKg = parseFloat(weight);
    const ageInYears = parseInt(age);

    let calories = 0;
    if (sex === "male") {
      calories = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears + 5;
    } else if (sex === "female") {
      calories = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears - 161;
    }

    setDailyCalories(Math.round(calories)); //round to nearest calorie
    setIsUserInfoComplete(true);
  };

  const addToDiary = (foodItem) => {
    console.log("Food item calories:", foodItem.calories); //log the calories
    const updatedDiary = [...foodDiary, foodItem];
    setFoodDiary(updatedDiary);
    
    setTotalCalories((prevTotal) => {
      const newTotal = prevTotal + foodItem.calories;
      console.log("New total calories (before rounding):", newTotal); 
      return Math.round(newTotal * 100) / 100; //round to 2 decimal places
    });
  };

  //export food diary to spreadsheet
  const exportToSpreadsheet = () => {
    const foodDiaryData = foodDiary.map((item, index) => ({
      "Food Name": item.name,
      "Calories": item.calories,
      "Serving Size": item.servingSize,
    }));

    const userInfo = [
      { A: `User Info`, B: `` },
      { A: `Height (cm)`, B: userData.height },
      { A: `Weight (kg)`, B: userData.weight },
      { A: `Sex`, B: userData.sex },
      { A: `Age`, B: userData.age },
      { A: `Total Calories`, B: totalCalories }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(userInfo, { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, foodDiaryData, { origin: -1 });
    
    XLSX.utils.book_append_sheet(wb, ws, "Food Diary");

    //create an Excel file and download
    XLSX.writeFile(wb, "FoodDiary.xlsx");
    };
  
    return (
      <div className="app">
        {!isUserInfoComplete ? (
          <div className="user-info-form">
            <h1>Enter Your Info:</h1>
            <div class="input-container">
              <label>
                Height (in cm):
                <input
                  type="number"
                  name="height"
                  value={userData.height}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Weight (in kg):
                <input
                  type="number"
                  name="weight"
                  value={userData.weight}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Age:
                <input
                  type="number"
                  name="age"
                  value={userData.age}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Sex:
                <select
                  name="sex"
                  value={userData.sex}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            </div>

          <button onClick={calculateCalories}>Calculate Daily Calories</button>
        </div>
      ) : (
        <div className="daily-calories-info">
          <button className="back-button" onClick={() => setIsUserInfoComplete(false)}>
            <IoArrowBackSharp size={24} />
          </button>
          <h2>Your Recommended Daily Calorie Intake is: {dailyCalories} calories/day</h2>
          
          {/* food entry component */}
          <FoodEntry onAddToDiary={addToDiary} style={{ marginTop: "30px" }} />

          
          {/* progress bar */}
          <div className="progress-bar-container">
          <label>Calories Consumed: {totalCalories.toFixed(2)}/{dailyCalories}kcal</label>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(totalCalories / dailyCalories) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* food diary list */}
          <div className="food-diary">
            <h2>Your Food Diary</h2>
            <hr></hr>
            <ul>
              {foodDiary.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.calories} calories
                </li>
              ))}
            </ul>
          </div>

          {/* export to spreadsheet */}
          <button className="export-button" onClick={exportToSpreadsheet}>
            View spreadsheet
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
