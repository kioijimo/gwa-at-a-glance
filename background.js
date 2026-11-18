const TARGET_URL = /^https:\/\/alabsms\.bulsu\.edu\.ph\/grades.*$/;

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab || !TARGET_URL.test(tab.url)) return;

  const parentSelector = "#app main > div";
  const cardsBlockSelector = `${parentSelector} header ~ div > div:first-child`;
  const semesterBlockSelector = 'section[aria-label$="Semester"]';
  const semestersBlockSelector = `${parentSelector} div > div:has(> ${semesterBlockSelector})`;

  try {
    await browser.tabs.sendMessage(tabId, {
      cardsBlockSelector,
      semesterBlockSelector,
      semestersBlockSelector,
    });
    console.log("Sent message to content script!");
  } catch (err) {
    console.error("Failed to reach content script:", err);
  }
});
