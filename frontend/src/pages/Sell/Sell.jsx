import React from 'react'
import  './Sell.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    return (
      <div className='sidebar'>
        <div className="sidebar-options">
          <NavLink to='/add' className="sidebar-option">
              <img src={assets.add_icon} alt="" />
              <p>Add Items</p>
          </NavLink>
          <NavLink to='/list' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>List Items</p>
          </NavLink>
          <NavLink to='/orders' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>Orders</p>
          </NavLink>
        </div>
      </div>
    )
  }

const Sell = () => {
    return(
        <div>
            <h1>THIS IS THE SELL PAGE</h1>
            <Sidebar />
        </div>
    )
}

export default Sell