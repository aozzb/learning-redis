import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

//in this example, we will use a simple queue to store email jobs
//this is one of the simplest ways to implement a queue with Redis, but there are many other ways to do it as well
//lpush = left push, rpop = right pop 

const QUEUE_KEY = "queue:emails";

app.post("/emails", async (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject || "No subject",
        body: req.body.body || "No body",
        createdAt: new Date().toISOString(),
    }
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    res.json({ queued: true, job });
});

app.get("/emails/process-one", async (req, res) => {
    const rawjob = await redis.lpop(QUEUE_KEY);
    if (!rawjob) {
        return res.status(404).json({ message: "No email jobs in queue" });
    }
    const job = JSON.parse(rawjob);
    res.json({ message: "Email sent", job});
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

