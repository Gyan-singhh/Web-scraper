import express from "express";
import scrapeBooks from "../scraper/booksScraper.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const result = await scrapeBooks(randomPage);

    if (result.success) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { count: result.count },
            `Successfully scraped ${result.count} books`
          )
        );
    } else {
      throw new ApiError(500, "Scraping failed", result.error);
    }
  } catch (err) {
    next(new ApiError(500, err.message));
  }
});

export default router;
