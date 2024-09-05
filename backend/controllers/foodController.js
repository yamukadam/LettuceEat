import foodModel from "../models/foodModel.js";
import fs from 'fs'
import userModel from "../models/userModel.js";

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({}).populate('user', {name: 1, email: 1})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

const listFoodById = async (req, res) => {
    try {
        const userId = req.user.id;
        const foods = await foodModel.find({user: userId})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add food
const addFood = async (req, res) => {
    console.log('bla');
    console.log('Received userId:', req.user.id);  // Use req.user.id instead of req.body.userId
    try {
        let image_filename = `${req.file.filename}`;
        let userData = await userModel.findById(req.user.id);  // Use req.user.id

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            user: req.user.id  // Use req.user.id
        });

        const savedFood = await food.save();
        userData.listedGoods = userData.listedGoods.concat(savedFood._id);
        await userData.save();

        const populatedFood = await savedFood.populate('user')

        res.json({ success: true, message: "Food Added", food: populatedFood });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error adding food" });
    }
}

// delete food
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

export { listFood, addFood, removeFood, listFoodById }