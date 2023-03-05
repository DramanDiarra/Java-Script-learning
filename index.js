import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import { Options } from "selenium-webdriver/chrome.js";
import { JSDOM } from "jsdom";
import fs from "fs";

const scrapingSelectors = {
  selector1: "#kandydaci > section > div > ol > li:nth-child(1) > a > div > h3",
  selector2:
    "#kandydaci > section > div > ol > li:nth-child(1) > a > div > div.details-votes.single > div.details-votes-result.positive > b",
  selector3: "#kandydaci > section > div > p > span > span",
};

const urls = [
  {
    url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141257",
  },
  {
    url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141219",
  },
  {
    url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141221",
  },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141223",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141225",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141227",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141229",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141231",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141233",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141235",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141237",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141239",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141241",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141243",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141245",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141247",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141249",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141251",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141253",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141259",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141261",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141263",
  // },
  // {
  //   url: "https://dzienniklodzki.pl/p/kandydaci/ona-i-on%2C1015735/?groupId=141265",
  // },
];

// Przekazywac z funkcji do funkcji, a nie definiowac na zewnatrz
async function WebScrapingLocalTest(driver, lp) {
  const { selector1, selector2, selector3 } = scrapingSelectors;

  try {
    await driver.wait(until.elementLocated(By.css(selector1)), 15000);
    await driver.wait(until.elementLocated(By.css(selector2)), 15000);
    await driver.wait(until.elementLocated(By.css(selector3)), 15000);

    const couple = await driver.findElement(By.css(selector1));
    const votes = await driver.findElement(By.css(selector2));
    const area = await driver.findElement(By.css(selector3));
    const coupleName = await couple.getText();
    const votesValue = await votes.getText();
    const areaName = await area.getText();

    return { lp, coupleName, votesValue, areaName };
  } catch (error) {
    throw new Error(error);
  }
}

async function generateArray() {
  const scrapingData = [];

  for (let i = 0; i < urls.length; i++) {
    const options = new Options();
    options.excludeSwitches("enable-logging");
    let driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    let url = urls[i].url;
    await driver.get(url);
    const privacySelector = "#didomi-notice-agree-button";
    await driver.wait(until.elementLocated(By.css(privacySelector)), 15000);
    const acceptPrivacy = driver.findElement(By.css(privacySelector));
    acceptPrivacy.click();
    scrapingData.push(await WebScrapingLocalTest(driver, i));
    await driver.close();
  }
  return scrapingData;
  // sortTableByVotes(scrapingData);
  // renderTable(scrapingData);
}

function renderTable(scrapingData) {
  const { document } = new JSDOM(fs.readFileSync("Ona_i_On.html")).window;
  const tableBody = document.querySelector("#Ona_i_On > tbody");
  for (let i = 0; i < scrapingData.length; i++) {
    const current = scrapingData[i];
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `<td>${current.lp}</td><td>${current.coupleName}</td><td>${current.votesValue}</td><td>${current.areaName}</td>`;
    if (current.coupleName == "Anastasiia Verkhovska i Draman Diarra")
      tableRow.classList.add("us");
    tableBody.appendChild(tableRow);
  }

  fs.writeFileSync("output.html", document.documentElement.outerHTML);
}


function sortTableByVotes(scrapingData) {
  const sorted = [...scrapingData].sort((a, b) => b.votesValue - a.votesValue);
  for (let i = 0; i < scrapingData.length; i++) {
    scrapingData[i].lp = i + 1;
  }
  return sorted;
}

setInterval(async () => renderTable(sortTableByVotes(await generateArray())), 30000);

// const scrapingData = generateArray();
// const sorted = sortTableByVotes(scrapingData);
// renderTable(sorted);
