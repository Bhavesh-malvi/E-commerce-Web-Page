
import User from "../models/UserModel.js";
import crypto from "crypto";

// ================= GET WALLET =================
export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("wallet");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      wallet: user.wallet
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= WITHDRAW REQUEST =================
export const withdrawRequest = async (req, res) => {
  try {
    const { amount, upiId, accountInfo } = req.body;
    
    const user = await User.findById(req.user._id);

    if (amount > user.wallet.balance) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Deduct balance
    user.wallet.balance -= Number(amount);
    
    user.wallet.transactions.push({
      amount: Number(amount),
      type: "debit",
      description: `Withdrawal request to ${upiId || 'Bank Account'}`,
      date: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      balance: user.wallet.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
