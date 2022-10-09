# Welcome to Maktab!

## Table of Contents
1. [About The Project](#ahowToUsebout)
2. [Built With](#builtWith)
3. [Scripts](#scripts)
4. [How To Use](#howToUse)
   1. [Downloading Multiple Qulities Videos](#downloadingMultipleQulitiesVideos)
   2. [Downloading Multiple Qulities Playlists](#downloadingMultipleQulitiesPlaylists)
5. [Known Issues](#knownIssues)


## About The Project<a id='about'></a>
Youtube video and playlist downloader built with electron.js and based on youtube-dl.  

## Built With<a id='builtWith'>
1. JavaScript
2. Electron.JS
3. ytdl-core
4. ytpl
5. Prettier


## Scripts<a id='scripts'></a>
  - To install the required dependencies: `npm install`
  - To run the app: `npm run start`  




## How To Use<a id='howToUse'></a>
After entering a video's URL and pressing the search button, you may download it. It'll look for available qualities and display them in a table.
<img src="/docs/screenshots/videosDownload.png"  hspace="10" vspace="10">

### Downloading Multiple Qualities<a id='downloadingMultipleQulitiesVideos'></a>
You can download the available qualities after searching for them.  
1. Downloading 720p HD Videos  
   <img src="/docs/screenshots/downloading720HDVideos.gif"  hspace="10" vspace="10">
2. Downloading 360p Videos  
   <img src="/docs/screenshots/downloading360pVideos.gif"  hspace="10" vspace="10">

If we browse to the downloads folder in our project's parent directory, we will find the downloaded videos as seen below. As you can see we have 2 qualities downloaded, 360p and 720p.  

<img src="/docs/screenshots/downloadedVideos.png"  hspace="10" vspace="10">

### Downloading Multiple Qulities Playlists<a id='downloadingMultipleQulitiesPlaylists'></a>
Downloading playlists is similar to downloading videos. Select the Playlist checkbox, and if you'd like to add a prefix number to arrange your videos, check that box as well. The last switch allows you to choose a quality for the downloaded videos, whether 360p (the default) or 720p.  

<img src="/docs/screenshots/PlaylistDownloads.png"  hspace="10" vspace="10">

When you search for a playlist link, it will be instantly downloaded.

<img src="/docs/screenshots/downloadingPlaylists.gif"  hspace="10" vspace="10">  

If you go to the downloads folder again, you should find a folder with the name of the playlist you downloaded.

<img src="/docs/screenshots/downloadedVideos.png"  hspace="10" vspace="10">  

If you opened the "Small Clips" folder, you should find your downloaded playlist videos as below. Notice how the videos are prefixed with numbers since we checked the "Add prefix order number" checkbox.

<img src="/docs/screenshots/downloadedPlaylists.png"  hspace="10" vspace="10">  

## Known Issues<a id='knownIssues'></a>
   1. The Search button keeps on the state "Loading..." after finishing downloading all the playlist videos and you need to refresh the app (restart it).
