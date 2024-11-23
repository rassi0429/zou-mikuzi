import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const initDB = async () => {
    const status = await prisma.status.findMany()
    if (status.length === 0) {
        await prisma.status.create({
            data: {
                latestTransactionId: 0
            }
        })
        console.log("status initialized")
    } else {
        console.log("status already exists")
    }
}

initDB()

const app = express();

const zouBotUserId = "cm3ucp0dr0017kle34sp87sz9"

const int = setInterval(async () => {
    const url = `https://zoubank.resonite.love/api/user/${zouBotUserId}`
    const result = await (await fetch(url)).json()

    const latestTransactionId = (await prisma.status.findMany())[0].latestTransactionId

    result.incomingTransfers.sort((a: any, b: any) => a.id - b.id)

    const misyori = result.incomingTransfers.filter((t: any) => t.id > latestTransactionId)

    console.log(misyori.map((m:any)=>m.id))

}, 100)

app.get('/', (req, res) => {
  res.send('zou-mikuzi');
});

app.post("/mikuzi/:UserId", (req, res) => {
  // 日付が変わってから、🐘が払われてたら今日のおみくじは払い出し済みなので
  // もう引いてあるおみくじのデータを返す
  // そうでない場合は、おみくじを引くためのリンクを生成


    res.send("mikuzi");
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
