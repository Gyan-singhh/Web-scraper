import axios from "axios";
import * as cheerio from "cheerio";
import Book from "../models/Book.js";

async function scrapeBooks(pageNumber = 1) {
  try {
    const url = `https://books.toscrape.com/catalogue/page-${pageNumber}.html`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const books = [];
    const existingTitles = await Book.distinct("title");

    $("article.product_pod").each((i, element) => {
      const title = $(element).find("h3 a").attr("title");
      const priceText = $(element).find(".price_color").text();
      const price = parseFloat(priceText.replace(/[^\d.]/g, ""));
      const rating = $(element).find("p").attr("class").split(" ")[1];
      const availabilityText = $(element).find(".availability").text().trim();
      const availability = availabilityText === "In stock";
      const image = $(element).find("img").attr("src");
      const fullImageUrl = image ? new URL(image, url).toString() : null;

      if (title && !existingTitles.includes(title)) {

        books.push({
          title,
          price,
          rating: convertRatingToNumber(rating),
          availability,
          image: fullImageUrl,
          source: "books.toscrape.com",
        });
      }
    });

    if (books.length > 0) {
      await Book.insertMany(books);
      console.log(`Added ${books.length} new books from page ${pageNumber}`);
    } else {
      console.log(`No new books found on page ${pageNumber}`);
    }

    return {
      success: true,
      count: books.length,
      hasNextPage: $(".pager .next").length > 0,
      duplicatesSkipped: existingTitles.length - books.length,
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return { success: false, error: error.message };
  }
}

function convertRatingToNumber(ratingClass) {
  const ratingMap = {
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
  };
  return ratingMap[ratingClass] || 0;
}

export async function scrapeAllBooks() {
  const MAX_PAGES = 5;
  let page = 1;
  let totalScraped = 0;
  let totalDuplicates = 0;
  let lastError = null;

  try {
    while (page <= MAX_PAGES) {
      console.log(`Scraping page ${page}`);
      const result = await scrapeBooks(page);

      if (!result.success) {
        lastError = result.error;
        page++;
        continue;
      }

      totalScraped += result.count;
      totalDuplicates += result.duplicatesSkipped || 0;

      if (!result.hasNextPage) break;
      page++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (lastError && totalScraped === 0) {
      return { success: false, error: lastError };
    }

    console.log(
      `Finished scraping. Total new books: ${totalScraped}, Duplicates skipped: ${totalDuplicates}`
    );
    return {
      success: true,
      count: totalScraped,
      duplicatesSkipped: totalDuplicates,
      warnings: lastError ? [`Some pages failed: ${lastError}`] : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      partialResults: { count: totalScraped },
    };
  }
}

export default scrapeBooks;
