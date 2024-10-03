chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "customMenuItem",
    title: "Save Link",
    contexts: ["all"], // Show it on all pages
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "customMenuItem") {
    let site = tab.url;
    let tag = tab.title;

    saveTabLink(tag, site);
  }
});

function saveTabLink(tag, site) {
  // Ensure chrome.storage is accessible
  if (chrome && chrome.storage && chrome.storage.local) {
    // Retrieve existing sites from chrome.storage.local
    chrome.storage.local.get({ sites: [] }, (result) => {
      let site_data = result.sites || [];

      // Check if the tag already exists
      let tagExists = site_data.some(([savedTag]) => savedTag === tag);

      if (!tagExists) {
        // Add the new site (tag, site) to the site_data array
        site_data.push([tag, site]);

        // Save updated sites back to chrome.storage.local
        chrome.storage.local.set({ sites: site_data }, () => {
          console.log("Saved tag and site:", tag, site);
          // Optionally, notify the user about the successful save
          chrome.notifications.create({
            type: "basic",
            iconUrl: "/icon/icon-128.png", // Make sure to have an icon
            title: "Link Saved",
            message: `Saved: ${tag} - ${site}`,
            priority: 1,
          });
        });
      } else {
        // Notify the user about the duplicate tag
        chrome.notifications.create({
          type: "basic",
          iconUrl: "/icon/icon-128.png",
          title: "Tag Exists",
          message: `The tag "${tag}" already exists. Please use a unique tag.`,
          priority: 1,
        });
      }
    });
  } else {
    console.error("chrome.storage.local is not accessible.");
  }
}

function showSavedLinks() {
  chrome.storage.local.get({ sites: [] }, (result) => {
    const site_data = result.sites || [];

    if (site_data.length === 0) {
      console.log("No links saved.");
      return;
    }

    console.log("Saved Links:");
    site_data.forEach(([tag, site]) => {
      console.log(`Tag: ${tag}, Site: ${site}`);
    });
  });
}

// You can call this function whenever you want to check the saved links
showSavedLinks();
