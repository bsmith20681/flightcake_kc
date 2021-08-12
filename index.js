const puppeteer = require("puppeteer");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const moment = require("moment");
const _ = require("lodash");
const axios = require("axios");
const destinationsCodes = require("./destination.json");

const thisTuesday = moment()
  .startOf("isoWeek")
  .add(2, "week")
  .day("Tuesday")
  .format("MM DD");
const nextTuesday = moment()
  .startOf("isoWeek")
  .add(3, "week")
  .day("Tuesday")
  .format("MM DD");

const todayDate = moment().format("L");

let masterData = [];

function postDataToSheet() {
  axios
    .post("https://sheetdb.io/api/v1/t2ipmu3oivdd6", {
      data: masterData,
    })
    .then((response) => {
      console.log(response.data);
    });
}

(async () => {
  for (let u = 0; u < destinationsCodes.length; u++) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      /*
      const recorder = new PuppeteerScreenRecorder(page);
      await recorder.start(`simple-${destinationsCodes[u]}.mp4`);
      */
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

      await page.keyboard.sendCharacter(destinationsCodes[u]);

      await page.waitForSelector(".zsRT0d");
      await page.click(".zsRT0d");

      await page.waitForSelector("[aria-label='Departure date']");
      await page.click("[aria-label='Departure date']");

      await page.keyboard.press("Backspace");

      await page.keyboard.type(thisTuesday, {
        delay: 100,
      });

      await page.keyboard.press("Enter");

      await page.keyboard.press("Tab");

      await page.keyboard.press("Backspace");

      await page.keyboard.type(nextTuesday, {
        delay: 100,
      });

      await page.keyboard.press("Tab");

      await page.waitForSelector("div[jsaction='JIbuQc:gDFeCe']");
      await page.click("div[jsaction='JIbuQc:gDFeCe']");

      let priceGraph = [];

      for (let i = 1; i < 61; i++) {
        await page.waitForSelector(`.ZMv3u-JNdkSc:nth-of-type(${i})`);
        await page.click(`.ZMv3u-JNdkSc:nth-of-type(${i})`);

        await page.waitForSelector("div.hguy9c");

        const date = await page.$eval("div.hguy9c", (e) => e.innerHTML);

        await page.waitForSelector("span.YMlIz");
        const price = await page.$eval("span.YMlIz", (e) => e.innerHTML);
        priceGraph.push({
          Date_pulled: todayDate,
          Destination: destinationsCodes[u],
          Date: date,
          Price: parseInt(price.substring(1).replace(",", "")),
        });
      }

      await page.waitForSelector("button[jsname='Oc7uMe']");
      await page.click("button[jsname='Oc7uMe']");

      const cheapestFlight = priceGraph.sort((a, b) =>
        a.Price > b.Price ? 1 : -1
      );

      masterData.push(cheapestFlight[0]);

      console.log(masterData);
      //await recorder.stop();
      await browser.close();

      if (u === 15) {
        postDataToSheet();
      }
    } catch (err) {
      console.log(err.name);
      continue;
    }
  }
})();
