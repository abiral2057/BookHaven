
import type { Order } from "./db";

const ADMIN_EMAIL = "nepalhighlandtreks2080@gmail.com";

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(amount);
};

// Helper to generate a simple text version of the order details
const generateTextOrderDetails = (order: Order) => {
    let text = `Order ID: ${order.id}\n`;
    text += `Customer: ${order.customer.name}\n`;
    text += `Total: ${formatCurrency(order.total)}\n\n`;
    text += 'Items:\n';
    order.items.forEach(item => {
        text += `- ${item.name} (Qty: ${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    return text;
};

// Helper to generate an HTML version of the order details
const generateHTMLOrderDetails = (order: Order) => {
    return `
        <h2>Order Confirmation #${order.id}</h2>
        <p>Thank you for your order, ${order.customer.name}!</p>
        <h3>Order Summary</h3>
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="2" style="text-align: right;">Total:</th>
                    <th>${formatCurrency(order.total)}</th>
                </tr>
            </tfoot>
        </table>
        <p>We'll notify you again once your order has shipped.</p>
    `;
};


/**
 * Sends an order confirmation email to the customer.
 * 
 * TODO: Replace this with a real email sending service like Resend, SendGrid, or Mailgun.
 * You will need to install their SDK and configure an API key in your environment variables.
 * 
 * Example using Resend:
 * 
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * 
 * await resend.emails.send({
 *   from: 'BookHaven <noreply@yourdomain.com>',
 *   to: order.customer.email,
 *   subject: `Your BookHaven Order #${order.id} is Confirmed`,
 *   html: generateHTMLOrderDetails(order),
 *   text: generateTextOrderDetails(order),
 * });
 * 
 */
export async function sendOrderConfirmationToCustomer(order: Order) {
    try {
        console.log("--- Sending Order Confirmation to Customer ---");
        console.log(`To: ${order.customer.email}`);
        console.log(`Subject: Your BookHaven Order #${order.id} is Confirmed`);
        console.log("Body (Text):\n", generateTextOrderDetails(order));
        console.log("-----------------------------------------------");
        // PLACE YOUR EMAIL SENDING LOGIC HERE
    } catch (error) {
        console.error("Failed to send customer confirmation email:", error);
    }
}


/**
 * Sends a new order notification to the admin.
 * 
 * TODO: Replace this with a real email sending service.
 */
export async function sendNewOrderNotificationToAdmin(order: Order) {
    try {
        console.log("--- Sending New Order Notification to Admin ---");
        console.log(`To: ${ADMIN_EMAIL}`);
        console.log(`Subject: New Order Received #${order.id}`);
        console.log("Body (Text):\n", generateTextOrderDetails(order));
        console.log("---------------------------------------------");
        // PLACE YOUR EMAIL SENDING LOGIC HERE
    } catch (error) {
        console.error("Failed to send admin notification email:", error);
    }
}
