import express from "express";

import { getRecommendations } from "../controllers/RecommendController.js";
import { homeData } from "../controllers/HomeController.js";
import { personalDeals } from "../controllers/DealController.js";
import { getMyInterest } from "../controllers/InterestController.js";
import AuthUser from "../middleware/AuthUser.js";


const router = express.Router();


router.get("/recommend",AuthUser,getRecommendations);

router.get("/home",homeData);

router.get("/deals",AuthUser,personalDeals);

router.get("/interest",AuthUser,getMyInterest);


export default router;
