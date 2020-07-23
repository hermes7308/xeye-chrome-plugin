// https://www.youtube.com/watch?v=Ipa58NVGs_c&t=525s
// chrome.runtime.sendMessage 
// sends a message to all open extension pages (i.e. background, popup, etc.)
// chrome.tabs.sendMessage 
// sends a message to all content scripts from the extension in a given tab (possibly filtered by frame ID)

document.addEventListener("DOMContentLoaded", function () {
    // toggle status input event listener
    document.querySelector("input").addEventListener("change", onchange, false);
    function onchange() {
        let checked = document.querySelector("input").checked;
        setStatusText(checked);
        chrome.tabs.query({ currentWindow: true, active: true },
            function (tabs) {
                chrome.runtime.sendMessage({
                    "name": "setXeyeStatus",
                    "status": checked
                })
            });
    }

    // current xeye active status
    const bg = chrome.extension.getBackgroundPage();
    document.querySelector("input").checked = bg.state.status;
    setStatusText(document.querySelector("input").checked);

    function setStatusText(checked) {
        if (checked) {
            document.getElementById("xeye-status-text").innerText = "ON";
        } else {
            document.getElementById("xeye-status-text").innerText = "OFF";
        }
    }

}, false);