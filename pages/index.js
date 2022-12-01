import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);




export default function Home() {
  const [ingredientInput, setingredientInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    setResult("Loading...");
    event.preventDefault();
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredient: ingredientInput }),
    });
    const data = await response.json();
    setResult(data.result);
    setingredientInput("");
    document.querySelector(".show").style.display = "block";
  }

  function getInstructions() {
    if (result) {
      const resultSplit = result.split(/\r?\n/);
      return resultSplit.map((item, index) => {
        if (index == resultSplit.indexOf("Instructions:")) {
          return <strong>{item}</strong>;
        }
        else if (index > resultSplit.indexOf('Instructions:')) { // index > 1 is the instructions
          return <p key={index}>{item}</p>;
        }
      });
    }
  }

  function getIngredients() {
    if (result) {
      const resultSplit = result.split(/\r?\n/);
      return resultSplit.map((item, index) => {
        if (index < resultSplit.indexOf("Ingredients:")) { // Title recipe
          return <h2>{item}</h2>;
        } else if (index == resultSplit.indexOf("Ingredients:")) {
          return <strong>{item}</strong>;
        }
        else if (index > resultSplit.indexOf('Ingredients:') && index < resultSplit.indexOf('Instructions:')) { // index > 1 is the instructions
          return <p key={index}>{item}</p>;
        }
      });
    }
  }

  // if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
  //   console.log("Let's get this party started")
  //   // navigator.mediaDevices.getUserMedia({video: true})
  // }

const generateImage = async () => {
    const res = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "512x512",
    });

    setResult(res.data.data[0].url);
  };


  return (
    <div>
      <Head>
        <title>Burning Kitchen</title>
        <link rel="icon" href="/cook.png" />
      </Head>

      <main className={styles.main}>
        <h3>Burning Kitchen</h3>
        <div className="container" style={{ display: 'flex' }}>
          <div className="title">
            <center><img src="/cook.png" className={styles.icon} /></center>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                name="food"
                placeholder="Choose an ingredient"
                value={ingredientInput}
                onChange={(e) => setingredientInput(e.target.value)}
              />
              <input type="submit" value="Your recipe" />
            </form>
            <div className={styles.result1}>{getIngredients()}</div>
          </div>
          <div className={styles.result2}>
            {getInstructions()}
            <button className="show" onClick={ generateImage } style={{display:"none"}}>what does it look like</button>
          </div>

        </div>
      </main>
    </div>
  );
}
