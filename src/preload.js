window.addEventListener("DOMContentLoaded", () => {
    const fs = require("fs");
    const ytdl = require("ytdl-core");
    const { ipcRenderer } = require("electron");
    const path = require("path");
    const videoUrl = document.querySelector("#videoUrl");
    const formatsTable = document.querySelector("#formatTable");
    const formatsTableBody = document.querySelector("#formatListBody");
    const btnSearch = document.querySelector("#btnSearch");
    const loadingDiv = document.querySelector("#loadingDiv");
    const btnSearchText = document.querySelector("#btnSearchText");
    const progressBar = document.querySelector("#progressBar");
    const progressBarContainer = document.querySelector("#progressBarContainer");
    const progressLabel = document.querySelector("#progressLabel");
    const playlistCheckBox = document.querySelector("#playlistCheckBox");
    const playlistNumbering = document.querySelector("#playlistNumbering");

    const ytpl = require("ytpl");

    playlistCheckBox.addEventListener("click", (event) => {
        playlistNumbering.toggleAttribute("disabled");
    });

    btnSearch.addEventListener("click", async (event) => {
        if (playlistCheckBox.checked) {
            const search = await ytpl(videoUrl.value);
            console.log(search);
            Object.keys(search.items).forEach((key) => {
                console.log(search.items[key].url);
            });
        }

        btnSearchText.classList.toggle("visually-hidden");
        loadingDiv.classList.toggle("visually-hidden");
        btnSearch.disabled = true;
        await ytdl.getInfo(videoUrl.value).then((data) => {
            btnSearchText.classList.toggle("visually-hidden");
            loadingDiv.classList.toggle("visually-hidden");
            //formatsTable.classList.remove("visually-hidden");
            formatsTableBody.innerHTML = "";
            btnSearch.disabled = false;
            let counter = 1;
            Object.keys(data.formats).forEach((key) => {
                if (data.formats[key].hasAudio && data.formats[key].hasVideo) {
                    const tr = formatsTableBody.insertRow();

                    const idLabel = tr.insertCell();
                    idLabel.innerText = counter++;

                    const qualityLabel = tr.insertCell();
                    qualityLabel.innerText = data.formats[key].qualityLabel;

                    /*const durationLabel = tr.insertCell();
                              durationLabel.innerText =
                                  (data.formats[key].approxDurationMs / (1000 * 60)).toFixed(2) +
                                  " Mins";
          
                              const tagLabel = tr.insertCell();
                              tagLabel.innerText = data.formats[key].itag;*/

                    const downloadLabel = tr.insertCell();
                    const btnDownload = document.createElement("button");
                    btnDownload.type = "button";
                    btnDownload.innerText = "Download";
                    btnDownload.classList.add("btn", "btn-primary");
                    downloadLabel.appendChild(btnDownload);
                    //console.log(data);
                    //console.log(data.formats[key]);
                    //console.log(data.formats[key].contentLength);

                    btnDownload.addEventListener("click", (event) => {
                        btnDownload.innerText = "Loading...";
                        btnDownload.disabled = true;
                        const fileName =
                            data.videoDetails.title +
                            " " +
                            data.formats[key].qualityLabel +
                            ".mp4";
                        /*let starttime;
                                                ytdl(videoUrl.value, data.formats[key].itag)
                                                    .pipe(fs.createWriteStream(data.videoDetails.title))
                                                    .once("response", () => {
                                                        starttime = Date.now();
                                                    })
                                                    .on('progress', (chunkLength, downloaded, total) => {
                                                        const percent = downloaded / total;
                                                        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                                                        const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                        
                                                        console.log(percent);
                        
                                                        console.log(estimatedDownloadTime);
                                                    })*/

                        const video = ytdl(videoUrl.value, {
                            filter: function (format) {
                                return format.itag === Number(data.formats[key].itag);
                            },
                        });
                        let starttime;
                        video.pipe(
                            fs.createWriteStream(
                                path.join(process.cwd(), path.join("downloads", fileName))
                            )
                        );
                        video.once("response", () => {
                            starttime = Date.now();
                            btnDownload.innerText = "Downloading...";
                        });
                        video.on("progress", (chunkLength, downloaded, total) => {
                            const percent = downloaded / total;
                            const downloadedMinutes = (Date.now() - starttime) / 1000;
                            const estimatedDownloadTime =
                                downloadedMinutes / percent - downloadedMinutes;
                            progressBarContainer.classList.remove("visually-hidden");
                            progressBar.style.width = percent.toFixed(2) * 100 + "%";
                            progressBar.innerText = percent.toFixed(2) * 100 + "%";
                        });
                        video.on("end", () => {
                            progressBar.classList.add("bg-success");
                            btnDownload.innerText = "Downloaded";
                            btnDownload.disabled = true;
                            ipcRenderer.invoke("show-notification", fileName);
                        });
                    });
                }
            });
        });
    });
});
