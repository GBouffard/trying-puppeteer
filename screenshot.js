const puppeteer = require('puppeteer')

// takes an argument as 2nd parameter. Example: node screenshot.js https://github.com
const url = process.argv[2]
if (!url) {
  throw 'Please provide URL as a first argument'
}

const run = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(url)
  await page.screenshot({ path: 'screenshot.png' })
  browser.close()
}

run()
