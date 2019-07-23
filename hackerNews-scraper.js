const puppeteer = require('puppeteer')

const hackerNewsUrl = 'https://news.ycombinator.com/'

const getHackerNews = (pagesToScrape = 1) =>
  new Promise(async (resolve, reject) => {
    try {
      // set-up to go to a page
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      // this optional part is to only allow requests with the resource type of "document" to get through our filter, meaning that we will block all images, CSS, and everything else besides the original HTML response.
      await page.setRequestInterception(true)
      page.on('request', request =>
        request.resourceType() === 'document'
          ? request.continue()
          : request.abort()
      )

      await page.goto(hackerNewsUrl)

      let currentPage = 1
      let urls = []

      // iterate and get more news depending on pagesToScrape.
      while (currentPage <= pagesToScrape) {
        // page.evaluate(pageFunction[, ...args]) with pageFunction the function to be evaluated in the page context
        let newUrls = await page.evaluate(() => {
          let results = []
          // grabbing all the links that actually look like <a href="https://blablabla/" class="storylink">a story title</a>
          let items = document.querySelectorAll('a.storylink')

          items.forEach(item => {
            results.push({
              url: item.getAttribute('href'),
              text: item.innerText
            })
          })
          return results
        })

        urls = urls.concat(newUrls)

        if (currentPage < pagesToScrape) {
          await Promise.all([
            // to automatically click on the more button of HackerNews if we want more links.
            await page.waitForSelector('a.morelink'),
            await page.click('a.morelink'), // .click
            await page.waitForSelector('a.storylink') // .waitForSelector
          ])
        }
        currentPage++
      }

      browser.close() // .close when done.
      return resolve(urls)
    } catch (e) {
      return reject(e)
    }
  })

getHackerNews(5)
  .then(console.log)
  .catch(console.error)
