const { time } = require('console');
const { route } = require('./index.js');

(
  function () {
    "use strict";
    let express = require('express');
    let bodyParser = require('body-parser')
    let router = express.Router()
    let multer = require('multer')
    let path = require('path')
    let upload = multer()
    let app = express();
 
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json())
    app.use('/', router)
 
    // Database Connection
    let db = require('./db.js');
    let userDB = new db("localhost", "newuser", "", "iCare");

    // API Methods
    let apiM = require('./api_methods.js');
    let api_methods = new apiM();

    // Token Methods
    let tokenClass = require('./token.js')
    let userToken = new tokenClass();

    // ---------------------------------
    // Our server listens for POST requests.
    // ---------------------------------

    // User tries to create account.
    router.post('/user', async function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      let dName = req.body.displayName;
      let success = false;

      // Checks password length, email, and display name
      if (!email || !password || !dName) { success = false; }
      else if (password.length > 8) { 
        let encrypted_pass = await api_methods.encryptPass(password);
        success = await userDB.createUser(email, encrypted_pass, dName).then((result) => { return result; }); 
      }

      // Response Codes
      if (success == true) {
        let tokenValue = await userToken.createToken(email).then((r) => { return r; });
        res.status(201).send({ token: tokenValue, accountInfo: { email: email, displayName: dName } });
      }
      else {
        let array = await api_methods.postCreateUser(dName, password).then((r) => { return r; }); 
        res.status(401).send({ reason: array[0], message: array[1] });
      }
    })

    // User tries to login
    router.post('/auth', async function (req, res) {
      let email = req.body.email;
      let password = req.body.password;

      // Checks crypto pass
      let success = await api_methods.checkPass(password, email).then((r) => { return r; });
      
      // Response Codes
      if (success == true) {
        let tokenValue = await userToken.createToken(email).then((r) => { return r; });
        let dName = await userDB.getDisplayName(email).then((r) => { return r; });
        
        res.status(200).send({ token: tokenValue,  accountInfo: { email: email, displayName: dName } });
      }
      else { res.status(401).send({ reason: "INVALID_CREDENTIALS", message: "Authentication invalid" }) }

    });

    // Change email
    router.put('/user', async (req, res) => {
      let token = req.headers.auth;
      let oldEmail = ""

      // Checks Token -------------------------
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else {  oldEmail = r; return true; }
      })
      if (checkToken == false) { return; }

      // Checks crypto pass and changes email -------------------------
      let newEmail = req.body.data.email;
      let pass = req.body.data.password;
      let checkPass = await api_methods.checkPass(pass, oldEmail).then((r) => { return r; });

      if (checkPass == true) {
        let success = await userDB.changeEmail(oldEmail, newEmail).then((r) => { return r; });
        if (success == true) { 
          let tokenValue = await userToken.createToken(newEmail).then((r) => { return r; });
          res.status(200).send({ token: tokenValue, reason: "SUCCESS", message: "Changed email" });  
        }
        else { res.status(409).send({ reason: "BAD_EMAIL", message: "The email is already in use." }); }
      }
      else { res.status(401).send({ reason: checkPass[0], message: checkPass[1] }); }

    });
    
    // Delete user
    router.delete('/user', async (req, res) => {
      let token = req.headers.auth;
      let email = ""

      // Checks Token -------------------------
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else { email = r; return true; }
      })
      if (checkToken == false) { return; }

      // Checks crypto pass and deletes user -------------------------
      let pass = req.body.data.password;
      let checkPass = await api_methods.checkPass(pass, email).then((r) => { return r; });

      if (checkPass == true) { 
        let success = await userDB.deleteAccount(email).then((r) => { return r; }); 
        if (success == true) { res.status(200).send({ reason: "SUCCESS", message: "Deleted account" }); }
        else { res.status(401).send({ reason: "INVALID_CREDENTIALS", message: "Couldn't delete account." }); }
      }
      else { res.status(401).send({ reason: checkPass[0], message: checkPass[1] }); }
    });
     


    ///------------------------------------------------------------------------
 
    // Gets preferences of user
    router.get('/prefs', async function (req, res) {
      let token = req.headers.auth;
      let email = ""
 
      // Checks Token -------------------------
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else { oldEmail = r; return true; }
      })
      if (checkToken == false) { return; }
      
      // Get Preferences -------------------------
      let notiInterval = await userDB.getNotiInterval(email).then((result) => { return result; })
      let notiSound = await userDB.getNotiSound(email).then((result) => { return result; })
      let notiSoundOn = await userDB.getNotiSoundOn(email).then((result) => { return result; })
      let dUsageOn = await userDB.getDataUsageOn(email).then((result) => { return result; })
      let aUsageOn = await userDB.getAppUsageOn(email).then((result) => { return result; })
 
      // Response Codes
      if (notiInterval != false && notiSound != false && notiSoundOn != false) {
        res.status(200).send({
          notifications: { enableSound: notiSoundOn, interval: notiInterval, sound: notiSound, },
          dataUsage: { trackAppUsageStats: aUsageOn, enableWeeklyUsageStats: dUsageOn }
        });
      }
      else { res.status(504).send({ reason: "RETRIEVAL_FAILED", message: "Couldn't retrieve preferences." }); }
 
    });
 
    // Saves the user preferences (incomplete)
    router.put('/prefs', async function (req, res) {
      let token = req.headers.auth;
      let email = ""
 
      // Checks Token -------------------------
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else {  oldEmail = r; return true; }
      })
      if (checkToken == false) { return; }

      // Save user preferences in database -------------------------
      let notiInterval = req.body.data.notifications.interval;
      let notiSound = req.body.data.notifications.sound;
      let notiSoundOn = req.body.data.notifications.enableSound;
      let dUsageOn = req.body.dataUsage.enableWeeklyUsageStats;
      let aUsageOn = eq.body.dataUsage.trackAppUsageStats;
 
      let success1 = await userDB.setNotiInterval(email, notiInterval).then((r) => { return r; })
      let success2 = await userDB.setNotiSound(email, notiSound).then((r) => { return r; })
      let success3 = await userDB.setNotiSoundOn(email, notiSoundOn).then((r) => { return r; })
      let success4 = await userDB.setDataUsageOn(email, dUsageOn).then((r) => { return r; })
      let success5 = await userDB.setAppUsageOn(email, aUsageOn).then((r) => { return r; })

      // Send to frontend
      if (success1 == success2 == success3 == success4 == success5 == true) { 
        res.status(200).send({ reason: "SUCCESS", message: "Saved new user preferences" }); 
      }
      else { res.status(504).send({ reason: "SAVE_FAILED", message: "Couldn't save all preferences." }); }
    });

    // Gets data usage (incomplete)
    router.get('/data', async (req, res) => {
      let token = req.headers.auth;
      let email = ""
 
      // Checks Token -------------------------
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else {  oldEmail = r; return true; }
      })
      if (checkToken == false) { return; }

      // Get Usage Data -------------------------
      let timePeriod = req.body.data.timePeriod;    // TODAY, WEEK, MONTH, ALL
      let dUsage = await userDB.getDataUsage(email, timePeriod).then((r) => { return r; });
      let aUsage = await userDB.getAppUsage(email, timePeriod).then((r) => { return r; });

      // Response Codes (Sends JSONs)
      if (dUsage != false && aUsage != false) { res.status(200).send({ dataUsage: dUsage, appUsage: aUsage }) }
      else { res.status(504).send({ reason: "GET_REQUEST_FAILED", message: "Couldn't get data usage" }) }
    });

    // Updates the data/app usage of user (incomplete)
    router.put('/data', async (req, res) => {
      let token = req.headers.auth;
      let email = ""
 
      // Checks Token
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else { email = r; return true; }
      })
      if (checkToken == false) { return; }

      //------------------------

      // Sets Update Data
      let todayScreenTime = req.body.data.dailyDataUsage.screenTime;
      let todaynumBreaks = req.body.data.dailyDataUsage.numBreaks;
      let todayAppUsage = req.body.data.dailyAppUsage;
      
      let duSuccess = await userDB.setDataUsage(email, todayScreenTime, todaynumBreaks);


      let ausuccess = ""
      // For app usage, use dictionary key-value pairing in a for loop to insert into the database
      // If one fails, success == false



      // Response Codes
      if (dusuccess == true && auSuccess == true) { 
        res.status(200).send({ reason: "SUCCESS", message: "Updated data/app usage" });  
      }
      else { res.status(504).send({ reason: "UPDATE_FAILED", message: "Couldn't update data usage" }) }

    });

    // Get Insights
    router.get('/data/insights', async (req, res) => {
      let token = req.headers.auth;
      let email = ""
 
      // Checks Token
      let checkToken = await api_methods.checkToken(token).then((r) => {
        if (Array.isArray(r)) { res.status(401).send({ reason: r[0], message: r[1] }); return false; }
        else { email = r; return true; }
      })
      if (checkToken == false) { return; }

      // Get Insights
      let insight = await api_methods.generateInsights();

      // Response Codes
      if (insight != false) { 
        res.status(200).send({ header: insight[0], content: insight[1] });  
      }
      else { res.status(504).send({ reason: "RETRIEVE_FAILED", message: "Insights could not be generated." }) }
    });

    //--------------------------
 
    let server = app.listen(3000, function () {
      console.log('Express server listening on port ' + server.address().port);
    });
 
    module.exports = app;
  }()
);

//-------------------------------------

/*
 // Database Connection
 let db = require('./db.js');
 let userDB = new db("localhost", "newuser", "password", "iCare");

 // API Methods
 let apiM = require('./api_methods.js');
 let api_methods = new apiM();


 // WORKS!
 async function testDataUsage() {

  let email = "basic@gmail.com"
  //let duSuccess = await userDB.setDataUsage(email, 270, 5);
  //console.log("Success? " + duSuccess);

  let value = await userDB.getDataUsage(email, "ALL TIME")
  let listofvalues = await api_methods.getStatistics(value).then((res) => { return res; })

  console.log("Average Screen Time: " + listofvalues[0]);
  console.log("Min Screen Time Spend: " + listofvalues[1]);
  console.log("Max Screen Time Spend: " + listofvalues[2]);
  console.log();
  console.log("Average Timer Count: " + listofvalues[3]);
  console.log("Min Timer Count: " + listofvalues[4]);
  console.log("Max Timer Count: " + listofvalues[5]);
 }



async function test() {

  testDataUsage()
  

}


//test()
*/