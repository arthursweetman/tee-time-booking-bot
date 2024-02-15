const puppeteer = require("puppeteer");

async function bookTeeTime(username, password, date, desiredTeeTime) {
  try {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Login
    await login(page, username, password);

    // Navigate to tee time page
    await navigateToTeeTimePage(page, date);

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
  await selectCategory(page, "Resident Adult (4-14 Days) Advance");

  const windowWidth = await page.viewport().width;

  if (windowWidth < 992) {
    // Actions for small screens
    await page.waitForSelector('select#date-menu', { visible: true }).then(() => {
      // Use page.evaluate to access and select the desired option
      return page.evaluate((date) => {
        const selectElement = document.querySelector('select#date-menu');
        const desiredOption = selectElement.querySelector(`option[value="${date}"]`);
    
        if (desiredOption) {
          desiredOption.selected = true; // Select the option
          return true; // Indicate successful selection
        } else {
          return false; // Indicate option not found
        }
      }, date);
    }).then((selectionResult) => {
      if (selectionResult) {
        console.log(`Successfully selected option with value "${date}"`);
      } else {
        console.error(`Option with value "${date}" not found in the select element.`);
      }
    });
  } else {
    // Actions for large screens
    await page.waitForSelector('input[id="date-field"]');
    await page.evaluate(() => document.getElementById("date-field").value = "");
    await page.type('input[id="date-field"]', date);
    await page.keyboard.press('Enter');
  }
}

async function selectCategory(page, categoryName) {
  const categories = await page.$$('button[class="btn btn-primary col-md-4 col-xs-12 col-md-offset-4"]');
  const desiredCategory = categories[3]

  if (desiredCategory) {
    await desiredCategory.click();
  } else {
    throw new Error(`Category "${categoryName}" not found.`);
  }
}

async function selectTeeTime(page, desiredTeeTime) {
  try{
    await page.waitForSelector('div.booking-start-time-label'); // Wait for tee times to load
    const divElements = await page.$$('div.booking-start-time-label'); // Get all matching divs
    const matchingDiv = divElements.find((div) => 
      div.evaluate((el, desiredTeeTime) => el.textContent === desiredTeeTime, desiredTeeTime)
    ); // Find the div with matching text
  
    if (matchingDiv) {
      await matchingDiv.click(); // Click the matching div
      console.log('Clicked on div with text:', desiredTeeTime);
    } else {
      console.error('Div with text "' + desiredTeeTime + '" not found.');
    }
  } catch (error) {
    console.error('Error clicking div:', error);
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
