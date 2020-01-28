const getTimeText = htmlStuff => {
  const x = htmlStuff.querySelector("ytd-thumbnail-overlay-time-status-renderer")
  return x ? x.textContent : "0:0"
}

const timeSplitter = str => {
  const timeArray = str.split(":").map(x => Number(x))
  const seconds =
    timeArray.length === 3
      ? timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2]
      : timeArray[0] * 60 + timeArray[1]
  return seconds
}

const scrapData = () => {
  if (document.readyState === "complete") {
    const playList = document.querySelector(".playlist-items").children
    let watched = true
    const data = [...playList].map(x => {
      //hacky as hell, I'll fix it later (probably never)
      if (x.textContent.indexOf("▶") !== -1) {
        watched = false
      }
      return {
        watched: watched,
        seconds: timeSplitter(getTimeText(x))
      }
    })
    return data
  }
  return { watched: 0, seconds: 0 }
}

const compute = data => {
  const output = data.reduce(
    (acc, val) => {
      return [val.watched ? acc[0] + val.seconds : acc[0], acc[1] + val.seconds]
    },
    [0, 0]
  )
  const currentVideoPlayTime = timeSplitter(document.querySelector(".ytp-time-current").textContent)
  output[0] += currentVideoPlayTime
  return output
}

const humanTime = secondsTotal => {
  const hours = String(Math.floor(secondsTotal / 3600))
  const minutes = String(Math.floor((secondsTotal % 3600) / 60))
  //const seconds = String(Math.floor((secondsTotal % 3600) % 60))
  return (
    (hours === "0" ? "" : hours + ` hour${hours == 1 ? "" : "s"}, `) +
    minutes +
    ` minute${minutes == 1 ? "" : "s"}`
  )
}

const createStringOutput = () => {
  const [watchedTime, totalTime] = compute(scrapData())

  const percentage =
    watchedTime + 5 >= totalTime ? 100 : Math.floor((watchedTime / totalTime) * 100)
  //const watchedString = humanTime(watchedTime)
  const totalString = humanTime(totalTime)
  const remainingString = humanTime(totalTime - watchedTime)

  return [
    `You are ${percentage}% into the playlist`,
    ` Total playlist duration: ${totalString}`,
    ` Playlist time remaining:  ${remainingString} `
  ]
}

const createAndPlantPageElement = () => {
  //create the container element
  let element = document.createElement("div")

  //create and insert style
  let style = document.createElement("style")

  style.textContent = ".xt-large {font-size: 1.4em} .xt-small {font-size: 1em}"

  //check if user has dark mode on
  const dark = document.querySelector("html").getAttribute("dark")
  if (dark) {
    style.textContent += ".xt-color {color:white}"
  }

  element.appendChild(style)

  //we create 3 paragraphs
  let content1 = document.createElement("p")
  content1.className = "xt-large xt-color"
  element.appendChild(content1)

  let content2 = document.createElement("p")
  content2.className = "xt-small xt-color"
  element.appendChild(content2)

  let content3 = document.createElement("p")
  content3.className = "xt-small xt-color"
  element.appendChild(content3)

  const target = document.querySelector("#header-description")
  target.appendChild(element)
  return [content1, content2, content3]
}

const updateContent = ([content1, content2, content3]) => {
  // will it work?
  ;[content1.textContent, content2.textContent, content3.textContent] = createStringOutput()
}

console.log("Starting playlist duration operations")
let mole = createAndPlantPageElement()
setInterval(() => {
  updateContent(mole)
}, 1000)
