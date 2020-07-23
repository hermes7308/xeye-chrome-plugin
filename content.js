$(document).ready(function () {
    const BLIND_IMAGE = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
    // Start - ENTRIPOINT
    initXeye();

    // AI core start
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image
    // the link to your model provided by Teachable Machine export panel
    let model;
    // Load the image model and setup the webcam
    async function initXeye() {
        console.log("Xeye started");

        const modelURL = chrome.extension.getURL('/model.json');
        const metadataURL = chrome.extension.getURL('/metadata.json');
        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);

        startXeye();
    }

    async function startXeye() {
        let xeyeRunCount = 0;

        while (true) {
            chrome.runtime.sendMessage({
                name: "getXeyeStatus"
            }, ({ status: status }) => {
                if (status) {
                    console.log("Xeye run count: " + ++xeyeRunCount);

                    let imgTagList = document.documentElement.getElementsByTagName("img");
                    for (let img of imgTagList) {
                        if (img.dataset.inspectionYn != null) {
                            continue;
                        }

                        if (img.src == BLIND_IMAGE) {
                            continue;
                        }

                        if (img.src.startsWith("data:image")) {
                            predictPornImageByData(img);
                            continue;
                        } else {
                            preditPornImgByUrl(img);
                            continue;
                        }
                    }
                }
            });
            await sleep(1000);
        }
    }

    // run to convert image url to image data
    // and run precitor porn image data.
    async function preditPornImgByUrl(img) {
        let url = img.dataset.src;
        if (url == null) {
            url = img.src;
        }

        fetch(url)
            .then(r => r.blob())
            .then(blob => {
                var reader = new FileReader();
                reader.onload = function () {
                    img.dataset.src = reader.result;
                    img.src = img.dataset.src;
                    predictPornImageByData(img);
                };
                reader.readAsDataURL(blob);
            });
    }

    // run to predict porn rate using image data
    let dataFilterWorkingCount = 0;
    async function predictPornImageByData(img) {
        console.log("Data filter working count: " + ++dataFilterWorkingCount);

        if (img.dataset.inspectCount == null) {
            img.dataset.inspectCount = 1;
        }

        img.dataset.inspectCount++;
        if (img.dataset.inspectCount > 10) {
            img.dataset.inspectionYn = "Y";
        }

        try {
            // predict can take in an image, video or canvas html element
            const prediction = await model.predict(img, false);
            const pornImage = prediction[0];
            const normalImage = prediction[1];

            if (pornImage.probability > normalImage.probability) {
                img.src = BLIND_IMAGE;
                img.dataset.src = BLIND_IMAGE;
                img.dataset.inspectionYn = "Y";
                return;
            }
        } catch (error) {
            // console.log(error);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});