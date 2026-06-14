export async function sendWhatsappMessage(phone: string, message: string) {
  const url = process.env.MPWA_URL || "https://wa.rezzdev.my.id/send-message";
  const apiKey = process.env.MPWA_API_KEY;
  const sender = process.env.MPWA_SENDER;

  if (!apiKey || !sender) {
    console.warn("MPWA_API_KEY or MPWA_SENDER is not defined in environment variables");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender: sender,
        number: phone,
        message: message,
        footer: "CampusTicketing System",
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("Failed to send WhatsApp message:", data);
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}
