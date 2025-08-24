import pkg from "whatsapp-web.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./methods/DBconnect.js";
import qrcode from "qrcode-terminal";

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
      "--single-process", // <- may be needed
      "--disable-gpu"
    ],
  },
});


const allSession = {};
client.on("qr", (qr) => {
	qrcode.generate(qr, { small: true });
	console.log("QR RECEIVED");
});

client.on("ready", async () => {
	// for the identification of the group => get the group id
	const chat = await client.getChats();
	const groups = chat.filter((chat) => chat.isGroup);
	groups.forEach((group) => {
		console.log(`grp name : ${group.name} , ID : ${group.id._serialized}`);
	});
	console.log("Client is ready!");
});

client.on("disconnected", (reason) => {
	console.log("Client disconnected:", reason);
});

client.initialize();
export { client };
