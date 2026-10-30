
const PRODUCT_PRICES = {
  tee: 499,
  shirt: 899,
  jeans: 1199,
  hoodie: 1299,
  baggy: 999,
  track: 799,
  fullshirt: 999,
  cargo: 1099
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error("Server configuration missing");
    }

    const body = JSON.parse(event.body || "{}");
    const customer = body.customer || {};
    const items = body.items || [];

    if (
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please provide complete order details" })
      };
    }

    if (customer.payment === "razorpay" || body.payment_method === "razorpay") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Online payment is not enabled here" })
      };
    }

    let subtotal = 0;

    const verifiedItems = items.map((item) => {
      const price = PRODUCT_PRICES[item.id];
      const qty = Number(item.qty);

      if (!price || !Number.isInteger(qty) || qty < 1 || qty > 10) {
        throw new Error("Invalid product or quantity");
      }

      subtotal += price * qty;

      return {
        id: item.id,
        qty,
        size: item.size || "",
        color: item.color || "",
        price
      };
    });

    const orderNumber =
      "GAV-" + Date.now().toString().slice(-8);

    const order = {
      order_number: orderNumber,
      customer_name: String(customer.name).trim(),
      customer_phone: String(customer.phone).trim(),
      pincode: String(customer.pincode || ""),
      city: String(customer.city || ""),
      delivery_address: String(customer.address).trim(),
      items: verifiedItems,
      subtotal,
      delivery_charge: 0,
      tax: 0,
      total_amount: subtotal,
      payment_method: "COD",
      payment_status: "pending",
      order_status: "pending"
    };

    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=representation"
        },
        body: JSON.stringify(order)
      }
    );

    if (!response.ok) {
      throw new Error("Order could not be saved");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        orderNumber
      })
    };

  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
