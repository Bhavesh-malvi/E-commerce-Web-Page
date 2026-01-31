import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// ====================== PREMIUM INVOICE GENERATOR ======================

export const generateInvoice = async (order, res, sellerInfo = null) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  // Pipe to response
  doc.pipe(res);

  // Generate QR Code for tracking
  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/delivery/update/${order.trackingId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { width: 120, margin: 1 });

  // Colors
  const primaryColor = '#7C3AED'; // Purple
  const darkText = '#1F2937';
  const grayText = '#6B7280';
  const lightBg = '#F3F4F6';

  // ==================== HEADER ====================
  doc
    .rect(0, 0, 612, 100)
    .fill(primaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('INVOICE / SHIPPING LABEL', 40, 35, { align: 'left' });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 40, 65);

  doc
    .text(`Order ID: #${order._id?.toString().slice(-8).toUpperCase()}`, 350, 35, { align: 'right', width: 200 });

  doc
    .text(`Tracking ID: ${order.trackingId || 'N/A'}`, 350, 50, { align: 'right', width: 200 });

  doc
    .fontSize(9)
    .text(`Payment: ${(order.paymentInfo?.method || 'COD').toUpperCase()}`, 350, 65, { align: 'right', width: 200 });


  // ==================== CUSTOMER & SELLER INFO ====================
  const infoY = 120;

  // Customer Box
  doc
    .fillColor(darkText)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('SHIP TO (CUSTOMER)', 40, infoY);

  doc
    .rect(40, infoY + 15, 250, 90)
    .fill(lightBg);

  doc
    .fillColor(darkText)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(order.shippingAddress?.name || 'Customer', 50, infoY + 25);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(grayText)
    .text(order.shippingAddress?.street || '', 50, infoY + 42)
    .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`, 50, infoY + 55)
    .text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 50, infoY + 68);

  if (order.shippingAddress?.landmark) {
    doc.text(`Landmark: ${order.shippingAddress.landmark}`, 50, infoY + 81);
  }

  // Seller Box (Right Side)
  doc
    .fillColor(darkText)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('SHIPPED FROM (SELLER)', 320, infoY);

  doc
    .rect(320, infoY + 15, 230, 90)
    .fill(lightBg);

  const sellerName = sellerInfo?.shopName || order.items?.[0]?.seller?.shopName || 'Seller Store';
  const sellerAddress = sellerInfo?.address || {};

  doc
    .fillColor(darkText)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(sellerName, 330, infoY + 25);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(grayText)
    .text(sellerAddress.street || 'Dispatch Address', 330, infoY + 42)
    .text(`${sellerAddress.city || ''}, ${sellerAddress.state || ''} - ${sellerAddress.pincode || ''}`, 330, infoY + 55)
    .text(`Phone: ${sellerInfo?.phone || 'N/A'}`, 330, infoY + 68);


  // ==================== ORDER ITEMS TABLE ====================
  const tableY = 235;

  // Table Header
  doc
    .rect(40, tableY, 510, 25)
    .fill(primaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('#', 50, tableY + 8)
    .text('PRODUCT NAME', 80, tableY + 8)
    .text('QTY', 350, tableY + 8, { width: 50, align: 'center' })
    .text('PRICE', 410, tableY + 8, { width: 60, align: 'right' })
    .text('TOTAL', 480, tableY + 8, { width: 60, align: 'right' });

  // Table Rows
  let rowY = tableY + 25;
  let isAltRow = false;

  order.items?.forEach((item, index) => {
    const rowHeight = 28;
    
    if (isAltRow) {
      doc.rect(40, rowY, 510, rowHeight).fill('#FAFAFA');
    }

    const itemTotal = (item.price || 0) * (item.quantity || 1);

    doc
      .fillColor(darkText)
      .fontSize(9)
      .font('Helvetica')
      .text(String(index + 1), 50, rowY + 10)
      .text(item.name?.substring(0, 40) || 'Product', 80, rowY + 10, { width: 250 })
      .text(String(item.quantity || 1), 350, rowY + 10, { width: 50, align: 'center' })
      .text('Rs.' + (item.price || 0).toLocaleString(), 410, rowY + 10, { width: 60, align: 'right' })
      .text('Rs.' + itemTotal.toLocaleString(), 480, rowY + 10, { width: 60, align: 'right' });

    rowY += rowHeight;
    isAltRow = !isAltRow;
  });

  // Table border
  doc
    .rect(40, tableY, 510, rowY - tableY)
    .stroke('#E5E7EB');


  // ==================== TOTALS SECTION ====================
  const totalsY = rowY + 15;

  // Subtotal
  doc
    .fillColor(grayText)
    .fontSize(9)
    .font('Helvetica')
    .text('Subtotal:', 380, totalsY, { width: 70, align: 'right' })
    .fillColor(darkText)
    .text('Rs.' + (order.itemsPrice || 0).toLocaleString(), 460, totalsY, { width: 80, align: 'right' });

  // Shipping
  doc
    .fillColor(grayText)
    .text('Shipping:', 380, totalsY + 15, { width: 70, align: 'right' })
    .fillColor(darkText)
    .text('Rs.' + (order.shippingPrice || 0).toLocaleString(), 460, totalsY + 15, { width: 80, align: 'right' });

  // Tax
  if (order.taxPrice > 0) {
    doc
      .fillColor(grayText)
      .text('Tax:', 380, totalsY + 30, { width: 70, align: 'right' })
      .fillColor(darkText)
      .text('Rs.' + (order.taxPrice || 0).toLocaleString(), 460, totalsY + 30, { width: 80, align: 'right' });
  }

  // Coupon Discount
  if (order.coupon?.discount > 0) {
    doc
      .fillColor('#16A34A')
      .text('Coupon (' + order.coupon.code + '):', 360, totalsY + 45, { width: 90, align: 'right' })
      .text('-Rs.' + (order.coupon.discount || 0).toLocaleString(), 460, totalsY + 45, { width: 80, align: 'right' });
  }

  // Grand Total
  const grandTotalY = totalsY + (order.coupon?.discount > 0 ? 65 : (order.taxPrice > 0 ? 55 : 40));

  doc
    .rect(350, grandTotalY - 5, 200, 25)
    .fill(primaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('GRAND TOTAL:  Rs.' + (order.totalPrice || 0).toLocaleString(), 360, grandTotalY + 2, { width: 180, align: 'center' });


  // ==================== QR CODE SECTION ====================
  const qrY = grandTotalY + 50;

  doc
    .rect(40, qrY, 510, 130)
    .stroke('#E5E7EB');

  doc
    .fillColor(darkText)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('DELIVERY PARTNER - SCAN TO UPDATE LOCATION', 40, qrY + 10, { align: 'center', width: 510 });

  // QR Code
  doc.image(qrCodeDataUrl, 240, qrY + 30, { width: 90, height: 90 });

  doc
    .fillColor(grayText)
    .fontSize(8)
    .font('Helvetica')
    .text('Scan this QR code to update delivery location', 40, qrY + 125, { align: 'center', width: 510 });


  // ==================== FOOTER ====================
  const footerY = 750;

  doc
    .fillColor(grayText)
    .fontSize(8)
    .font('Helvetica')
    .text('This is a computer generated invoice.', 40, footerY, { align: 'center', width: 510 })
    .text('Thank you for shopping with us!', 40, footerY + 12, { align: 'center', width: 510 });

  doc.end();
};



// ====================== PDF FILE GENERATOR ======================
export const generateInvoicePDF = async (invoice, order = null, sellerInfo = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      
      // Ensure uploads directory exists
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
      }
      
      const filePath = `./uploads/${fileName}`;
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Generate QR Code
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order`;
      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { width: 100, margin: 1 });

      // Colors
      const primaryColor = '#7C3AED';
      const darkText = '#1F2937';
      const grayText = '#6B7280';

      // Header
      doc
        .rect(0, 0, 612, 80)
        .fill(primaryColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('INVOICE', 40, 30);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice No: ${invoice.invoiceNumber}`, 350, 30, { align: 'right', width: 200 })
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 350, 45, { align: 'right', width: 200 });

      // Billing Address
      doc
        .fillColor(darkText)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('BILL TO:', 40, 100);

      const addr = invoice.billingAddress || {};
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(grayText)
        .text(addr.name || 'Customer', 40, 115)
        .text(`${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 40, 128)
        .text(`Phone: ${addr.phone || 'N/A'}`, 40, 141);

      // Items Table Header
      const tableY = 175;
      doc
        .rect(40, tableY, 510, 22)
        .fill(primaryColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('ITEM', 50, tableY + 7)
        .text('QTY', 330, tableY + 7, { width: 50, align: 'center' })
        .text('PRICE', 390, tableY + 7, { width: 60, align: 'right' })
        .text('TOTAL', 460, tableY + 7, { width: 80, align: 'right' });

      // Items
      let rowY = tableY + 22;
      invoice.items?.forEach((item, idx) => {
        doc
          .fillColor(darkText)
          .fontSize(9)
          .font('Helvetica')
          .text(item.name || 'Product', 50, rowY + 8)
          .text(String(item.quantity), 330, rowY + 8, { width: 50, align: 'center' })
          .text(`₹${item.price?.toLocaleString()}`, 390, rowY + 8, { width: 60, align: 'right' })
          .text(`₹${item.total?.toLocaleString()}`, 460, rowY + 8, { width: 80, align: 'right' });
        rowY += 22;
      });

      // Totals
      const totalsY = rowY + 20;
      doc
        .fillColor(grayText)
        .fontSize(9)
        .text('Subtotal:', 390, totalsY, { width: 60, align: 'right' })
        .fillColor(darkText)
        .text(`₹${invoice.subtotal?.toLocaleString()}`, 460, totalsY, { width: 80, align: 'right' });

      doc
        .fillColor(grayText)
        .text('Shipping:', 390, totalsY + 15, { width: 60, align: 'right' })
        .fillColor(darkText)
        .text(`₹${invoice.shipping?.toLocaleString()}`, 460, totalsY + 15, { width: 80, align: 'right' });

      doc
        .rect(380, totalsY + 35, 170, 22)
        .fill(primaryColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL:', 390, totalsY + 40, { width: 60, align: 'left' })
        .text(`₹${invoice.total?.toLocaleString()}`, 460, totalsY + 40, { width: 80, align: 'right' });

      // Payment Method
      doc
        .fillColor(darkText)
        .fontSize(9)
        .font('Helvetica')
        .text(`Payment Method: ${(invoice.paymentMethod || 'COD').toUpperCase()}`, 40, totalsY + 45);

      // Footer
      doc
        .fillColor(grayText)
        .fontSize(8)
        .text('Thank you for your purchase!', 40, 700, { align: 'center', width: 510 });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};
