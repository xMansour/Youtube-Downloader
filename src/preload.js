const { addAbortSignal } = require("stream");
const fs = require("fs");
const ytdl = require("ytdl-core");
const { ipcRenderer } = require("electron");
const path = require("path");
const ytpl = require("ytpl");

window.addEventListener("DOMContentLoaded", () => {
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
  const playlistNumbersCheckBox = document.querySelector(
    "#playlistNumbersCheckBox"
  );
  const playlistNumbersCheckBoxContainer = document.querySelector(
    "#playlistNumbersCheckBoxContainer"
  );
  const seperatorLine = document.querySelector("#seperatorLine");
  const progressBarWrapper = document.querySelector("#progressBarWrapper");
  const qualitySwitch = document.querySelector("#qualitySwitch");
  const qualitySwitchContainer = document.querySelector(
    "#qualitySwitchContainer"
  );
  const qualitySwitchLabel = document.querySelector("#qualitySwitchLabel");
  const downloadDir = path.join(process.cwd(), path.join("downloads"));
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }
  playlistCheckBox.addEventListener("click", (event) => {
    //playlistNumbersCheckBox.toggleAttribute("disabled");
    qualitySwitchContainer.classList.toggle("d-none");
    playlistNumbersCheckBoxContainer.classList.toggle("d-none");
  });

  qualitySwitch.addEventListener("click", () => {
    qualitySwitch.checked
      ? (qualitySwitchLabel.innerText = "720p")
      : (qualitySwitchLabel.innerText = "360p");
  });
  const downloadVideo = async (videoLink) => {
    try {
      await ytdl.getInfo(videoLink).then((data) => {
        btnSearchText.classList.toggle("d-none");
        loadingDiv.classList.toggle("d-none");
        formatTable.classList.remove("d-none");
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
                seperatorLine.classList.remove("d-none");
                progressBarWrapper.classList.remove("d-none");
              });
              video.on("progress", (chunkLength, downloaded, total) => {
                const percent = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                const estimatedDownloadTime =
                  downloadedMinutes / percent - downloadedMinutes;
                progressBar.style.width = (percent * 100).toFixed(2) + "%";
                progressBar.innerText = (percent * 100).toFixed(2) + "%";
                console.log(estimatedDownloadTime);
                console.log(
                  `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(
                    total /
                    1024 /
                    1024
                  ).toFixed(2)}MB)\n`
                );
                console.log(
                  `Running for: ${downloadedMinutes.toFixed(2)}minutes`
                );
                console.log(
                  `Estimated time left: ${estimatedDownloadTime.toFixed(
                    2
                  )}minutes `
                );
              });
              video.on("end", () => {
                progressBar.classList.add("bg-success");
                btnDownload.innerText = "Downloaded";
                btnDownload.disabled = true;
                ipcRenderer.invoke("videoDownloaded", fileName);
              });
            });
          }
        });
      });
    } catch (error) {
      btnSearchText.classList.toggle("d-none");
      loadingDiv.classList.toggle("d-none");
      btnSearch.disabled = false;
      ipcRenderer.invoke("notAVideo");
    }
  };
  const downloadPlayListVideo = async (
    videoLink,
    playlistTitle,
    counter,
    progressLabel
  ) => {
    await ytdl.getInfo(videoLink).then((data) => {
      let selectedFormat = data.formats.filter(
        (format) => format.itag === 18
      )[0];
      if (qualitySwitch.checked) {
        selectedFormat = data.formats.filter((format) => format.itag === 22)[0];
        if (selectedFormat === undefined)
          selectedFormat = data.formats.filter(
            (format) => format.itag === 18
          )[0];
      }
      console.log(counter, selectedFormat);

      let fileName =
        data.videoDetails.title.replace(/[<>:"\/\\|?*]+/g, "") +
        " " +
        selectedFormat.qualityLabel +
        ".mp4";
      if (playlistNumbersCheckBox.checked) {
        fileName = counter + ". " + fileName;
      }
      const playlistDir = path.join(
        process.cwd(),
        path.join("downloads", playlistTitle)
      );

      if (!fs.existsSync(playlistDir)) {
        fs.mkdirSync(playlistDir);
      }

      const video = ytdl(videoLink, {
        filter: function (format) {
          return format.itag === Number(selectedFormat.itag);
        },
      });

      let starttime;
      video.pipe(
        fs.createWriteStream(
          path.join(
            process.cwd(),
            path.join("downloads", playlistTitle, fileName)
          )
        )
      );

      video.once("response", () => {
        starttime = Date.now();
      });
      video.on("progress", (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime =
          downloadedMinutes / percent - downloadedMinutes;
        progressLabel.innerText = (percent * 100).toFixed(2) + "%";
        //console.log(estimatedDownloadTime);
        //console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        //console.log(`Running for: ${downloadedMinutes.toFixed(2)}minutes`);
        //console.log(`Estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
      });
      video.on("end", () => {
        ipcRenderer.invoke("videoDownloaded", fileName);
      });
    });
  };

  btnSearch.addEventListener("click", async (event) => {
    loadingDiv.classList.toggle("d-none");
    btnSearchText.classList.toggle("d-none");
    btnSearch.disabled = true;
    if (playlistCheckBox.checked) {
      try {
        const search = await ytpl(videoUrl.value);
        let counter = 0;
        formatTablePlaylist.classList.remove("d-none");
        formatListBodyPlaylist.innerHTML = "";
        formatTable.classList.add("d-none");
        seperatorLine.classList.add("d-none");
        progressBarWrapper.classList.add("d-none");
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
          await downloadPlayListVideo(
            search.items[key].shortUrl,
            search.title.replace(/[<>:"\/\\|?*]+/g, ""),
            counter,
            progressLabel
          );
        });
      } catch (error) {
        btnSearchText.classList.toggle("d-none");
        loadingDiv.classList.toggle("d-none");
        btnSearch.disabled = false;
        ipcRenderer.invoke("notAPlayList");
      }
    } else {
      await downloadVideo(videoUrl.value);
    }
  });
});
