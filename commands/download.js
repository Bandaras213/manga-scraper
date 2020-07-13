const {
  ipcRenderer
} = require('electron')
const axios = require("axios");
const cheerio = require("cheerio");
const download = require("image-downloader");
const fs = require('fs');
const {
  zip
} = require('zip-a-folder');
const del = require('del');

async function openwindow() {
  ipcRenderer.send('checkids')
}

ipcRenderer.on('changecss', (event, arg) => {
  console.log(arg)
})

async function downloadoptions(a1, a2) {
  const options = {
    url: a1,
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0",
      "Accept-Language": "en-gb",
      "Accept-Encoding": "br, gzip, deflate",
      Accept: "test/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: "https://mangakakalot.com"
    },
    dest: a2
  }
  return options
}

function getchapternmb(str, a1) {
  a1 = a1.replace(/\\/g, "/")
  str = str.replace(/\\/g, "/")
  str = str.replace(a1, "")
  str = str.replace(".jpg", "")
  return str
}

function regexall(searchstring) {
  let str = searchstring.toLowerCase();
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'| |"|&|#|\[|]|~|-|$|_/g,
    "_"
  );
  str = str.replace(/_+_/g, "_");
  str = str.replace(/^_+|_+$/g, "");
  return searchstring = str
}

async function read(a2, a3) {
  if (!fs.existsSync(a2 + "/" + a3 + '/downloadlist.json')) {
    let tempdata = JSON.stringify({
      "downloads": []
    })
    fs.writeFileSync(a2 + "/" + a3 + '/downloadlist.json', tempdata);
  }
  var obj = await JSON.parse(fs.readFileSync(a2 + "/" + a3 + '/downloadlist.json', 'utf8'));
  return obj
}

function getindexext(object, a3) {
  let index = object.findIndex(ads => ads.name == a3)
  return index
}

async function writenewentryext(obj, chapternmb, a4, a3) {
  newjsonobject = new Object(obj.downloads)
  if (getindexext(newjsonobject, a3) == -1) {
    newjsonobject[newjsonobject.length] = {
      "name": a3,
      "chapterdownloaded": []
    }
    jsonobj = obj
    result = await testchapterexistext(jsonobj.downloads[getindexext(newjsonobject, a3)], chapternmb)
  } else {
    result = await testchapterexistext(obj.downloads[getindexext(newjsonobject, a3)], chapternmb)
  }
  return result
}

async function testchapterexistext(b1, chapternmb) {
  let even = (element) => element === chapternmb;
  if (b1.chapterdownloaded.some(even) == true) {
    check = true;
  } else if (b1.chapterdownloaded.some(even) == false) {
    check = false;
  }
  return check
}

async function startscrape(a1, a2, a3, a4) {
  ipcRenderer.send('changecss')
  let jsonobj
  let newjsonobject
  let arrurl = [];

  jsonobj = await read(a2, a3);

  for (let i = 0; i < a1.length; i++) {
    function getindex(object) {
      let index = object.findIndex(ads => ads.name == a3)
      return index
    }

    async function writenewentry(obj) {
      newjsonobject = new Object(obj.downloads)
      if (getindex(newjsonobject) == -1) {
        newjsonobject[newjsonobject.length] = {
          "name": a3,
          "chapterdownloaded": []
        }
        jsonobj = obj
        await testchapterexist(jsonobj.downloads[getindex(newjsonobject)])
      } else {
        await testchapterexist(obj.downloads[getindex(newjsonobject)])
      }
    }

    await writenewentry(jsonobj)

    async function testchapterexist(b1) {
      let even = (element) => element === a1[i][0];
      let chptnew = regexall(a1[i][0])
      if (b1.chapterdownloaded.some(even) == true) {
        if (!fs.existsSync(a2 + "/" + a3 + "/" + chptnew + ".zip") && !fs.existsSync(a2 + "/" + a3 + "/" + chptnew)) {
          b1.chapterdownloaded.push(a1[i][0])
          await startscrape();
        }
      } else if (b1.chapterdownloaded.some(even) == false) {
        b1.chapterdownloaded.push(a1[i][0])
        await startscrape();
      }
    }

    async function startscrape() {
      await axios.get(a1[i][2]).then(response => {
        const $ = cheerio.load(response.data);
        const urlElems = $("div.vung-doc");

        const urlimg = $(urlElems[0]).find("img");
        if (urlimg) {
          for (let i1 = 0; i1 < urlimg.length; i1++) {
            arrurl.push(urlimg[i1].attribs.src);
          }
        }
      });
      let chptnew = regexall(a1[i][0])
      let number;
      try {
        if (!fs.existsSync(a2 + "/" + a3 + "/" + chptnew)) {
          fs.mkdirSync(a2 + "/" + a3 + "/" + chptnew);
        } else if (fs.existsSync(a2 + "/" + a3 + "/" + chptnew) && fs.readdirSync(a2 + "/" + a3 + "/" + chptnew).length != 0) {
          console.log(a3 + "/" + chptnew + " Already exists")
        }
        async function scrap() {
          for (let i2 = 0; i2 < arrurl.length; i2++) {

            await download
              .image(await downloadoptions(arrurl[i2], a2 + "/" + a3 + "/" + chptnew))
              .then(({
                filename
              }) => {
                number = getchapternmb(filename, a2 + "/" + a3 + "/" + chptnew + "/")
                ipcRenderer.send('statusupd', [a4, number, arrurl.length, a1[i][0]])
              })
              .catch(err => console.error(err));
          }
        }
        await scrap();
        async function pack() {
          class ZipAFolder {
            static async main() {
              await zip(a2 + "/" + a3 + "/" + chptnew, a2 + "/" + a3 + "/" + chptnew + ".zip");
              ipcRenderer.send('statuspacked', [chptnew + ".zip"])
              del.sync([a2 + "/" + a3 + "/" + chptnew, !a2 + "/" + a3]);
              ipcRenderer.send('statusdel', [a1[i][0]])
            }
          }
          ZipAFolder.main();
        }
        await pack();

        if (i == a1.length - 1) {
          let tempsortstg = jsonobj.downloads[getindex(newjsonobject)].chapterdownloaded;
          tempsortstg.sort()
          await writenewchapters();
        }

        async function writenewchapters() {
          const jsonString = JSON.stringify(jsonobj)
          fs.writeFile(a2 + "/" + a3 + '/downloadlist.json', jsonString, err => {
            if (err) {
              console.log('Error writing file', err)
            } else {
              console.log('Successfully wrote file')
            }
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    arrurl = [];
  }
}

module.exports = {
  get: async function (chapterarr, cachedir, newname, name) {
    a2 = await openwindow()
    a3 = await startscrape(chapterarr, cachedir, newname, name)
  },
  check: async function (cachedir, newname, chapternmb, name) {
    a1 = await read(cachedir, newname);
    a2 = await writenewentryext(a1, chapternmb, name, newname)
    return a2
  }
}