const { Cluster } = require("puppeteer-cluster");

module.exports = async links => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 4
  });

  const imgsgroup = [];
  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.click(".owl-carousel > li");
    await page.waitForSelector(
      ".fotorama__nav__frame .fotorama__thumb img.fotorama__img"
    );
    let imgs = await page.evaluate(() => {
      let result = Array.from(
        document.querySelectorAll(
          ".fotorama__nav__frame .fotorama__thumb img.fotorama__img"
        ),
        img =>
          `https:${img
            .getAttribute("src")
            .split("180x125")
            .join("org")}`
      );
      return result;
    });
    imgsgroup.push(imgs);
  });

  links.forEach(link => {
    cluster.queue(`${link}`);
  });

  await cluster.idle();
  await cluster.close();

  return imgsgroup;
};
