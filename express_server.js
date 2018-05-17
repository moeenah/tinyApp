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

//directory of users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//home page containing all info
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
                        user_id: req.cookies.user_id,
                        users: users };
  //console.log(req.cookies.user_id);

  res.render('urls_index', templateVars);
});

//displays entry field for new URLs
app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id,
                      users: users };
  res.render("urls_new", templateVars);
});

//sends originalURL object to shortened URL page and shows the page
app.get('/urls/:id', (req, res) => {
  let originalURL = { long: urlDatabase[req.params.id],
                      short: req.params.id,
                      user_id: req.cookies.user_id,
                      users: users };
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

//redirects to longURL for shortURL page
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//renders register page
app.get("/register", (req, res) => {

  res.render('urls_register');
});

//renders login page
app.get("/login", (req, res) => {
  res.render('urls_login');
});

//checks if email and pass match ones in users object and checks if fields are empty
app.post("/login", (req, res) => {
  console.log(req.body.email);

  if (req.body.email === '' || req.body.password === '') {
    console.log(req.body);
    res.sendStatus(403);
  }

  else {


  let arrID = Object.keys(users);

  let arrEmail = [];
  arrID.forEach(function(element) {
    arrEmail.push((users[element].email));
  });
  //console.log(arrEmail);

  let arrPassword = [];
  arrID.forEach(function(element) {
    arrPassword.push((users[element].password));
  });
  //console.log(arrPassword);

  if (arrEmail.includes(req.body.email) === false) {
    //add alert to error
        res.sendStatus(403);
  }
  else if (arrPassword.includes(req.body.password) === false) {
    //add alert to error
        res.sendStatus(403);
  }
  else {

  let userKeys = Object.keys(users);
  console.log(userKeys);
  let id = '';
  userKeys.forEach(function(element) {
    if (users[element]['email'] === req.body.email) {
      id = element;
    }
  });
  console.log(id);
  res.cookie('user_id', id);
    res.redirect('/urls');
  }
}
});

//checks if email already exists and checks if field is empty
app.post("/register", (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    console.log(req.body);
    //add alert to error
    res.sendStatus(400);
  }

  else {

    let arrEmail = [];
    let arrID = Object.keys(users);
    arrID.forEach(function(element) {
      arrEmail.push((users[element].email));
    });
    console.log(arrEmail);

      if (arrEmail.includes(req.body.email)) {
        //add alert to error
            res.sendStatus(400);
      }

      else {
       let random = generateRandomString();
        users[random] = {};
        users[random]['id'] = random;
        users[random]['email'] = req.body.email;
        users[random]['password'] = req.body.password;

        res.cookie('user_id', random);
        console.log(users);
        res.redirect('/urls');
      }
  }
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

app.post("/logout", (req, res) => {
    // debug statement to see POST parameters
  //console.log(req.body.longURL);

  res.clearCookie('user_id');
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