// Vercel Serverless Function — /api/contact
// Validates the incoming contact-form submission and forwards it via Web3Forms
// (https://web3forms.com) so Fabian receives it by email, without exposing
// any credentials to the browser.
//
// Setup required (one-time, done by Fabian in the Vercel dashboard):
//   Project Settings -> Environment Variables -> add WEB3FORMS_ACCESS_KEY
//   (get a free key at https://web3forms.com — just enter an email, no account/password)

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, eventDate, message, lang } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("WEB3FORMS_ACCESS_KEY is not set in the environment");
    return res.status(500).json({ error: "Form backend not configured" });
  }

  try {
    const payload = {
      access_key: accessKey,
      subject: "Nuevo contacto desde fabianavila site (" + (lang || "?") + ")",
      from_name: name,
      name: name,
      email: email,
      event_date: eventDate || "—",
      message: message
    };

    const web3formsRes = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await web3formsRes.json();
    if (!web3formsRes.ok || result.success === false) {
      console.error("Web3Forms error:", result);
      return res.status(502).json({ error: "Delivery failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
