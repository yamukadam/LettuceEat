import express from 'express';
import { addFood, listFood, removeFood, listFoodById } from '../controllers/foodController.js';
import multer from 'multer';
import authMiddleware from '../middleware/auth.js';
import foodAuthMiddleware from '../middleware/foodAuth.js';
const foodRouter = express.Router();

//Image Storage Engine (Saving Image to uploads folder & rename it)

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage})

foodRouter.get("/list",listFood);
foodRouter.get("/listByUser", foodAuthMiddleware, listFoodById)
foodRouter.post("/add", foodAuthMiddleware, upload.single('image'),addFood);
foodRouter.post("/remove",removeFood);

export default foodRouter;