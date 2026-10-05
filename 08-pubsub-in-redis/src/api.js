//we dont need a publisher.js file because we can use the redis client directly in the api.js file to publish messages to the channel.

import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/notifications", async (req, res) => {
    const payload = {
        title: req.body.title || "Default Title",
        createdAt: new Date().toISOString(),
    }
    const receivers = await publisher.publish("notifications", JSON.stringify(payload));
    res.json({ message : "Notification sent to " + receivers + " receivers." });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on http://localhost:3000");
});