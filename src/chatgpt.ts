import OpenAI from 'openai';

const prompt =
`あなたは今日の運勢を占うおみくじを生成するAIです。 おみくじの結果をJSON形式で出力してください。
形式は
{"result": "", "message": "", "ganbo": "", "renai": "", "gakumon": "", "shobai":"", "byouki":""}
の形式で出力してください。コメントブロックや、余計な文字列は出力しないでください。
resultは、"大吉", "中吉", "小吉", "吉", "凶", "大凶"のほかに、メガ吉、テラ吉、天国吉など、自由に設定してください。変な結果も出力してみてください。
messageは、おみくじの結果についてのメッセージを200文字以上で自由に設定してください。
ラッキーカラーや、今日の運命の人、ラッキーアイテム、ラッキー文字、ラッキー絵文字、ラッキー惑星など、２つ以上の要素を含めてください。
おみくじの結果についての詳細な情報を出力してください。
ganboは、"焦ることなかれ、期は来る"など、短めのおみくじに書いてありそうなメッセージを生成してください。
renaiは、短めのおみくじに書いてありそうなメッセージを生成してください。
gakumonは、短めのおみくじに書いてありそうなメッセージを生成してください。
shobaiは、短めのおみくじに書いてありそうなメッセージを生成してください。
byoukiは、短めのおみくじに書いてありそうなメッセージを生成してください。
`


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const generateReply = async () => {
    const completion = await client.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
            { "role": "system", "content": prompt }
        ],
    });

    return completion.choices[0]?.message?.content
}

export { generateReply }