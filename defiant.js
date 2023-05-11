import puppeteer from "puppeteer";
import {writeFileSync} from "fs";
import {parse} from 'json2csv';

const saveAsCSV = (csvData) => {
    const csv = parse(csvData)
    writeFileSync('result.csv', csv);
}

const getQuotes = async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C://chrome-win/chrome.exe',
        headless: false,
        defaultViewport: null,
    });

    // Open a new page
    const page = await browser.newPage();

    // await page.setDefaultNavigationTimeout(0)
    await page.goto("https://thedefiant.io/news");

    await page.waitForTimeout(50000);
    
    let results = [];
    let data = [];
    
    results = results.concat(await extractedEvaluateCall(page));

    for (let i = 0; i < results.length; i++) {
        await page.goto(results[i].url);
        await page.waitForTimeout(5000);
        const article = await getArticles(page);

        const insertData = {
            title: results[i].title,
            content: results[i].content,
            articles: article.article,
            url: results[i].url
        }
        data.push(insertData)
    }

    // Close the browser
    await browser.close();

    saveAsCSV(data);
};

async function extractedEvaluateCall(page) {
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll("div.gap-8 div.flex-row");

        return Array.from(quoteList).map((quote) => {
            const url = quote.querySelector("div.ml-4 a:nth-child(2)").href;
            const title = quote.querySelector("a:nth-child(2) h3").innerText;
            const content = quote.querySelector("div.text-base").innerText;

            return { url, title, content };
        });
    });

    return quotes;
}

async function getArticles(page) {
    await page.waitForSelector('main')

    let article = '';

    try {
        article = await page.$eval("article", el => el.innerText);
    } catch (e) {

    }

    return { article }
}

// Start the scraping
getQuotes();