const puppeteer = require("puppeteer");

async function bookTeeTime(username, password, date, desiredTeeTime) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Login
    await login(page, username, password);

    // Navigate to tee time page
    await navigateToTeeTimePage(page, date);

    // Select category
    await selectCategory(page, "Resident Adult (4-14 Days) Advance");

    // Select desired tee time
    await selectTeeTime(page, desiredTeeTime);

    // Checkout manually (not automated)
    console.log("Tee time selected! Please complete checkout manually.");

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function login(page, username, password) {
  await page.goto("https://foreupsoftware.com/booking/20945#/login");

  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', username);

  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', password);

  await page.click('input[name="login_button"]');
}

async function navigateToTeeTimePage(page, date) {
  await page.waitForNavigation(); // Wait for login to complete

  await page.goto("https://foreupsoftware.com/booking/20945#/teetimes");

  await page.waitForSelector('input[id="date-field"]');
  await page.evaluate(() => document.getElementById("date-field").value = "");
  await page.type('input[id="date-field"]', date);
  await page.keyboard.press('Enter');

  await page.waitForSelector('.booking-start-time-label'); // Wait for tee times to load
}

async function selectCategory(page, categoryName) {
  const categories = await page.$$('button[class="btn btn-primary col-md-4 col-xs-12 col-md-offset-4"]');
  const desiredCategory = categories.find(cat => cat.evaluate(el => el.textContent === categoryName));

  if (desiredCategory) {
    await desiredCategory.click();
  } else {
    throw new Error(`Category "${categoryName}" not found.`);
  }
}

async function selectTeeTime(page, desiredTeeTime) {
  const teeTimes = await page.$$('.booking-start-time-label');
  const desiredTime = teeTimes.find(time => time.evaluate(el => el.textContent === desiredTeeTime));

  if (desiredTime) {
    await desiredTime.click();
  } else {
    throw new Error(`Tee time "${desiredTeeTime}" not found.`);
  }
}

// Prompt user for input and start booking

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("Username: ", username => {
    readline.question("Password: ", password => {
        readline.question("Date (MM-DD-YYYY): ", date => {
            readline.question("Desired Tee Time (H:MMam/pm): ", desiredTeeTime => {
                bookTeeTime(username, password, date, desiredTeeTime);
                readline.close(); // Close the interface after all questions are answered
            });
        });
    });
});
