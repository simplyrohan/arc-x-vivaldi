import { defineCustomElements } from "ionicons/loader";
defineCustomElements(window, {
  resourcesUrl: "./dist/",
});

import van from "vanjs-core";

import { getFavicon, search } from "./utils.js";

const { span, button, img, webview } = van.tags;
const {
  tags: { "ion-icon": ionIcon },
} = van;

var tabs = [];
var selectedTab = null;

// Side bar
const sideBar = document.querySelector("header");

const closeSideBar = document.getElementById("close-sidebar");
// Controls
const pageBack = document.getElementById("page-back");
const pageForward = document.getElementById("page-forward");
const pageRefresh = document.getElementById("page-refresh");

// URL Bar
const urlForm = document.getElementById("url-form");
const urlInput = document.getElementById("url-input");

// New Tab Button
const newTabButton = document.getElementById("new-tab");

// Tab List
const tabList = document.getElementById("tab-list");

// Tab View
const tabView = document.getElementById("tab-view");

// Event Listeners
window.onmousemove = (e) => {
  if (e.clientX < 50) {
    sideBar.classList.add("hovered");
  } else {
    sideBar.classList.remove("hovered");
  }
};

closeSideBar.onclick = () => {
  sideBar.classList.toggle("closed");
  tabView.classList.toggle("full-width");
};
pageBack.onclick = () => {
  chrome.tabs.goBack(selectedTab.chrome.id);
};

pageForward.onclick = () => {
  chrome.tabs.goForward(selectedTab.chrome.id);
};

pageRefresh.onclick = () => {
  chrome.tabs.reload(selectedTab.chrome.id);
};

newTabButton.onclick = () => {
  addTab("google.com");
};

urlForm.onsubmit = async (e) => {
  e.preventDefault();
  selectedTab.view.src = search(urlInput.value);
};

// Objects
const tabItem = (tab) => {
  return button(
    {
      onclick: (e) => {
        if (
          !e.target.classList.contains("close") &&
          !e.target.classList.contains("close-icon")
        ) {
          focusTab(tab);
        }
      },
      class: "tab-item hover-focus1",
    },
    img({ src: getFavicon(tab.url) }),
    span(tab.title),

    button(
      {
        onclick: () => {
          tabs.splice(tabs.indexOf(tab), 1);

          if (tab == selectedTab) {
            selectedTab = null;
            if (tabs.length) focusTab(tabs[tabs.length - 1]);
            else
              setTimeout(() => {
                addTab("google.com");
              }, 100);
          }

          tabView.removeChild(tab.view);
          tab.view.remove();

          tab.item.style.animation =
            "slide-out-from-bottom 0.1s cubic-bezier(0.12, 0.64, 1, 1)";
          setTimeout(() => {
            tabList.removeChild(tab.item);
            tab.item.remove();
          }, 75);
        },
        class: "close",
      },
      ionIcon({ name: "close", class: "close-icon" })
    )
  );
};

const tabFrame = (tab) => {
  let wv = webview({
    class: "tab-frame",
    // src: tab.url,
    tab_id: tab.chrome.id,
    sandbox: "allow-scripts allow-forms allow-same-origin",
  });

  wv.onloadstop = async () => {
    // let tab_chrome = (await chrome.tabs.query({})).filter(e=>e.id === tab.chrome.id)[0]
    let tab_chrome = await chrome.tabs.get(tab.chrome.id)
    tab.title = tab_chrome.title;
    console.log(tab_chrome);
    console.log(tab_chrome.title);
    tab.url = tab_chrome.url;
    tabList.children[tabs.indexOf(tab)].children[1].textContent = tab_chrome.title;
    tabList.children[tabs.indexOf(tab)].children[0].src = getFavicon(
      tab_chrome.url
    );

    // Update URL bar
    if (tab == selectedTab) {
      urlInput.value = tab.chrome.pendingUrl;
    }
  };

  return wv;
};

function focusTab(tab) {
  if (selectedTab) {
    selectedTab.view.style.display = "none";
    tabList.children[tabs.indexOf(selectedTab)].classList.remove("selectedTab");
  }
  selectedTab = tab;
  tab.view.style.display = "block";

  // Update URL bar
  urlInput.value = tab.url;

  tabList.children[tabs.indexOf(tab)].classList.add("selectedTab");
}

async function addTab(link) {
  let url;

  url = search(link);

  let tab = {}; // We aren't populating this because it needs to be passed into the tabFrame and tabItem functions

  tab.chrome = await chrome.tabs.create({ url: url });
  tab.title = "Loading...";
  tab.url = url;
  tab.icon = null;
  tab.view = tabFrame(tab);
  tab.item = tabItem(tab);

  // Fix links such as the Gmail link in the Google search page
  tab.view.addEventListener("load", () => {
    let links = tab.view.contentWindow.document.querySelectorAll("a");
    links.forEach((element) => {
      element.addEventListener("click", (event) => {
        let isTargetTop = event.target.target === "_top";
        if (isTargetTop) {
          event.preventDefault();
          addTab(event.target.href);
        }
      });
    });
  });

  tabs.push(tab);

  tabList.appendChild(tab.item);

  tabView.appendChild(tab.view);
  focusTab(tab);
}

addTab("google.com");
