// Using the tools and techniques you learned so far,
// you will scrape a website of your choice, then place the data
// in a MongoDB database. Be sure to make the database and collection
// before running this exercise.

// Consult the assignment files from earlier in class
// if you need a refresher on Cheerio.

// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
  res.send("Hello world");
});


// TODO: make two more routes


// Route 1
// =======
app.get("/scrape", function (req, res) {
  axios.get("https://www.npr.org/sections/news/").then(function (response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $(".item-info").each(function (i, element) {

      // Save the text of the element in a "title" variable
      var title = $(element).children().text().trim();

      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var link = $(element).children().children("a").attr("href");
      var summary = $(element).children().children("a").text().trim();

      // Save these results in an object that we'll push into the results array we defined earlier
      if (title && link && summary) {
        results.push({
          title: title,
          link:   link,
          summary: summary
        });
      }
    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
    res.send("Scrape Complete!");
  });
})

app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });



// Listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});