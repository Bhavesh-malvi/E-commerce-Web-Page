import UserInterest from "../models/UserInterest.js";


// ================= GET MY INTEREST =================
export const getMyInterest = async (req, res) => {
  try {

    const interest = await UserInterest.findOne({
      user: req.user._id
    });


    // New user
    if (!interest) {
      return res.json({
        success: true,
        interest: {
          categories: [],
          brands: []
        }
      });
    }


    // Convert Map to Array
    const categories = [...interest.categories.entries()]
      .map(([key, value]) => ({
        name: key,
        score: value
      }))
      .sort((a, b) => b.score - a.score);


    const brands = [...interest.brands.entries()]
      .map(([key, value]) => ({
        name: key,
        score: value
      }))
      .sort((a, b) => b.score - a.score);


    res.json({
      success: true,
      interest: {
        categories,
        brands
      }
    });

  } catch (err) {

    console.log("INTEREST ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load interest"
    });
  }
};
