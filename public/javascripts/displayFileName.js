var inputFiles = document.getElementById("image");

inputFiles.addEventListener("change", function (event) {
    if (!event.target.files) return;
    previewMultiple(event);
});

function previewMultiple(event) {
    const formFile = document.querySelector("#formFile");
    formFile.innerHTML = "";
    console.log("inputFiles.files: ", inputFiles.files);

    let copyFiles = inputFiles.files;
    console.log("copyFiles: ", copyFiles);

    const numOfFiles = copyFiles.length;
    console.log("numOfFiles: ", numOfFiles);

    for (let i = 0; i < numOfFiles; i++) {
        let urls = URL.createObjectURL(copyFiles[i]);
        let fileName = copyFiles[i].name;
        formFile.innerHTML += `
        <div class="img-wrap">
            <img src="${urls}" alt="">
            <span class="close"  name="deleteImages[]" value=${fileName}">&times;</span>
        </div>`;
    }

    // testingRemove([2], [1, 2, 3, 4, 5, 6]);

    removePreview(copyFiles);
    // console.log("removeInputImage(copyFiles): ", removeInputImage(copyFiles));
}

function removePreview(files) {
    let fileArray = Object.entries(files);
    let fileBuffer = new DataTransfer();
    let fileObj = {};
    console.log("fileBuffer: ", typeof fileBuffer);

    let indexToRemove = 0;
    const removeBtns = document.querySelectorAll(".img-wrap .close");
    for (let i = removeBtns.length - 1; i >= 0; i--) {
        removeBtns[i].addEventListener("click", function () {
            fileBuffer.clearData();
            // indexToRemove.push(i);
            indexToRemove = i;

            fileArray = removeImageInput(indexToRemove, fileArray);
            inputFiles.files = convertToFileInput(files, fileArray, fileBuffer);

            removeBtns[i].parentNode.remove();

            // fileObj = Object.fromEntries(fileArray);

            // for (let f in files) {
            //     if (f in fileObj) {
            //         fileBuffer.items.add(files[f]);
            //     }
            // }

            // console.log("fileBuffer:", fileBuffer);

            // inputFiles.files = fileBuffer.files;
            // console.log("inputFiles: ", inputFiles.files);
        });
    }
}

const removeImageInput = (indexToRemove, fileArray) => {
    return fileArray.filter((elem) => elem[0] != indexToRemove.toString());
};

const convertToFileInput = (files, fileArray, fileBuff) => {
    fileObj = Object.fromEntries(fileArray);
    for (let f in files) {
        if (f in fileObj) {
            fileBuff.items.add(files[f]);
        }
    }
    return fileBuff.files;
};
