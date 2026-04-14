import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { orderId, buyerUID, amount } = body || {};

    if (!orderId || !buyerUID || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
        debug: { orderId, buyerUID, amount }
      });
    }

    const unitAmount = Math.round(Number(amount));

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        debug: { amount, unitAmount }
      });
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

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({
      error: err?.message || "Error creating session",
      type: err?.type || null,
      code: err?.code || null,
    });
  }
}
