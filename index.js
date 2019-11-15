const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto("https://www.thegioididong.com/dtdd#i:5");
    await page.waitForSelector(".homeproduct");

    const data = await page.evaluate(() => {
      var nodeTitles = document.querySelectorAll(".homeproduct li a h3");

      var titles = [];
      nodeTitles.forEach(title => {
        titles.push(title.innerText);
      });
      return titles;
    });

    console.log(data);

    await browser.close();
  } catch (e) {
    console.log(e.message);
  }
})();
