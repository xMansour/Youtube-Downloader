const { addAbortSignal } = require("stream");

window.addEventListener("DOMContentLoaded", () => {
    const fs = require("fs");
    const ytdl = require("ytdl-core");
    const { ipcRenderer } = require("electron");
    const path = require("path");
    const videoUrl = document.querySelector("#videoUrl");

    const formatTable = document.querySelector("#formatTable");
    const formatsTableBody = document.querySelector("#formatListBody");
    const formatTablePlaylist = document.querySelector("#formatTablePlaylist");
    const formatListBodyPlaylist = document.querySelector(
        "#formatListBodyPlaylist"
    );

    const btnSearch = document.querySelector("#btnSearch");
    const loadingDiv = document.querySelector("#loadingDiv");
    const btnSearchText = document.querySelector("#btnSearchText");
    const progressBar = document.querySelector("#progressBar");
    const progressBarContainer = document.querySelector("#progressBarContainer");
    const playlistCheckBox = document.querySelector("#playlistCheckBox");
    const playlistNumbersCheckBox = document.querySelector("#playlistNumbersCheckBox");
    const seperatorLine = document.querySelector("#seperatorLine");
    const progressBarWrapper = document.querySelector("#progressBarWrapper");

    const ytpl = require("ytpl");

    playlistCheckBox.addEventListener("click", (event) => {
        playlistNumbersCheckBox.toggleAttribute("disabled");
    });

    const downloadVideo = async (videoLink) => {
        await ytdl.getInfo(videoLink).then((data) => {
            btnSearchText.classList.toggle("d-none");
            loadingDiv.classList.toggle("d-none");
            formatTable.classList.toggle("d-none");
            formatsTableBody.innerHTML = "";
            btnSearch.disabled = false;
            let counter = 1;
            Object.keys(data.formats).forEach((key) => {
                if (data.formats[key].hasAudio && data.formats[key].hasVideo) {
                    const tr = formatsTableBody.insertRow();
                    const idLabel = tr.insertCell();
                    idLabel.innerText = counter++;
                    const thumbnailLabel = tr.insertCell();
                    const thumbnailImg = document.createElement("img");
                    thumbnailImg.src =
                        data.videoDetails.thumbnails[
                            data.videoDetails.thumbnails.length - 1
                        ].url;
                    thumbnailImg.width = 100;
                    thumbnailLabel.appendChild(thumbnailImg);
                    const qualityLabel = tr.insertCell();
                    qualityLabel.innerText = data.formats[key].qualityLabel;
                    const downloadLabel = tr.insertCell();
                    const btnDownload = document.createElement("button");
                    btnDownload.type = "button";
                    btnDownload.innerText = "Download";
                    btnDownload.classList.add("btn", "btn-primary");
                    downloadLabel.appendChild(btnDownload);

                    console.log(data);
                    //console.log(data.formats[key]);
                    //console.log(data.formats[key].contentLength);

                    btnDownload.addEventListener("click", (event) => {
                        btnDownload.innerText = "Loading...";
                        btnDownload.disabled = true;
                        console.log(videoLink);
                        const fileName =
                            data.videoDetails.title +
                            " " +
                            data.formats[key].qualityLabel +
                            ".mp4";
                        const video = ytdl(videoLink, {
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
                            seperatorLine.classList.toggle("d-none");
                            progressBarWrapper.classList.toggle("d-none");
                        });
                        video.on("progress", (chunkLength, downloaded, total) => {
                            const percent = downloaded / total;
                            const downloadedMinutes = (Date.now() - starttime) / 1000;
                            const estimatedDownloadTime =
                                downloadedMinutes / percent - downloadedMinutes;
                            progressBarContainer.classList.remove("d-none");
                            progressBar.style.width = percent.toFixed(2) * 100 + "%";
                            progressBar.innerText = percent.toFixed(2) * 100 + "%";
                        });
                        video.on("end", () => {
                            progressBar.classList.add("bg-success");
                            btnDownload.innerText = "Downloaded";
                            btnDownload.disabled = true;
                            ipcRenderer.invoke("show-notification", fileName);
                            return data.formats[key].itag;
                        });
                    });
                }
            });
        });
    };

    const downloadPlayListVideo = async (videoLink, playlistTitle, counter, progressLabel) => {
        await ytdl.getInfo(videoLink).then((data) => {
            console.log(data);
            let fileName =
                data.videoDetails.title +
                " " +
                data.formats.filter(format => format.itag === 22)[0].qualityLabel +
                ".mp4";
            if (playlistNumbersCheckBox.checked) {
                fileName = counter + ". " + fileName;
            }
            const downloadDir = path.join(process.cwd(), path.join("downloads"));
            const playlistDir = path.join(process.cwd(), path.join("downloads", playlistTitle));
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir);
            }
            if (!fs.existsSync(playlistDir)) {
                fs.mkdirSync(playlistDir);
            }
            const video = ytdl(videoLink, {
                filter: function (format) {
                    return format.itag === 22;
                },
            });

            let starttime;
            video.pipe(
                fs.createWriteStream(
                    path.join(process.cwd(), path.join("downloads", playlistTitle, fileName))
                )
            );

            video.once("response", () => {
                starttime = Date.now();
            });
            video.on("progress", (chunkLength, downloaded, total) => {
                const percent = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000;
                const estimatedDownloadTime =
                    downloadedMinutes / percent - downloadedMinutes;
                progressLabel.innerText = percent.toFixed(2) * 100 + "%";
            });
            video.on("end", () => {
                ipcRenderer.invoke("show-notification", fileName);
            });

        });
    }
    btnSearch.addEventListener("click", async (event) => {
        btnSearchText.classList.toggle("d-none");
        loadingDiv.classList.toggle("d-none");
        btnSearchText.classList.add("d-none");
        btnSearch.disabled = true;
        if (playlistCheckBox.checked) {
            try {
                let counter = 0;
                formatTablePlaylist.classList.toggle("d-none");
                formatListBodyPlaylist.innerHTML = "";
                const search = await ytpl(videoUrl.value);
                Object.keys(search.items).forEach(async (key) => {
                    const tr = formatListBodyPlaylist.insertRow();
                    const idLabel = tr.insertCell();
                    idLabel.innerText = ++counter;

                    const thumbnailLabel = tr.insertCell();
                    const thumbnailImg = document.createElement("img");
                    thumbnailImg.src = search.items[key].bestThumbnail.url;
                    thumbnailImg.width = 100;
                    thumbnailLabel.appendChild(thumbnailImg);

                    const titleLabel = tr.insertCell();
                    titleLabel.innerText = search.items[key].title;

                    const durationLabel = tr.insertCell();
                    durationLabel.innerText = search.items[key].duration;

                    const progressLabel = tr.insertCell();
                    progressLabel.innerText = "0%";
                    await downloadPlayListVideo(search.items[key].shortUrl, search.title, counter, progressLabel);

                    /*await ytdl.getInfo(search.items[key].shortUrl).then((data) => {
                        //console.log(data);

                        let fileName =
                            data.videoDetails.title +
                            " " +
                            data.formats.filter(format => format.itag === 22)[0].qualityLabel +
                            ".mp4";
                        if (playlistNumbersCheckBox.checked) {
                            fileName = counter + ". " + fileName;
                        }
                        const downloadDir = path.join(process.cwd(), path.join("downloads"));
                        const playlistDir = path.join(process.cwd(), path.join("downloads", search.title));
                        if (!fs.existsSync(downloadDir)) {
                            fs.mkdirSync(downloadDir);
                        }
                        if (!fs.existsSync(playlistDir)) {
                            fs.mkdirSync(playlistDir);
                        }
                        const video = ytdl(search.items[key].shortUrl, {
                            filter: function (format) {
                                return format.itag === 22;
                            },
                        });

                        let starttime;
                        video.pipe(
                            fs.createWriteStream(
                                path.join(process.cwd(), path.join("downloads", search.title, fileName))
                            )
                        );

                        video.once("response", () => {
                            starttime = Date.now();
                        });
                        video.on("progress", (chunkLength, downloaded, total) => {
                            const percent = downloaded / total;
                            const downloadedMinutes = (Date.now() - starttime) / 1000;
                            const estimatedDownloadTime =
                                downloadedMinutes / percent - downloadedMinutes;
                            progressLabel.innerText = percent.toFixed(2) * 100 + "%";
                        });
                        video.on("end", () => {
                            ipcRenderer.invoke("show-notification", fileName);
                        });

                    });*/
                });

            } catch (error) {
                console.log(error);
                btnSearchText.classList.toggle("d-none");
                loadingDiv.classList.toggle("d-none");
                btnSearch.disabled = false;
                return;
            }
        } else {
            await downloadVideo(videoUrl.value);
        }
    });
});
