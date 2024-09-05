import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

const FoodDisplay = ({ category }) => {
  const { food_list, loading } = useContext(StoreContext);

  if (loading) {
      return <div>Loading...</div>;
  }

  if (!food_list || food_list.length === 0) {
      return <div>No items available</div>;
  }

  

  return (
      <div className='food-display' id='food-display'>
          <h2>Top items near you</h2>
          <div className='food-display-list'>
              {food_list.map((item) => {
                  if (category === "All" || category === item.category) {
                      return (
                          <FoodItem
                              key={item._id}
                              image={item.image}
                              name={item.name}
                              desc={item.description}
                              price={item.price}
                              id={item._id}
                              user={item.user.name}
                          />
                      );
                  }
              })}
          </div>
      </div>
  );
};

export default FoodDisplay;
