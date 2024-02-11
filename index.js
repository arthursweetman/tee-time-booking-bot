const puppeteer = require("puppeteer");
const readline = require("readline");

let page = null;
let browser = null;

const username = "";
const password = "";
const date = ""; // Must be in MM-DD-YYYY format
// const desiredTeeTime = "9:50am";
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function teeTimeSelection(teeTimeInfo, desiredTeeTime){
    const times = teeTimeInfo.times;
    return times.indexOf(desiredTeeTime); // Return the position of desiredTeeTime within the teeTimes list
}

rl.question("What is your desired tee time? (H:MMam/pm) ", async function (answer) {
    console.log(`I will book your tee time for ${answer}`);
    const desiredTeeTime = (`${answer}`);
    rl.close();

    var openBrowserTime = new Date(2023, 3, 22, 5, 57, 0, 50); // Saturday 4/22 @ 5:57am
    var now = new Date();
    var countdown = openBrowserTime - now;
    while(countdown > 0 ){
        await delay(1000);
        now = new Date();
        countdown = openBrowserTime - now;
        await console.log(new Date(countdown).toISOString().slice(11,19));
    }

    browser = puppeteer.launch({ 
        // executablePath: "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", 
        headless: false 
    })
        .then( async (browser) => {
    
            // Open a new tab
            page = await browser.newPage();
            page.setViewport({
                width: 1280,
                height: 800,
                isMobile: false,
            });
    
            // Go to Memorial's booking website
            page.goto("https://foreupsoftware.com/booking/20945#/login", {
                waitUntil: "networkidle2",
            });
    
            // Type in username
            await page.waitForSelector('input[name="username"]');
            await delay(2000); // Wait 2 seconds
            await page.type('input[name="username"]', username, {
                delay: 5,
            });
    
            // Type in password
            await page.waitForSelector('input[name="password"]');
            // await delay(2000); // Wait 2 seconds
            await page.type('input[name="password"]', password, {
                delay: 5,
            });
    
            // Click "Sign in button"
            await page.waitForSelector('input[name="login_button"]');
            // await delay(2000); // Wait 2 seconds
            await page.click('input[name="login_button"]');
    
            // Navigate to tee times
            // await page.waitForNavigation(); // Wait for page to load
            await delay(1000); // wait 1 second
            await page.goto("https://foreupsoftware.com/booking/20945#/teetimes", {
                waitUntil: "networkidle2",
            });
    
            ///////////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////// Initiate the following sequence at 6am ///////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////
    
            var openTime = new Date(2023, 3, 22, 5, 59, 30, 50); // Saturday 4/22 @ 5:59:30am
            // var openTime = new Date(2023, 3, 21, 17, 38, 0, 50);
            var now = new Date();
            var millisTill6am = openTime - now;
            while(millisTill6am > 0 ){
                await delay(1000);
                now = new Date();
                millisTill6am = openTime - now;
                await console.log(new Date(millisTill6am).toISOString().slice(11,19));
            }
            
            // Click on tee times for "Resident Adult (4-14 Days) Advance"
            const teeTimeCategories = await page.$$('button[class="btn btn-primary col-md-4 col-xs-12 col-md-offset-4"]');
            await teeTimeCategories[3].click(); // 4th option down is the resident adult 4-14 day advance
    
            // Navigate to the tee time DATE
            await page.waitForSelector('input[id="date-field"]');
            await delay(1000); // Wait 1 second
            await page.evaluate( () => document.getElementById("date-field").value = "") // Clear current text
            await page.type('input[id="date-field"]', date, {
                delay: 5,
            });
            await page.keyboard.press('Enter'); // Press the Enter key
            // Check if the box has the intended date in it
            var checkDateBox = await page.evaluate( () => document.getElementById("date-field").value );
            console.log(checkDateBox);
            // If the date box does not have the intended date in it - reload the page and try again
            while (checkDateBox !== date) {
                await page.reload();
                // Click on tee times for "Resident Adult (4-14 Days) Advance"
                const teeTimeCategories = await page.$$('button[class="btn btn-primary col-md-4 col-xs-12 col-md-offset-4"]');
                await teeTimeCategories[3].click(); // 4th option down is the resident adult 4-14 day advance
        
                // Navigate to the tee time DATE
                await page.waitForSelector('input[id="date-field"]');
                await delay(1000); // Wait 1 second
                await page.evaluate( () => document.getElementById("date-field").value = "") // Clear current text
                await page.type('input[id="date-field"]', date, {
                    delay: 5,
                });
                await page.keyboard.press('Enter'); // Press the Enter key
                // Check if the box has the intended date in it (if it doesn't - reload the page)
                var checkDateBox = await page.evaluate( () => document.getElementById("date-field").value );
                console.log(checkDateBox);
            }
    
            // Obtain info for all available tee times
            await delay(1000);
    
            // Old html tags. Memorial's site was updated on 4/20/2023
            // const teeTimes = await page.$$('h4[class="start"]'); // get a list of all available tee times
            // const groupSizes = await page.$$('span[class="spots"]'); // get a list of all available group sizes
            // const holes = await page.$$('span[class="holes"]'); // get a list of all available holes to play
    
            const teeTimes = await page.$$('div[class="booking-start-time-label"]'); // get a list of all available tee times
    
            var teeTimeInfo = {
                times: [],
                spots: []
            };
            for(let i=0 ; i<teeTimes.length ; i++){
                teeTimeInfo.times[i] = await( await teeTimes[i].getProperty('textContent')).jsonValue();
                // spots: await( await groupSizes[i].getProperty('textContent')).jsonValue(), 
                // holes: await( await holes[i].getProperty('textContent')).jsonValue()
            };
            await console.log(teeTimeInfo);
            
            // Click on the tee time I am looking for (9:30am)
            const tiles = await page.$$('div[class="time time-tile"]');
            const listPosition = teeTimeSelection(teeTimeInfo, desiredTeeTime);
            console.log(listPosition);
            await tiles[listPosition].click();
    
            // The tee time is now reserved for 5 minutes...
            // Check out manually
    
        })
        .catch((error) => {
            console.log(error)
        })

})



