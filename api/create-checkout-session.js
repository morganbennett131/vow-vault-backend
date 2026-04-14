import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const source = req.method === "GET" ? req.query : (typeof req.body === "string" ? JSON.parse(req.body) : req.body);

    const orderId = source?.orderId;
    const buyerUID = source?.buyerUID;
    const amount = source?.amount;

    if (!orderId || !buyerUID || !amount) {
      return res.status(400).send("Missing required fields");
    }

    const unitAmount = Math.round(Number(amount));

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      client_reference_id: String(orderId),
      metadata: {
        orderId: String(orderId),
        buyerUID: String(buyerUID),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Vow Vault Order",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
    });

    return res.status(200).send(session.url);
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).send(err?.message || "Error creating session");
  }
}
