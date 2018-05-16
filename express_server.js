let express = require("express");
let cookieParser = require('cookie-parser');
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
//sets engine as ejs
app.set("view engine", "ejs");

//pre-made url database assigned to a random alphanumeric string
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//page containing links to manually shorten URLs
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
                        username: req.cookies["username"]};
  res.render('urls_index', templateVars);
});

//displays entry field for URLs
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//
app.get('/urls/:id', (req, res) => {
  let originalURL = { long: urlDatabase[req.params.id],
                      short: req.params.id,
                      username: req.cookies["username"] };
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
    // debug statement to see POST parameters
  //urlDatabase['h'] = req.body;
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  //console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
    // debug statement to see POST parameters
  //console.log(req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
    // debug statement to see POST parameters
  //console.log(req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);

});

app.post("/login", (req, res) => {
    // debug statement to see POST parameters
  //console.log(req.body.longURL);

  res.cookie('username', req.body.username);
  console.log(req.body);
  res.redirect(`/urls`);

});

app.post("/logout", (req, res) => {
    // debug statement to see POST parameters
  //console.log(req.body.longURL);

  res.clearCookie('username');
  console.log(req.body);
  res.redirect(`/urls`);

});

//listens to specified port
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
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
  return char;

}
//generateRandomString();