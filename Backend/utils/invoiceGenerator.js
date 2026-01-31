import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export const generateInvoice = async (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe to response
  doc.pipe(res);

  // Generate QR Code Data (URL for Delivery Partner to scan)
  // Assuming frontend runs on localhost:5173 or env variable
  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/delivery/update/${order.trackingId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl);

  // Header
  doc
    .fontSize(20)
    .text('INVOICE / SHIPPING LABEL', { align: 'center' })
    .moveDown();

  // Order Details
  doc
    .fontSize(12)
    .text(`Order ID: ${order._id}`)
    .text(`Tracking ID: ${order.trackingId}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    .moveDown();

  // Shipping Address
  doc
    .text('Ship To:', { underline: true })
    .text(order.shippingAddress.name)
    .text(order.shippingAddress.street)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`)
    .text(`Phone: ${order.shippingAddress.phone}`)
    .moveDown();

  // Items
  doc.text('Items:', { underline: true });
  order.items.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.name} - Qty: ${item.quantity} - Price: ${item.price}`);
  });
  doc.moveDown();

  doc.text(`Total Amount: ${order.totalPrice}`, { bold: true });
  doc.moveDown();

  // QR Code Section
  doc
    .fontSize(14)
    .text('SCAN TO UPDATE LOCATION', { align: 'center', color: 'red' })
    .moveDown(0.5);

  doc.image(qrCodeDataUrl, {
    fit: [150, 150],
    align: 'center',
    valign: 'center'
  });

  doc.end();
};

export const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      const filePath = `./uploads/${fileName}`; // Ensure uploads dir exists or use temp
      
      // Ensure directory exists
      import('fs').then(fs => {
          if (!fs.existsSync('./uploads')){
              fs.mkdirSync('./uploads');
          }
          
          const stream = fs.createWriteStream(filePath);
          doc.pipe(stream);

          // Content similar to generateInvoice but using invoice object structure
           doc
            .fontSize(20)
            .text('INVOICE', { align: 'center' })
            .moveDown();
          
           doc
            .fontSize(12)
            .text(`Invoice No: ${invoice.invoiceNumber}`)
            .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
            .moveDown();
            
           doc.text(`Total: ${invoice.total}`);
           
           doc.end();

           stream.on('finish', () => {
             resolve(filePath);
           });
           
           stream.on('error', (err) => {
               reject(err);
           });
      });

    } catch (error) {
      reject(error);
    }
  });
};
