import cron from "node-cron";
import Deal from "../models/DealModel.js";
import MegaDeal from "../models/MegaDealModel.js";
import Product from "../models/ProductModel.js";



// ================= DEAL EXPIRY JOB =================

// Runs every hour to check for expired deals and restore products
cron.schedule("0 * * * *", async () => {

  try {

    const now = new Date();

    console.log('🔄 Running deal expiration cleanup...');

    // 1. Deactivate expired regular deals
    const dealResult = await Deal.updateMany(
      {
        isActive: true,
        endDate: { $lt: now }
      },
      {
        isActive: false
      }
    );

    // 2. Deactivate expired mega deals
    const megaDealResult = await MegaDeal.updateMany(
      {
        isActive: true,
        endDate: { $lt: now }
      },
      {
        isActive: false
      }
    );

    // 3. Restore original pricing for products with expired deals
    const expiredProducts = await Product.find({
      'activeDeal.expiresAt': { $lt: now }
    });

    if (expiredProducts.length > 0) {
      for (const product of expiredProducts) {
        const updateData = {
          $unset: { activeDeal: "" }
        };

        // Restore original discount if it was saved
        if (product.originalDiscountPrice !== undefined) {
          updateData.discountPrice = product.originalDiscountPrice;
          updateData.$unset.originalDiscountPrice = "";
        }

        // Remove deal-related badges
        updateData.$pull = { 
          badges: { $in: ["sale", "mega-sale"] } 
        };

        await Product.findByIdAndUpdate(product._id, updateData);
      }
    }

    console.log(`✅ Deal Cron: ${dealResult.modifiedCount} regular deals disabled`);
    console.log(`✅ Deal Cron: ${megaDealResult.modifiedCount} mega deals disabled`);
    console.log(`✅ Deal Cron: ${expiredProducts.length} products restored to original pricing`);

  } catch (error) {

    console.error("❌ Deal Cron Error:", error.message);

  }

});

console.log('✅ Deal expiration cron job started (runs hourly)');
