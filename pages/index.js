import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [ingredientInput, setingredientInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    if (result) {
      document.querySelector(".showImg").style.display = "none";
    }
    setResult("Loading...");
    document.querySelector(".show").style.display = "none";
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
    document.querySelector(".show").style.display = "inline";
  }

  function getInstructions() {
    if (result) {
      const resultSplit = result.split(/\r?\n/);
      return resultSplit.map((item, index) => {
        if (index == resultSplit.indexOf("Instructions:")) {
          return <div key={index} style={{ "marginBottom": "18px" }}><strong key={index}>{item}</strong></div>;
        }
        else if (index > resultSplit.indexOf('Instructions:')) { // index > 1 is the instructions
          return <span key={index}>{item}</span>;
        }
      });
    }
  }

  function getIngredients() {
    if (result) {
      const resultSplit = result.split(/\r?\n/);
      return resultSplit.map((item, index) => {
        if (index == 0 && index !== resultSplit.indexOf("Ingredients:")) {
          return
        } else if (index < resultSplit.indexOf("Ingredients:")) { // Title recipe
          return <h2 key={index}>{item}</h2>;
        } else if (index == resultSplit.indexOf("Ingredients:")) {
          return <strong key={index}>{item}</strong>;
        }
        else if (index > resultSplit.indexOf('Ingredients:') && index < resultSplit.indexOf('Instructions:')) { // index > 1 is the instructions
          return <p key={index}>{item}</p>;
        }
      });
    }
  }

  function showImg() {
    if (result) {
      const resultSplit = result.split(/\r?\n/);
      return resultSplit.map((item, index) => {
        if (index == 0) {
          return <div key={index} style={{ "marginLeft": "120px" }}><img key={index} src={item} className="showImg" style={{ display: "none" }} />
          </div>;
        }
      });
    }
  }

  function displayImg() {
    if (result) {
      if (document.querySelector(".showImg").style.display == "none") {
        document.querySelector(".showImg").style.display = "flex";
      } else {
        document.querySelector(".showImg").style.display = "none";
      }
    }
  }

  //check if document is defined
  if (typeof document !== "undefined") {
    let camera_button = document.querySelector("#start-camera");
    let video = document.querySelector("#video");
    let click_button = document.querySelector("#click-photo");
    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");

    camera_button.addEventListener('click', async function () {
      if (document.querySelector(".videoLive").style.display == "block") {
        document.querySelector(".videoLive").style.display = "none";
      } else {
        document.querySelector(".videoLive").style.display = "block";
      }

      if (navigator.mediaDevices.getUserMedia.video !== true) {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
      } else {
        console.log('camera already on')
      }
    });

    click_button.addEventListener('click', function () {
      document.querySelector(".videoLive").style.display = "none";
      // Canvas 2D
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 26, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let urlImage = canvas.toDataURL('image/jpeg');
    });
  }

  function loadImgpdf() {
    var imgCertfif = new Image()
    imgCertfif.src = '/certif.png';
    // attendre 5 sec
    setTimeout(function () {
      saveButton(imgCertfif);
    }, 1000);

  }

  function saveButton(imgCertfif) {
    if (!result) {
      alert('Please choose some ingredients first');
    } else {
      const resultSplitPdf = result.split(/\r?\n/);
      let urlResult = resultSplitPdf[0];
      resultSplitPdf.shift();
      resultSplitPdf.shift();
      resultSplitPdf.shift();
      let titleResult = resultSplitPdf[0];
      resultSplitPdf.shift();

      var doc = new jsPDF();
      doc.setFont("ribbon");
      doc.setFontSize(16);
      doc.setTextColor('#D05353');

      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      doc.text(titleResult, pageWidth / 2 - 30, 30, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor('#000000');

      doc.text('Well done, you have created a great recipe! Heres the recap if you want to try and reproduce it:', 20, 45);
      var overflowTxt = doc.splitTextToSize(resultSplitPdf, 180);
      doc.text(20, 50, overflowTxt);

      // date today
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();

      doc.text(pageWidth - 50, 20, 'Date: ' + dd + '/' + mm + '/' + yyyy);

      let urlAvatar = canvas.toDataURL('image/png');
      doc.addImage(urlAvatar, 'png', 10, 10, 30, 22);

      doc.addImage(imgCertfif, 'png', 28, 22, 8, 8);
      doc.setFontSize(30);
      doc.text('A TABLE !', 20, pageWidth - 20);

      doc.save('recipe.pdf');
      alert('Your recipe has been saved');
    }
  }


  return (
    <div>
      <Head>
        <title>Burning Kitchen</title>
        <link rel="icon" href="/cook.png" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.4/jspdf.min.js"></script>
      </Head>

      <main className={styles.main}>

        <h3>Burning Kitchen</h3>

        <div className={styles.secVideo}>
          <button className={styles.btnVideo} id="start-camera">Create avatar</button>
          <button className={styles.btnVideo} id="click-photo">Let's cook !</button>
          <video className="videoLive" id="video" width="206" height="100" autoPlay style={{ display: "none" }}></video>

        </div>

        <div className="container" style={{ display: 'flex' }}>
          <div className={styles.title}>
            <img src="/cook.png" className={styles.icon} />
            <p className={styles.intro}> Ready to be a chef ? 🍳</p>
            <canvas className="photoTaken" id="canvas" width="120" height="85"></canvas>
            <style jsx>{`
              .photoTaken {
                marginBottom: 0px;margin-left: -301px;
              }`}</style>
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
            <button className={styles.saveCreation} onClick={loadImgpdf} >Save your creation</button>
            <div className={styles.result1}>{getIngredients()}</div>
          </div>
          <div className={styles.result2}>
            {getInstructions()}
            <button className="show" onClick={displayImg} style={{ display: "none" }}>what does it look like ?</button>
            <style jsx>{`
              .show {
                max-width: 100%;padding: 8px 10px;
                color: black;background-color: #f2b79f;
                border: none; border-radius: 4px;
                font-family: "ColfaxAI", Helvetica, sans-serif;
                margin-bottom: 10px;margin-top: 15px;
              }`}</style>
            <div>{showImg()}</div>
          </div>

        </div>
      </main>
    </div>
  );
}
