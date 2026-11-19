const TARGET_URL = /^https:\/\/alabsms\.bulsu\.edu\.ph\/grades.*$/;

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab || !TARGET_URL.test(tab.url)) return;

  try {
    await browser.tabs.sendMessage(tabId, null); // Idk just to bridge background service to the content script so it re-activates
    console.log("Sent message to content script!");
  } catch (err) {
    console.error("Failed to reach content script:", err);
  }
});
