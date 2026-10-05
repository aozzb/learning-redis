import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/post/:id/view", async (req, res) => {
    const key = `post:${req.params.id}:views`;
    const views = await redis.incr(key);

    res.json({
        postId: req.params.id,
        views
    })
});


app.post("/leaderboard/score", async (req, res) => {
    const userId = req.body.userId;
    const points = req.body.points;

    const newScore = await redis.zincrby("leaderboard", points, userId);
    res.json({
        userId,
        score: newScore
    })
});


app.get("/leaderboard", async (req, res) => {
    const list = await redis.zrevrange(
        "leaderboard",
        0,
        9,
        "WITHSCORES"
    );

    const leaderboard = [];
    for (let i = 0; i < list.length; i += 2) {
        leaderboard.push({
            userId: list[i],
            score: Number(list[i + 1])
        });
    }
    
    res.json({
        leaderboard
    });
});


app.get("/leaderboard/:userid/rank", async (req, res) => {
    const userid = req.params.userid;
    const rank = await redis.zrevrank("leaderboard", userid);

    if (rank === null) {
        return res.status(404).json({
            error: "User not found in leaderboard"
        });
    }

    res.json({
        userId: userid,
        rank: rank + 1
    })
});


app.listen(process.env.PORT || 3000, () =>{
    console.log("Server is running on http://localhost:3000");
});