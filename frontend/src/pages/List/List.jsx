import React, { useEffect, useState, useContext } from 'react'
import './List.css'
import { url, currency } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext'

const List = () => {
  const {token} = useContext(StoreContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            toast.error("to sell goods sign in first")
            navigate('/sell')
        }
    }, [token])

  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
        const response = await axios.get(`${url}/api/food/listByUser`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            setList(response.data.data);
        } else {
            toast.error("Error fetching your items");
        }
    } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Network error while fetching items");
    }
};


  const removeFood = async (foodId) => {
    const response = await axios.post(`${url}/api/food/remove`, {
      id: foodId
    })
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    }
    else {
      toast.error("Error")
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className='list-table'>
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/` + item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p className='cursor' onClick={() => removeFood(item._id)}>x</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List