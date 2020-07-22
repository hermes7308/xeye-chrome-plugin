// AI core start
// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image
// the link to your model provided by Teachable Machine export panel
const BLIND_IMAGE = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
let model, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = chrome.extension.getURL('/model.json');
    const metadataURL = chrome.extension.getURL('/metadata.json');
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    predictImg();

    const playId = setInterval(function () {
        predictImg();
    }, 1000);
}

// run the webcam image through the image model
async function predictPornImageByData(img) {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(img, false);
    const pornImage = prediction[0];
    const normalImage = prediction[1];

    if (pornImage.probability > normalImage.probability) {
        img.src = BLIND_IMAGE;
        return;
    }
}

// API call
function predictPornImageByUrl(img) {
    var data = JSON.stringify({
        url: img.src
    });

    $.ajax({
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        url: "https://dev.pandous.com/xeye/predict/url",
        data: data,
        responseType: 'application/json',
        xhrFields: {
            withCredentials: false
        },
        headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'application/json'
        },
        success: function (response, status, xhr) {
            if (response.status !== "SUCCESS") {
                return;
            }

            var data = JSON.parse(response.data.replace(/'/g, "\""));
            if (data.PORN_IMAGE > data.NORMAL_IMAGE) {
                img.src = BLIND_IMAGE;
                return;
            }
        }
    });
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function predictImg() {
    let imgTagList = document.documentElement.getElementsByTagName("img");
    for (let img of imgTagList) {
        if (img.src === BLIND_IMAGE) {
            continue;
        }

        if (img.dataset.isPredicted === "Y") {
            continue;
        }

        if (img.src == null) {
            continue;
        }

        if (validURL(img.src)) {
            img.dataset.isPredicted = "Y";
            predictPornImageByUrl(img);
        } else if (img.src.startsWith("data:image")) {
            img.dataset.isPredicted = "Y";
            predictPornImageByData(img);
        }

    }
}

// Start
init();