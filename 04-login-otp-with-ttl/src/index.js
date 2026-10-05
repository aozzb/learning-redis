import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phoneNumber) {
  return `otp:${phoneNumber}`;
}

app.post("/otp", async (req, res) => {
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    await redis.set(otpKey(phoneNumber), otp, "EX", 30); // Store OTP in Redis with a TTL of 30 seconds
    res.json({ message: "OTP sent", otp }); // In a real application, you would send the OTP via SMS instead of returning it in the response
});

app.post("/otp/verify", async (req, res) => {
    const { phoneNumber, otp } = req.body;

    const storedOtp = await redis.get(otpKey(phoneNumber));
    
    if(!storedOtp) {
        return res.status(400).json({ error: "OTP has expired or is invalid" });
    }

    if (storedOtp === otp) {
        await redis.del(otpKey(phoneNumber)); // Remove the OTP from Redis after successful verification
        res.json({ message: "OTP verified successfully" });
    } else {
        res.status(400).json({ error: "Invalid OTP" });
    }
});

app.get("/otp/:phoneNumber/ttl", async (req, res) => {
    const { phoneNumber } = req.params;
    const ttl = await redis.ttl(otpKey(phoneNumber));
    res.json({ ttl });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});