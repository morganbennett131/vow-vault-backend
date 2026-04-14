import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, buyerUID, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      client_reference_id: orderId,
      metadata: {
        orderId,
        buyerUID
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Vow Vault Order"
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ]
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Error creating session" });
  }
}
