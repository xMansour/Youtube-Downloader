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
  const playlistNumbering = document.querySelector("#playlistNumbering");
  const seperatorLine = document.querySelector("#seperatorLine");
  const progressBarWrapper = document.querySelector("#progressBarWrapper");

  const ytpl = require("ytpl");

  playlistCheckBox.addEventListener("click", (event) => {
    playlistNumbering.toggleAttribute("disabled");
  });

  const downloadVideo = async (videoLink) => {
    await ytdl.getInfo(videoLink).then((data) => {
      btnSearchText.classList.toggle("visually-hidden");
      loadingDiv.classList.toggle("visually-hidden");
      formatTable.classList.toggle("visually-hidden");
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
              seperatorLine.classList.toggle("visually-hidden");
              progressBarWrapper.classList.toggle("visually-hidden");
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
              return data.formats[key].itag;
            });
          });
        }
      });
    });
  };
  btnSearch.addEventListener("click", async (event) => {
    btnSearchText.classList.toggle("visually-hidden");
    loadingDiv.classList.toggle("visually-hidden");
    btnSearchText.classList.add("visually-hidden");
    btnSearch.disabled = true;
    if (playlistCheckBox.checked) {
      try {
        const search = await ytpl(videoUrl.value);
        //console.log(search);
        Object.keys(search.items).forEach((key) => {
          //console.log(search.items[key].url);
        });
        await downloadVideo(search.items[0].shortUrl);
      } catch (error) {
        console.log(error);
        btnSearchText.classList.toggle("visually-hidden");
        loadingDiv.classList.toggle("visually-hidden");
        btnSearch.disabled = false;
        return;
      }
    } else {
      await downloadVideo(videoUrl.value);
    }
  });
});
