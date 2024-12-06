import express from "express"

const app = express()
app.use(express.json())


app.get("/", (req, res) => {
    res.json({ "msg": "works" })
})

app.listen(5000, () => {
    console.log("SERVER LISTENING ON PORT 5000");
})