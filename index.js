const puppeteer = require("puppeteer");
const moment = require("moment");
const _ = require("lodash");
const axios = require("axios");
const destinationsCodes = require("./destinations.json");

const cron = require("node-cron");

const thisTuesday = moment()
  .startOf("isoWeek")
  .add(1, "week")
  .day("Tuesday")
  .format("MM DD");
const nextTuesday = moment()
  .startOf("isoWeek")
  .add(2, "week")
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

const fetchFlights = async () => {
  for (let u = 0; u < destinationsCodes.length; u++) {
    try {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disabled-setupid-sandbox"],
      });
      const page = await browser.newPage();

      await page.goto("https://www.google.com/travel/flights");
      await page.setViewport({ width: 1920, height: 969 });

      await page.waitForSelector(
        ".e5F5td:nth-child(1) > .zX8lIf > .v0tSxb > .dvO2xc > div > .V00Bye > .II2One"
      );

      await page.click("input.II2One.j0Ppje.zmMKJ.LbIaRd");

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

        if ((await page.$("span.YMlIz")) == null) {
          priceGraph.push({
            Date_pulled: todayDate,
            City: "NA",
            Destination: destinationsCodes[u],
            Date: "N/A",
            Price: 10000000,
            URL: 'N/A'
          });
        } else {
          await page.waitForSelector("span.YMlIz");
          const price = await page.$eval("span.YMlIz", (e) => e.innerHTML);
          priceGraph.push({
            Date_pulled: todayDate,
            City: await page.$eval("[aria-label='Where to?']", (e) => e.value),
            Destination: destinationsCodes[u],
            Date: date,
            Price: parseInt(price.substring(1).replace(",", "")),
            URL: await page.url()
          });
        }
      }

      await page.waitForSelector("button[jsname='Oc7uMe']");
      await page.click("button[jsname='Oc7uMe']");

      const cheapestFlight = priceGraph.sort((a, b) =>
        a.Price > b.Price ? 1 : -1
      );

      masterData.push(cheapestFlight[0]);

      console.log(masterData);
      await browser.close();

      if (u === 129) {
        postDataToSheet();
      }
    } catch (err) {
      console.log(err.name);
      continue;
    }
  }
};

fetchFlights();

/*
cron.schedule(
  "1 2 * * *",
  function () {
    console.log("scheduler is running");
    fetchFlights();
  },
  {
    timezone: "America/Los_Angeles",
  }
);
*/
