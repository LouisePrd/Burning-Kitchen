import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePrompt(req.body.ingredient),
    temperature: 0.3,
    max_tokens: 250,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  })

  const nomRecette = response.data.choices[0].text.split(/\r?\n/).filter((item) => item !== "")[0];

  const response1 = await openai.createImage({
    prompt: nomRecette,
    n: 1,
    size: "256x256",
  })

  res.status(200).json({ result: response1.data.data[0].url + '\n' + response.data.choices[0].text });
}

function generatePrompt(ingredient) {
  return `Write a recipe based on these ingredients and instructions:
  Ingredients: ${ingredient}
  Instructions:`;
}