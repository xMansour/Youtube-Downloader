window.addEventListener('DOMContentLoaded', () => {
    /*const YoutubeDlWrap = require("youtube-dl-wrap");
    const path = require("path");
    const youtubeDlWrap = new YoutubeDlWrap(path.join(process.cwd(), 'resources', 'api', 'youtube-dl.exe'));
    youtubeDlEventEmitter = youtubeDlWrap.exec(["https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "-f", "best", "-o", "output.mp4"])
        .on("progress", (progress) =>
            console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
        .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
        .on("error", (error) => console.error(error))
        .on("close", () => console.log("all done"));

    console.log(youtubeDlEventEmitter.youtubeDlProcess.pid);*/

    const fs = require('fs')
    const ytdl = require('ytdl-core')
    const videoUrl = document.querySelector('#videoUrl')
    const formatList = document.querySelector('#formatList')
    const formatTable = document.querySelector('#formatTable')
    const formatListBody = document.querySelector('#formatListBody')
    const btnSearch = document.querySelector('#btnSearch')
    btnSearch.addEventListener('click', (event) => {
        //formatList
        ytdl.getInfo(videoUrl.value).then((data) => {
            console.log(data)
            Object.keys(data.formats).forEach((key) => {
                //TODO:: add items to the table
                const node = document.createElement('tr')
                if (data.formats[key].hasAudio && data.formats[key].hasVideo) {
                    const textnode = document.createTextNode(
                        data.formats[key].qualityLabel +
                            '     ' +
                            data.formats[key].fps +
                            ' fps     ' +
                            (
                                data.formats[key].approxDurationMs /
                                (1000 * 60)
                            ).toFixed(2) +
                            ' Mins     ' +
                            data.formats[key].hasAudio +
                            '     ' +
                            data.formats[key].hasVideo
                    )
                    node.appendChild(textnode)
                    formatList.appendChild(node)
                }
            })
        })
    })
    /*ytdl.getInfo('http://www.youtube.com/watch?v=aqz-KE-bpKQ').then((data) => {
        console.log(data.formats);
    })*/
})
