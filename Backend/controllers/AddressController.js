import Address from "../models/AddressModel.js";



// ================= ADD ADDRESS =================
export const addAddress = async (req, res) => {
  try {

    const {
      name,
      phone,
      street,
      city,
      state,
      pincode,
      landmark,
      label,
      isDefault
    } = req.body;


    // Validation
    if(!name || !phone || !street || !city || !state || !pincode){
      return res.status(400).json({
        success:false,
        message:"All fields required"
      });
    }


    // Reset old default
    if(isDefault){
      await Address.updateMany(
        { user:req.user._id },
        { isDefault:false }
      );
    }


    const newAddress = await Address.create({

      user:req.user._id,

      name,
      phone,
      street,
      city,
      state,
      pincode,
      landmark,
      label: label || "home",
      isDefault: isDefault || false
    });


    res.status(201).json({
      success:true,
      address:newAddress
    });

  } catch (err) {

    console.error("ADD ADDRESS ERROR:",err);

    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
};




// ================= GET MY ADDRESSES =================
export const getMyAddress = async (req, res) => {
  try {

    const list = await Address
      .find({ user:req.user._id })
      .sort({ isDefault:-1, createdAt:-1 });


    res.json({
      success:true,
      list
    });

  } catch (err) {

    console.error("GET ADDRESS ERROR:",err);

    res.status(500).json({
      success:false
    });
  }
};




// ================= UPDATE ADDRESS =================
export const updateAddress = async (req,res)=>{
  try{

    const address = await Address.findById(req.params.id);


    if(!address){
      return res.status(404).json({
        success:false,
        message:"Address not found"
      });
    }


    // Security
    if(address.user.toString() !== req.user._id.toString()){
      return res.status(403).json({
        success:false,
        message:"Unauthorized"
      });
    }


    const {
      name,
      phone,
      street,
      city,
      state,
      pincode,
      landmark,
      label,
      isDefault
    } = req.body;


    // Reset old default
    if(isDefault){
      await Address.updateMany(
        { user:req.user._id },
        { isDefault:false }
      );
    }


    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.landmark = landmark || address.landmark;
    address.label = label || address.label;
    address.isDefault = isDefault ?? address.isDefault;


    await address.save();


    res.json({
      success:true,
      address
    });


  }catch(err){

    console.error("UPDATE ADDRESS ERROR:",err);

    res.status(500).json({ success:false });
  }
};




// ================= DELETE ADDRESS =================
export const deleteAddress = async (req, res) => {
  try {

    const address = await Address.findById(req.params.id);


    if(!address){
      return res.status(404).json({
        success:false,
        message:"Address not found"
      });
    }


    // Security
    if(address.user.toString() !== req.user._id.toString()){
      return res.status(403).json({
        success:false,
        message:"Unauthorized"
      });
    }


    const wasDefault = address.isDefault;


    await address.deleteOne();


    // If default deleted → set another as default
    if(wasDefault){

      const next = await Address.findOne({
        user:req.user._id
      }).sort({ createdAt:-1 });


      if(next){
        next.isDefault = true;
        await next.save();
      }
    }


    res.json({
      success:true,
      message:"Address deleted"
    });

  } catch (err) {

    console.error("DELETE ADDRESS ERROR:",err);

    res.status(500).json({
      success:false
    });
  }
};
