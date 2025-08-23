import pkg from "whatsapp-web.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./methods/DBconnect.js";
import qrcode from "qrcode";  // ✅ use this instead of only qrcode-terminal

dotenv.config({
  path: "./.env",
});

const { Client, LocalAuth } = pkg;
const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("error : ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

let qrCodeImage = null; // store QR code as base64

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "client-one",
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", 
      "--disable-gpu",
    ],
  },
});

client.on("qr", async (qr) => {
  console.log("QR RECEIVED");
  qrCodeImage = await qrcode.toDataURL(qr); // ✅ convert QR to image
});

// ✅ Add endpoint to show QR
app.get("/qr", (req, res) => {
  if (qrCodeImage) {
    res.send(`<h1>Scan this QR with WhatsApp</h1><img src="${qrCodeImage}" />`);
  } else {
    res.send("QR not generated yet. Please refresh in a few seconds.");
  }
});

client.on("ready", async () => {
  console.log("✅ WhatsApp client is ready!");
  const chat = await client.getChats();
  const groups = chat.filter((chat) => chat.isGroup);
  groups.forEach((group) => {
    console.log(`grp name : ${group.name} , ID : ${group.id._serialized}`);
  });
});

client.on("disconnected", (reason) => {
  console.log("Client disconnected:", reason);
});

client.initialize();
export { client };
