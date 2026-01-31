import React, { useState, useContext } from 'react'
import { IoCartOutline } from 'react-icons/io5'
import { motion } from 'framer-motion'
import { GiPaperBagFolded } from 'react-icons/gi'
import { AppContext } from '../context/AppContext'
import { useToast } from '../components/common/Toast'
import { useEffect } from 'react'

const cartVariants = {
  idle: { x: -30, scale: 1, rotateZ: 0, opacity: 1 },
  back: { x: 0, scale: 0.95, rotateZ: -2 },
  moveCenter: { x: -35, scale: 1, rotateZ: -2 },
  straighten: { x: 32, rotateZ: 0 },
  exit: { x: 120, opacity: 0 }
}

const parcelVariants = {
  hidden: { y: -42, x: 42, opacity: 0, scale: 0.85 },
  drop: { y: -6, x: 42, opacity: 1, scale: 1.1 }
}

const CartButton = ({ productId, variant, isDisabled }) => {
  const { addToCart, cart, updateCartQuantity, removeFromCart } = useContext(AppContext)
  const toast = useToast()
  const [stage, setStage] = useState('idle')
  const [showQty, setShowQty] = useState(false)
  const [qty, setQty] = useState(1)
  const CENTER_WAIT = 1000

  // Check if product is already in cart and set initial state
  useEffect(() => {
    if (cart && cart.items) {
      const cartItem = cart.items.find(item => {
        const itemProductId = typeof item.product === 'object' ? item.product._id : item.product;
        return itemProductId === productId;
      });
      
      if (cartItem) {
        setShowQty(true);
        setQty(cartItem.quantity);
      } else {
        setShowQty(false);
        setQty(1);
      }
    }
  }, [cart, productId]);

  const handleClick = () => {
    if (stage !== 'idle' || isDisabled) return

    setStage('back')
    setTimeout(() => setStage('moveCenter'), 180)
    setTimeout(() => setStage('straighten'), 550)
    setTimeout(() => setStage('exit'), 420 + CENTER_WAIT)
    setTimeout(async () => {
        setShowQty(true)
        const res = await addToCart(productId, 1, variant)
        if (res?.success) {
          toast.success('Added to cart!')
        } else {
          toast.error(res?.message || 'Failed to add to cart')
        }
    }, 1800)
  }

  const handleDecrease = async () => {
    if (qty === 1) {
      // Remove from cart
      const res = await removeFromCart(productId);
      if (res?.success) {
        setShowQty(false);
        setStage('idle');
        setQty(1);
        toast.success('Removed from cart');
      } else {
        toast.error(res?.message || 'Failed to remove from cart');
      }
    } else {
      const newQty = qty - 1;
      setQty(newQty);
      const res = await updateCartQuantity(productId, newQty);
      if (!res?.success) {
        toast.error(res?.message || 'Failed to update quantity');
        // Revert on error
        setQty(qty);
      }
    }
  }

  const handleIncrease = async () => {
    const newQty = qty + 1;
    setQty(newQty);
    const res = await updateCartQuantity(productId, newQty);
    if (!res?.success) {
      toast.error(res?.message || 'Failed to update quantity');
      // Revert on error
      setQty(qty);
    }
  }

  return (
    <div className="pt-6 perspective-[1000px]">

      <motion.div
        animate={{ rotateX: showQty ? 180 : 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-fit"
      >

        <button
          onClick={handleClick}
          className="py-4 px-8 rounded-lg bg-[#FF8F9C]
          text-white flex items-center
          shadow-md overflow-hidden relative group"
        >

          {stage === 'idle' && (
            <IoCartOutline
              className="absolute -left-12 text-[30px]
              transition-all duration-500
              group-hover:translate-x-16"
            />
          )}

          {stage !== 'idle' && (
            <motion.div
              variants={cartVariants}
              initial="idle"
              animate={stage}
              transition={{
                type: 'spring',
                stiffness: 140,
                damping: 18
              }}
              className="absolute text-[32px]"
            >
              <IoCartOutline />
            </motion.div>
          )}

          {stage === 'straighten' && (
            <motion.div
              variants={parcelVariants}
              initial="hidden"
              animate="drop"
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 22
              }}
              className="absolute"
            ><GiPaperBagFolded className='text-[20px]' />
            </motion.div>
          )}

          <motion.p
            animate={{
              y: stage !== 'idle' ? -30 : 0,
              opacity: stage !== 'idle' ? 0 : 1
            }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 18
            }}
            className="font-semibold transition-all
            group-hover:translate-x-4"
          >
            Add to Cart
          </motion.p>
        </button>

        <div
          className="absolute inset-0 bg-[#FF8F9C] rounded-lg
          flex items-center justify-between px-4 text-white
          rotate-x-180 backface-hidden"
        >
          <button
            onClick={handleDecrease}
              className="text-2xl font-medium h-full w-[30%] pr-4 cursor-pointer"
          >
            −
          </button>

          <span className="text-lg font-semibold h-full w-[40%] flex justify-center items-center">{qty}</span>

          <button
            onClick={handleIncrease}
            className="text-2xl font-medium h-full w-[30%] pl-4 cursor-pointer"
          >
            +
          </button>
        </div>

      </motion.div>
    </div>
  )
}

export default CartButton
