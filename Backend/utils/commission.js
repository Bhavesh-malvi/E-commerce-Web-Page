import Seller from "../models/SellerModel.js";

export const calculateCommission = async (order, session = null) => {

  let adminTotal = 0;
  let sellerTotal = 0;

  for (const item of order.items) {

    if (!item.seller) continue;

    const seller = await Seller
      .findById(item.seller)
      .session(session);

    if (!seller) continue;


    // Add money to wallet
    seller.wallet.balance += item.sellerEarning;

    seller.wallet.history.push({
      order: order._id,
      amount: item.sellerEarning,
      type: "credit",
      date: new Date()
    });


    // Update stats
    seller.totalSales += item.sellerEarning;
    seller.totalOrders += 1;


    await seller.save({ session });


    adminTotal += item.commission;
    sellerTotal += item.sellerEarning;
  }


  return {
    admin: adminTotal,
    seller: sellerTotal
  };
};
