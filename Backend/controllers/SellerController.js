import Seller from "../models/SellerModel.js";
import User from "../models/UserModel.js";



// ================= APPLY =================
export const applySeller = async (req, res) => {

  try {

    const { shopName, gstNumber, address, phone } = req.body;


    if (!shopName || !phone || !address?.street) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing"
      });
    }


    const exist = await Seller.findOne({
      user: req.user._id
    });


    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Already applied"
      });
    }


    const seller = await Seller.create({

      user: req.user._id,

      shopName,
      gstNumber,
      address,
      phone,

      status: "pending"
    });


    res.status(201).json({
      success: true,
      message: "Seller request submitted",
      seller
    });


  } catch (err) {

    console.error("APPLY SELLER:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




// ================= VERIFY (ADMIN) =================
export const verifySeller = async (req, res) => {

  try {

    const seller = await Seller.findById(req.params.id);


    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }


    if (seller.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Seller already approved"
      });
    }


    seller.isVerified = true;
    seller.status = "active";

    await seller.save();


    await User.findByIdAndUpdate(
      seller.user,
      { role: "seller" }
    );


    res.json({
      success: true,
      message: "Seller approved successfully",
      seller
    });


  } catch (err) {

    console.error("VERIFY SELLER:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};







// ================= MY ACCOUNT =================
export const mySellerAccount = async (req, res) => {

  try {

    const seller = await Seller.findOne({
      user: req.user._id
    }).populate("user", "name email role");


    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Not a seller"
      });
    }


    res.json({
      success: true,
      seller
    });


  } catch (err) {

    console.error("MY SELLER:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ================= UPDATE PROFILE =================
export const updateSellerProfile = async (req, res) => {
  try {
    const { shopName, gstNumber, address, phone } = req.body;

    const seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Update fields
    if (shopName) seller.shopName = shopName;
    if (gstNumber) seller.gstNumber = gstNumber;
    if (phone) seller.phone = phone;
    
    if (address) {
      seller.address = {
        ...seller.address.toObject(),
        ...address
      };
    }

    await seller.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      seller
    });

  } catch (err) {
    console.error("UPDATE SELLER PROFILE:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
