const puppeteer = require("puppeteer");
const fs = require("fs");
const express = require("express");
const app = express();

const ScrapeLink = require("./scrapLink");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto("https://www.thegioididong.com/dtdd#i:5", {
      waitUntil: "load"
    });
    await page.waitForSelector(".homeproduct");

    const data = await page.evaluate(() => {
      let nodeTitles = document.querySelectorAll(".homeproduct li a h3");
      let nodeSellPrice = document.querySelectorAll(
        ".homeproduct li a div.price strong"
      );
      let nodeBasePrice = Array.from(
        document.querySelectorAll(".homeproduct li a div.price"),
        price => (price.children[1] != null ? price.children[1].innerHTML : "")
      );
      let nodeImg = document.querySelectorAll(".homeproduct li a > img");

      let products = [];

      for (let i = 0; i < nodeTitles.length; i++) {
        products[i] = {
          name: nodeTitles[i].innerText.trim(),
          sellPrice: nodeSellPrice[i].innerText
            .trim()
            .slice(0, -1)
            .split(".")
            .join(""),
          basePrice: nodeBasePrice[i]
            .slice(0, -1)
            .split(".")
            .join(""),
          mainImg:
            nodeImg[i].getAttribute("src") == null
              ? nodeImg[i].getAttribute("data-original")
              : nodeImg[i].getAttribute("src")
        };
      }
      return products;
    });

    const links = await page.evaluate(() => {
      let nodeLink = Array.from(
        document.querySelectorAll(".homeproduct li a"),
        item => `https://www.thegioididong.com${item.getAttribute("href")}`
      );

      return nodeLink;
    });

    await browser.close();
    const images = await ScrapeLink(links);
    images.forEach((image, index) => {
      data[index].imgs = image;
    });

    // fs.writeFile("public/images.json", JSON.stringify(images), err => {
    //   if (err) throw err;
    //   console.log("Saved images!");
    // });

    console.log(data.length);

    fs.writeFile("public/data.json", JSON.stringify(data), err => {
      if (err) throw err;
      console.log("Saved data!");
    });
  } catch (e) {
    console.log(e.message);
  }
})();

app.get("/data", (req, res) => {
  res.sendFile(__dirname + "/public/" + "data.json");
});

const PORT = 5000;

app.listen(PORT, () => console.log("...listening on port 5000"));
