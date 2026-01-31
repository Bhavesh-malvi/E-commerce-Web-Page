import cron from 'node-cron';
import Product from '../models/ProductModel.js';

/**
 * Cron job to automatically clean up expired deals
 * Runs every hour to check for expired deals and restore original pricing
 */
export const startDealExpirationCron = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Running deal expiration cleanup...');

      const now = new Date();

      // Find all products with expired deals
      const expiredProducts = await Product.find({
        'activeDeal.expiresAt': { $lt: now }
      });

      if (expiredProducts.length > 0) {
        console.log(`Found ${expiredProducts.length} products with expired deals`);

        for (const product of expiredProducts) {
          const updateData = {
            $unset: { activeDeal: "" }
          };

          // Restore original discount if it was saved
          if (product.originalDiscountPrice !== undefined) {
            updateData.discountPrice = product.originalDiscountPrice;
            updateData.$unset.originalDiscountPrice = "";
          } else {
            // If no original discount was saved, remove discountPrice
            updateData.$unset.discountPrice = "";
          }

          // Remove deal-related badges
          updateData.$pull = { 
            badges: { $in: ["sale", "mega-sale"] } 
          };

          await Product.findByIdAndUpdate(product._id, updateData);
          
          console.log(`✅ Restored original pricing for product: ${product.name}`);
        }

        console.log(`✅ Successfully cleaned up ${expiredProducts.length} expired deals`);
      } else {
        console.log('✅ No expired deals found');
      }

    } catch (error) {
      console.error('❌ Error in deal expiration cron job:', error);
    }
  });

  console.log('✅ Deal expiration cron job started (runs hourly)');
};

/**
 * Manual cleanup function for testing or one-time execution
 */
export const cleanupExpiredDeals = async () => {
  try {
    const now = new Date();
    const expiredProducts = await Product.find({
      'activeDeal.expiresAt': { $lt: now }
    });

    for (const product of expiredProducts) {
      const updateData = {
        $unset: { activeDeal: "" }
      };

      if (product.originalDiscountPrice !== undefined) {
        updateData.discountPrice = product.originalDiscountPrice;
        updateData.$unset.originalDiscountPrice = "";
      } else {
        updateData.$unset.discountPrice = "";
      }

      updateData.$pull = { 
        badges: { $in: ["sale", "mega-sale"] } 
      };

      await Product.findByIdAndUpdate(product._id, updateData);
    }

    return {
      success: true,
      cleaned: expiredProducts.length,
      message: `Cleaned up ${expiredProducts.length} expired deals`
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
