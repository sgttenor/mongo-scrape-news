var express = require("express");
var router = express.Router();

// *** Scraping Tools *** //
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");




//Scrape from www.org for title, link, and summary of article
router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.npr.org/sections/news/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".item-info").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children()
                .text()
                .trim();
            result.link = $(this)
                .children()
                .children("a")
                .attr("href");
            result.summary = $(this)
                .children()
                .children("a")
                .text()
                .trim();


            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

router.get("/", function (req, res) {
    // Limit set to only show first 20 articles.
    db.Article.find({}).limit(20)
        .then(function (scrapedData) {
            // Save all scraped data into a handlebars object.
            var hbsObject = { articles: scrapedData };
            console.log(hbsObject);
            // Send all found articles as an object to be used in the handlebars receieving section of the index.
            res.render("index", hbsObject);
        })
        .catch(function (error) {
            // If an error occurs, send the error to the client.
            res.json(error);
        });
});

router.put("/saved/:id", function(req, res) {
    // Update the article's boolean "saved" status to 'true.'
    db.Article.update(
        {_id: req.params.id},
        {saved: true}
    )
    .then(function(result) {
        res.json(result);
    })
    .catch(function(error) {
        // If an error occurs, send the error to the client.
        res.json(error);
    });
});


// Route to drop the Articles collection.
router.delete("/drop-articles", function(req, res, next) {
    db.Article.remove({}, function(err) {
        if (err) {
            console.log(err)
        } else {
            console.log("articles dropped!");
        }
    })
    .then(function (dropnotes) {
        db.Note.remove({}, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log("notes dropped!");
            }
        })
    })
});

module.exports = router;