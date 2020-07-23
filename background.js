window.state = {
    status: false
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.name === "setXeyeStatus") {
        window.state.status = request.status;
        return;
    }

    if (request.name == "getXeyeStatus") {
        sendResponse({ status: window.state.status })
    }
});