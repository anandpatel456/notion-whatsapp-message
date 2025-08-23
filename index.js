import pkg from "whatsapp-web.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./methods/DBconnect.js";
import qrcode from "qrcode";

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

// --------- WhatsApp Client Setup ----------
let qrCodeImage = null;
let isClientReady = false;

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
  qrCodeImage = await qrcode.toDataURL(qr);
  isClientReady = false;
});

// ✅ Default route shows QR or status
app.get("/", (req, res) => {
  if (isClientReady) {
    res.send("<h1>✅ WhatsApp Bot Connected</h1>");
  } else if (qrCodeImage) {
    res.send(`<h1>Scan this QR with WhatsApp</h1><img src="${qrCodeImage}" />`);
  } else {
    res.send("QR not generated yet. Please refresh in a few seconds.");
  }
});

// ✅ Optional: check connection status
app.get("/status", (req, res) => {
  res.json({ ready: isClientReady });
});

client.on("ready", async () => {
  isClientReady = true;
  console.log("✅ WhatsApp client is ready!");
  const chat = await client.getChats();
  const groups = chat.filter((chat) => chat.isGroup);
  groups.forEach((group) => {
    console.log(`grp name : ${group.name} , ID : ${group.id._serialized}`);
  });
});

client.on("disconnected", (reason) => {
  isClientReady = false;
  console.log("Client disconnected:", reason);
});

client.initialize();
export { client };
