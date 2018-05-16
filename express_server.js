let express = require("express");
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//sets engine as ejs
app.set("view engine", "ejs");

//pre-made url database assigned to a random alphanumeric string
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//page containing links to manually shorten URLs
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});

//displays entry field for URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//
app.get('/urls/:id', (req, res) => {
  let originalURL = { long: urlDatabase[req.params.id],
                      short: req.params.id };
  res.render('urls_show', originalURL);
})

//home page
app.get("/", (req, res) => {
  res.end("Hello!");
});

//sample page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//sample page displaying Hello World
app.get('/hello', (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POSTS to /urls
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");
});

//listens to specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




//generates random alphanumeric string
function generateRandomString() {
  let char = "";
  let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    let chosen = random.charAt(Math.floor(Math.random() * random.length));
    //let replace = new RegExp(chosen);
    //random = random.replace(replace, '');
    char += chosen;
  }

  //return console.log(char + "\n" + random);

}
//generateRandomString();