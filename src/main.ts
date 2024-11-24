import express from 'express';
import {PrismaClient} from '@prisma/client';
import {generateMikuzi} from "./chatgpt";

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


const generateMikuziMessage = async () => {
    const msg = await generateMikuzi()
    if(msg) {
        try {
            const result = JSON.parse(msg)
            if (result) {
                // {"result": "", "message": "", "ganbo": "", "renai": "", "gakumon": "", "shobai":"", "byouki":""}
                // の形式で出力されてるかチェック
                if (result.result && result.message && result.ganbo && result.renai && result.gakumon && result.shobai && result.byouki) {
                    return result
                }
                return null
            }
        } catch (e) {
            return null
        }
    }
    return null
}

let generatingMikuzi = false

const initMikuzi = async () => {
    if(generatingMikuzi) {
        console.log("already generating mikuzi")
        return
    }
    generatingMikuzi = true
    try {
        const count = await prisma.mikuziBuffer.count()
        console.log("mikuzi count", count)
        if (count < 50) {
            for (let i = 0; i < 50 - count; i++) {
                const mikuzi = await generateMikuziMessage()
                if (mikuzi) {
                    await prisma.mikuziBuffer.create({
                        data: {
                            message: JSON.stringify(mikuzi)
                        }
                    })
                    console.log("generated mikuzi")
                } else {
                    console.log("failed to generate mikuzi")
                }
            }
        }
    } finally {
        generatingMikuzi = false
    }
}

initMikuzi()
setInterval(initMikuzi, 1000 * 60 * 5)


const app = express();

const zouBotUserId = "cm3ucp0dr0017kle34sp87sz9"

const shori = async () => {
    console.log("shori batch start")
    const url = `https://zoubank.resonite.love/api/user/${zouBotUserId}`
    const result = await (await fetch(url)).json()
    const incoming = result.incomingTransfers

    const misyori = await prisma.mikuziLog.findMany({
        where: {
            transactionId: null
        }
    })

    for (const mikuzi of misyori) {
        const transaction = incoming.find((t: any) => t.externalData.customData.customTransactionId === mikuzi.customTransactionId)
        if (transaction) {
            console.log("mikuzi found", mikuzi.customTransactionId, mikuzi.userId)
            await prisma.mikuziLog.update({
                where: {
                    id: mikuzi.id
                },
                data: {
                    transactionId: transaction.id
                }
            })
        }
    }
    console.log("shori batch end")
}

setInterval(shori, 1000 * 3)

app.get('/', (req, res) => {
    res.send('zou-mikuzi');
});

app.get("/mikuzi/:UserId", async (req, res) => {
    // 日付が変わってから、🐘が払われてたら今日のおみくじは払い出し済みなので
    // もう引いてあるおみくじのデータを返す
    // そうでない場合は、おみくじを引くためのリンクを生成

    const mikuzi = await prisma.mikuziLog.findFirst({
        where: {
            userId: req.params.UserId,
            createdAt: {
                // 日本時間の今日の0時
                gte: new Date(new Date().getTime() - 9* 60 * 1000).setHours(0, 0, 0, 0)
            }
        }
    })

    console.log(mikuzi)

    if (mikuzi) {
        // もう今日は引いて、支払い済みな時
        if(mikuzi.transactionId) {
            // mikuzi.messageはJSONで、result, message, ganbo, renai, gakumon, shobai, byoukiが入ってる
            // その順番で改行区切りで返す
            const result = JSON.parse(mikuzi.message)
            res.send(`${result.result}\n${result.message}\n${result.ganbo}\n${result.renai}\n${result.gakumon}\n${result.shobai}\n${result.byouki}`)

            // res.send(`#${mikuzi.message}`)
        } else {
            const payUrl = `https://zoubank.resonite.love/send?sendTo=${zouBotUserId}&amount=100&customTransactionId=${mikuzi.customTransactionId}`
            res.send(payUrl)
        }
    } else {
        const customTransactionId = Math.random().toString(36).slice(-8)
        const mikuziMessage = await prisma.mikuziBuffer.findFirst();

        if(!mikuziMessage) {
            res.send("no mikuzi")
            return
        }

        // bufferから消す
        await prisma.mikuziBuffer.delete({
            where: {
                id: mikuziMessage.id
            }
        })

        await prisma.mikuziLog.create({
            data: {
                userId: req.params.UserId,
                customTransactionId,
                message: mikuziMessage.message
            }
        })

        const payUrl = `https://zoubank.resonite.love/send?sendTo=${zouBotUserId}&amount=100&customTransactionId=${customTransactionId}`
        res.send(payUrl)
    }
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
