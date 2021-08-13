const puppeteer = require("puppeteer");
puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      "--single-process",
    ],
  });
  const page = await browser.newPage();

  await page.goto("https://www.google.com/travel/flights");
  await page.setViewport({ width: 1920, height: 969 });

  await page.waitForSelector(
    ".e5F5td:nth-child(1) > .zX8lIf > .v0tSxb > .dvO2xc > div > .V00Bye > .II2One"
  );

  await page.click("input[value=Provo]");

  await page.keyboard.sendCharacter("mci");

  await page.waitForSelector(".zsRT0d");
  await page.click(".zsRT0d");

  await page.keyboard.press("Tab");

  await browser.close();

  console.log("finished");
})();
