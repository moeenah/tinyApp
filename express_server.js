let express = require("express");

const cookieSession = require('cookie-session');

const bodyParser = require("body-parser");

const bcrypt = require('bcryptjs');

let app = express();

let PORT = process.env.PORT || 8080;

const salt = bcrypt.genSaltSync(10);

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: [bcrypt.hashSync("key", salt)],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

//pre-made url database assigned to a random alphanumeric string
let urlDatabase = {
  "b2xVn2": {id: "b2xVn2",
              url: "http://www.lighthouselabs.ca",
              userID: "userRandomID"},

  "9sm5xK": {id: "9sm5xK",
              url: "http://www.google.com",
              userID: "user2RandomID"}
};

//directory of users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

//adds url to user's object
function urlsForUser(id) {
  let userArr = [];
  let UrlID = Object.keys(urlDatabase);

  UrlID.forEach(function(element) {
    if (urlDatabase[element]['userID'] === id) {
    userArr.push(urlDatabase[element]);
    }
  });
  return userArr;
}

//checks if password is part of any user's object
function passWord(email) {
  let userIdArr = Object.keys(users);
  let result = '';
  userIdArr.forEach(function(userID) {
    if (users[userID].email === email) {
      result = users[userID].password;
    }
  });
  return result;
}

//generates random alphanumeric string
function generateRandomString() {
  let char = "";
  let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    let chosen = random.charAt(Math.floor(Math.random() * random.length));
    char += chosen;
  }
  return char;
}

app.get('/', (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

//home page containing all info
app.get('/urls', (req, res) => {
    let templateVars = { urls: urlsForUser(req.session.user_id),
                      user_id: req.session.user_id,
                      users: users };

  res.render('urls_index', templateVars);
});

//displays entry field for new URLs
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
  let templateVars = {user_id: req.session.user_id,
                      users: users };
  res.render("urls_new", templateVars);
}
});

//sends originalURL object to shortened URL page and shows the page
app.get('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    let templateVars = {error: 'does not exist',
                        short: req.params.id,
                        user_id: req.session.user_id,
                        users: users,
                        userID: urlDatabase[req.params.id] };
    res.render('urls_show', templateVars);
  } else {
    let templateVars = { long: urlDatabase[req.params.id]['url'],
                        short: req.params.id,
                        user_id: req.session.user_id,
                        users: users,
                        userID: urlDatabase[req.params.id]['userID'],
                        error: urlDatabase[req.params.id]};
    res.status(403);
    res.render('urls_show', templateVars);
  }
});

//redirects to longURL for shortURL page
app.get("/u/:shortURL", (req, res) => {
   if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(400).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 400</p><p>This TinyURL does not exist.</p><form action="/urls" method="GET"><input id="Home" type="submit" value="Home"/></form></body></html>');
  } else {
    let longURL = urlDatabase[req.params.shortURL]['url'];
    res.redirect(longURL);
  }
});

//renders register page
app.get("/register", (req, res) => {
  if (req.session.user_id === undefined) {
    res.render('urls_register');
  } else {
    res.redirect('/urls');
  }
});

//renders login page
app.get("/login", (req, res) => {
  if (req.session.user_id === undefined) {
    res.render('urls_login');
  } else {
    res.redirect('/urls');
  }
});

//checks if email and pass match ones in users object and checks if fields are empty
app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(403).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 403</p><p>Please enter both an email and a password.</p><form action="/login" method="GET"><input id="Try again" type="submit" value="Try again"/></form></body></html>');
  }
  let arrID = Object.keys(users);

  let arrEmail = [];
  arrID.forEach(function(element) {
    arrEmail.push((users[element].email));
  });

  let arrPassword = [];
  arrID.forEach(function(element) {
    arrPassword.push((users[element].password));
  });

  if (arrEmail.includes(req.body.email) === false) {
    //returns error message
    res.status(403).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 403</p><p>Incorrect email adress.</p><form action="/login" method="GET"><input id="Try again" type="submit" value="Try again"/></form></body></html>');
  } else if (bcrypt.compareSync(req.body.password, passWord(req.body.email)) === false) {
    //returns error message
    res.status(403).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 403</p><p>Incorrest password</p><form action="/login" method="GET"><input id="Try again" type="submit" value="Try again"/></form></body></html>');
  } else {
    let userKeys = Object.keys(users);
    let id = '';
    userKeys.forEach(function(element) {
      if (users[element]['email'] === req.body.email) {
        id = element;
      }
    });
    //setting cookie
    req.session.user_id = id;
    //redirect to /urls
    res.redirect('/urls');
  }
});

//checks if email already exists and checks if field is empty
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    //returns error message
    res.status(400).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 400</p><p>Please enter both an email and a password.</p><form action="/register" method="GET"><input id="Try again" type="submit" value="Try again"/></form></body></html>');
  } else {
      let arrEmail = [];
      let arrID = Object.keys(users);
      arrID.forEach(function(element) {
        arrEmail.push((users[element].email));
      });
        if (arrEmail.includes(req.body.email)) {
          //returns error message
          res.status(400).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 400</p><p>This email address is already in use.</p><form action="/register" method="GET"><input id="Try again" type="submit" value="Try again"/></form></body></html>');
        } else {
            //generates random alphanumeric string
            let random = generateRandomString();
            //adds new user to users object
            users[random] = {};
            users[random]['id'] = random;
            users[random]['email'] = req.body.email;
              //encrypts password with bcrypt
            users[random]['password'] = bcrypt.hashSync(req.body.password, salt);
            //setting cookie
            req.session.user_id = random;
            //redirects to /urls
            res.redirect('/urls');
        }
  }
});

//POSTS to /urls
app.post("/urls", (req, res) => {
  //creates a new tinyURL
  let random = generateRandomString();
  urlDatabase[random] = {}
  urlDatabase[random]['id'] = random;
  urlDatabase[random]['url'] = req.body.longURL;
  urlDatabase[random]['userID'] = req.session.user_id;
  //redirects to edit page for new URL
  res.redirect(`/urls/${random}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.session.user_id;
   if (urlDatabase[req.params.id] === undefined) {
    res.sendStatus(403);
  }
  else if (user_id !== urlDatabase[req.params.id]['userID']) {
    res.sendStatus(403);
  }
  else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

app.post("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;

  if (urlDatabase[req.params.id] === undefined) {
    res.status(403).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 403</p><form action="/urls" method="GET"><input id="Home" type="submit" value="Home"/></form></body></html>');
  } else if (user_id !== urlDatabase[req.params.id]['userID']) {
    res.status(403).send('<html><head><title>TinyAPP</title></head><body style="font-size:20px; padding:50px;"><p>Error 403</p><form action="/urls" method="GET"><input id="Home" type="submit" value="Home"/></form></body></html>');
  } else {
    urlDatabase[req.params.id]['url'] = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect(`/urls`);

});

//listens to specified port
app.listen(PORT, () => {
  console.log(`Connect to TinyApp through localhost:${PORT} !`);
});