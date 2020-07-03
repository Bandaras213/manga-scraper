const axios = require("axios");
const cheerio = require("cheerio");
const download = require("image-downloader");
const fs = require('fs');
const {
  zip
} = require('zip-a-folder');
const del = require('del');
const readline = require('readline');

let baseurl = "https://mangakakalot.com";
let urladd1 = "/search/story/";

let arrurl = [];

async function regex(searchstring) {
  let str = searchstring.toLowerCase();
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/[đ]/g, "d");
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'| |"|&|#|\[|]|~|-|$|_/g,
    "_"
  );
  str = str.replace(/_+_/g, "_");
  str = str.replace(/^_+|_+$/g, "");
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

function regexall2(searchstring) {
  let str = searchstring.toLowerCase();
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|:|;|'| |"|&|#|\[|]|~|-|$|_/g,
    "_"
  );
  str = str.replace(/_+_/g, "_");
  str = str.replace(/^_+|_+$/g, "");
  return searchstring = str
}

function regexchap(searchstring) {
  let str = searchstring;
  let res = str.match(/Chapter \d+/);
  if (res == null) {
    nextreg(str)
  } else {
  searchstring = res
  }

  function nextreg(str) {
    let res = str.match(/Ch.\d+/);
    if (res == null) {
      nextnextreg(str)
    } else {
      res = res[0].replace("Ch.", "Chapter ")
      searchstring = res
    }
  }

  function nextnextreg(str) {
    let res = str.match(/#\d+/);
    if (res == null) {
      console.log("FUCKING FUCKED")
    } else {
      res = res[0].replace("#", "Chapter ")
      searchstring = res
    }
  }
  return searchstring
}

function regexchapterspe(searchstring) {
  let str = searchstring;
  str = str.replace(/\([^()]*\)/g, "")
  str = str.replace(/[ \t]+$/, "");
  return searchstring = str
}

function splitstr(str) {
  let index = str.indexOf(" ");
  let a1 = str.substr(0, index);
  let a2 = str.substr(index + 1);
  statsupdated = {a1, a2}
  return statsupdated
}

function getFormattedDate(str) {
  let date = new Date(str)
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  statsupdated.a1 = day + '/' + month + '/' + year;
  return statsupdated.a1
}

let jsonobj;

async function searchitem(str) {
  let data = [];
  let sitenumber = [];
  await axios.get(baseurl + urladd1 + str).then(response => {
    const $ = cheerio.load(response.data);
    const urlElems = $("div.panel_story_list");
    const getallitems = $(urlElems).find("div.story_item")

    for (let i = 0; i < getallitems.length; i++) {
      let id = i
      let manganameroot = $(getallitems[i]).find("h3.story_name")[0];
      let manganame = $(manganameroot).find("a")[0].children[0].data
      let coverimg = $(getallitems[i]).find("img")[0].attribs.src
      let htmllink = $(getallitems[i]).find("a")[0].attribs.href
      let storychapters =  [];
      let lastchapters = $(getallitems[i]).find("em.story_chapter");
      for (let ii = 0; ii < $(lastchapters).find("a").length; ii++) {
        storychapters.push(regexchap($(lastchapters).find("a")[ii].children[0].data))
      }
      let statsall = $(getallitems[i]).find("div.story_item_right");
      let statsauthor = $(statsall).find("span")[0].children[0].data;
      let statsupdated = $(statsall).find("span")[1].children[0].data;
      statsauthor = statsauthor.replace("Author(s) : ", "")
      statsauthor = regexchapterspe(statsauthor)
      statsupdated = statsupdated.replace("Updated : ", "")
      statsupdatedsplit = splitstr(statsupdated)
      statsupdatedformat = getFormattedDate(statsupdatedsplit.a1)
      data.push([manganame, coverimg, htmllink, storychapters, statsauthor, statsupdatedformat + " " + statsupdatedsplit.a2, id])
    }
    const urlElemslist = $("div.group_page");
    if (urlElemslist.length == 1) {
      const getactive = $(urlElemslist).find("a.page_select")
      const getaalist = $(urlElemslist).find("a.page_last")
      function getnumber(str) {
        let res = str.match(/\d+/);
        return res
      }
      activenumber = getnumber(getactive[0].children[0].data)[0]
      allsitenumber = getnumber(getaalist[0].children[0].data)[0]
      sitenumber.push([allsitenumber, activenumber])
    } else {
      sitenumber.push([0])
    }
  });
  return {data, sitenumber}
}

module.exports = {
  search: async function(a1, skip) {
    if (skip == "no") {
    a2 = await regex(a1)
    a3 = await searchitem(a2)
    return a3
  } else if (skip == "yes") {
    a3 = await searchitem(a1, skip)
    return a3
  }
  },
  searchsolo: async function(url, str) {
    a1 = await regex(str)
    let urlfilter = url.match(/\b(\w*mangakakalot\w*)\b|\b(\w*manganelo\w*)\b/g)
        if (urlfilter[0] == "mangakakalot") {
          a2 = await getinfos(url, a1)
        } else if (urlfilter[0] == "manganelo") {
          a2 = "manganelo meme"
          //a2 = await getinfosalt(url, a1)
        }
    return a2
  }
}

//////// Mangakakarot.com \\\\\\\\

async function getinfos(url, str) {
  let newname = str;
  let genrearr = [];
  let newchapterurl;
  let author;
  let name;
  let coverurl;
  let status;
  let lastupdate;
  let description;
  let chapterlist;
  let data = [];
  try {
    if (fs.existsSync("./cache/" + newname)) {
      console.log("Does Exist")
      //getchapter(newchapterurl, newname, chapterlist, $);
    } else {
  await axios.get(url).then(response => {
      const $ = cheerio.load(response.data);
      const urlinfoElems = $("div.manga-info-top");
      const urlinfoimg = $(urlinfoElems[0])
        .find("div.manga-info-pic")
        .find("img")[0];
      coverurl = urlinfoimg.attribs.src;
      let urlinfos = $(urlinfoElems[0])
        .find("ul.manga-info-text")
        .find("li");
      name = $(urlinfos[0])
        .find("h1")
        .text();
      altname = $(urlinfos[0])
        .find("h2")
        .text();
      altname = altname.replace("Alternative : ", "")
      author = $(urlinfos[1])
        .find("a")
        .text();
      status = $(urlinfos[2]).text();
      lastupdate = $(urlinfos[3]).text();
      lastupdate = lastupdate.replace("Last updated : ", "")
      lastupdatedsplit = splitstr(lastupdate)
      lastupdatedformat = getFormattedDate(lastupdatedsplit.a1)
      status = status.replace("Status : ", "")
      function statusfix(str) {
        let filter = str.match(/\b(\w*Ongoing\w*)\b|\b(\w*Completed\w*)\b|\b(\w*Unknown\w*)\b|\b(\w*Licensed\w*)\b/g)
        return filter[0]
      }
      function statusconvert(str) {
        switch (str) {
          case "Ongoing":
            status = 1
            break
          case "Completed":
            status = 2
            break
          case "Unknown":
            status = 0
            break
          case "Licensed":
            status = 3
            break
          default:
            status = 0
            break
        }
      }
      let urlinfoElems2 = $("div#noidungm");
      description = urlinfoElems2[0].children[2].data
      description = description.replace(/^\s+/g, '');
      description = description.replace(/(\r\n|\n|\r)/gm, " ");
      description = description.replace(/“|”|"/g, "'")
      description = description.replace(/\[[^()]*\]/g, "")
      description = description.replace(/^\s*/, "");

      let genres = $(urlinfos[6]).find("a");
      for (let i = 0; i < genres.length; i++) {
        genrearr.push('"' + genres[i].children[0].data + '"');
      }

      const urlchapElems = $("div.manga-info-chapter");
      const chapterurls = $(urlchapElems[0])
        .find("div.chapter-list")
        .find("div.row")
        .find("a")[0].attribs.href;
      let searchfor = "chapter_";
      let chapterurlsearch = chapterurls.search(searchfor) - 1;
      newchapterurl = chapterurls.substring(0, chapterurlsearch);

      const urlchaplistElems = $("div.manga-info-chapter");
      chapterlist = $(urlchaplistElems[0])
        .find("div.chapter-list")
        .find("div.row").get().reverse()

        data.push([name, author, description, genrearr, statusfix(status), lastupdatedformat + " " + lastupdatedsplit.a2, coverurl, newname, altname])
    });
  }
  } catch (err) {
    console.error(err)
  }
  return {data}
}

  /*getinfos1(async function () {
    let jsonData = '{"title": "' + name + '", "author": "' + author + '", "description": "' + description + '", "genre": [' + genrearr + '], "status": "' + statusconvert(status) + '", "_status values": ["0 = Unknown", "1 = Ongoing", "2 = Completed", "3 = Licensed"]}';
        fs.mkdirSync("./cache/" + newname);
        fs.writeFileSync("./cache/" + newname + "/details.json", jsonData);
        const options = {
          url: coverurl,
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0",
            "Accept-Language": "en-gb",
            "Accept-Encoding": "br, gzip, deflate",
            Accept: "test/html,application/xhtml+xml,application/xml;q=0.9,*/ //*;q=0.8",
            //Referer: "https://mangakakalot.com"
          /*},
          dest: "./cache/" + newname + "/cover.jpg"
        };

        await download
          .image(options)
          .then(({
            filename
          }) => {
            console.log("Saved to", filename);
          })
          .catch(err => console.error(err));
        //getchapter(newchapterurl, newname, chapterlist, $);
  });
}
}*/

function getchapter(str, newname, chapterlist, $) {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('What Chapter do you want to Download from ' + chapterlist.length + "? (Maximum is 5 at a time. Use 1 Number or a Number range like 1-5.)", (answer) => {
    var multiget = answer.split('-', 2);
    if (multiget > 2) {
      console.log("Your Answer was not in the Chapter range try again.")
    }
    if (multiget[0] == NaN) {
      console.log("The first Number was not a Number " + multiget[0])
    } else if (multiget[1] == NaN && multiget[1] != undefined) {
      console.log("The first Number was not a Number " + multiget[1])
    }
    if (multiget[1] == undefined) {
      let chapternamearr = [];
      let chapternamearrreal = [];
      let chapterlistel = $(chapterlist[multiget[0] - 1])
        .find("span")
        .find("a")
        .text()
      let searchfor = ":";
      let chaptersearch = chapterlistel.search(searchfor);
      if (chaptersearch == -1) {} else {
        chapterdir = chapterlistel.substring(0, chaptersearch);
        chapterlistel = chapterdir
      }
      chapternamearr.push(regexall2(chapterlistel))
      chapternamearrreal.push(regexall(chapterlistel))
      startscrape(chapternamearr, chapternamearrreal)
    } else {
      let chapternamearr = [];
      let chapternamearrreal = [];
      for (let i = multiget[0] - 1; i < multiget[1]; i++) {
        let chapterlistel = $(chapterlist[i])
          .find("span")
          .find("a")
          .text()
        let searchfor = ":";
        let chaptersearch = chapterlistel.search(searchfor);
        if (chaptersearch == -1) {} else {
          chapterdir = chapterlistel.substring(0, chaptersearch);
          chapterlistel = chapterdir
        }
        chapternamearr.push(regexall2(chapterlistel))
        chapternamearrreal.push(regexall(chapterlistel))
      }
      startscrape(chapternamearr, chapternamearrreal)
    }
    rl.close();
  });

  async function startscrape(answer, answer2) {
    let newjsonobject
    async function read() {
      var obj = await JSON.parse(fs.readFileSync('./downloadlist.json', 'utf8'));
      jsonobj = obj
    }

    await read();
    for (let i = 0; i < answer.length; i++) {
      arrurl = [];

      function getindex(object) {
        let index = object.findIndex(ads => ads.name == newname)
        return index
      }

      async function writenewentry(obj) {
        newjsonobject = new Object(obj.downloads)
        if (getindex(newjsonobject) == -1) {
          newjsonobject[newjsonobject.length] = {
            "name": newname,
            "chapterdownloaded": []
          }
          jsonobj = obj
          await testchapterexist(jsonobj.downloads[getindex(newjsonobject)])
        } else {
          await testchapterexist(obj.downloads[getindex(newjsonobject)])
        }
      }

      await writenewentry(jsonobj)

      async function testchapterexist(a1) {
        let even = (element) => element === answer[i];
        if (a1.chapterdownloaded.some(even) == true) {} else if (a1.chapterdownloaded.some(even) == false) {
          a1.chapterdownloaded.push(answer[i])
          await startscrape();
        }
      }

      async function startscrape() {
        await axios.get(str + "/" + answer[i]).then(response => {
          const $ = cheerio.load(response.data);
          const urlElems = $("div.vung-doc");

          const urlimg = $(urlElems[0]).find("img");
          if (urlimg) {
            for (let i1 = 0; i1 < urlimg.length; i1++) {
              arrurl.push(urlimg[i1].attribs.src);
            }
          }
        });
        try {
          if (!fs.existsSync("./cache/" + newname + "/" + answer2[i])) {
            fs.mkdirSync("./cache/" + newname + "/" + answer2[i]);
          } else if (fs.existsSync("./cache/" + newname + "/" + answer2[i]) && fs.readdirSync("./cache/" + newname + "/" + answer2[i]).length != 0) {
            console.log(newname + "/" + answer2[i] + " Already exists")
          }
          async function scrap() {
            for (let i2 = 0; i2 < arrurl.length; i2++) {
              const options = {
                url: arrurl[i2],
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0",
                  "Accept-Language": "en-gb",
                  "Accept-Encoding": "br, gzip, deflate",
                  Accept: "test/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                  Referer: "https://mangakakalot.com"
                },
                dest: "./cache/" + newname + "/" + answer2[i]
              };

              await download
                .image(options)
                .then(({
                  filename
                }) => {
                  console.log("Saved to", filename);
                })
                .catch(err => console.error(err));
            }
          }
          await scrap();
          async function pack() {
            class ZipAFolder {
              static async main() {
                await zip("./cache/" + newname + "/" + answer2[i], "./cache/" + newname + "/" + answer2[i] + ".zip");
                await del.sync(["./cache/" + newname + "/" + answer2[i], "!./cache/" + newname]);
              }
            }
            ZipAFolder.main();
          }
          await pack();

          if (i == answer.length - 1) {
            let tempsortstg = jsonobj.downloads[getindex(newjsonobject)].chapterdownloaded;
            tempsortstg.sort()
            await writenewchapters();
          }

          async function writenewchapters() {
            const jsonString = JSON.stringify(jsonobj)
            fs.writeFile('./downloadlist.json', jsonString, err => {
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
    }
  }
}

//////// manganelo.com \\\\\\\\

function getinfosalt(url, str, $) {
  let newname = str;
  let genrearr = [];
  let newchapterurl;
  let author;
  let name;
  let alternative;
  let coverurl;
  let status;
  let description;
  let chapterlist;

  var getinfos1 = function (callback) {
    axios.get(url).then(response => {
      const $ = cheerio.load(response.data);
      const urlinfoElems = $("div.panel-story-info");
      const urlinfoimg = $(urlinfoElems[0])
        .find("img.img-loading")
      coverurl = urlinfoimg[0].attribs.src;

      let urlinfos = $(urlinfoElems[0])
        .find("div.story-info-right")
      name = $(urlinfos[0])
        .find("h1")
        .text();

      let alttemp = $(urlinfos[0])
        .find("table.variations-tableInfo")
        .find("td.table-value")[0]
      alternative = $(alttemp)
        .find("h2")
        .text();

      let altauthor = $(urlinfos[0])
        .find("table.variations-tableInfo")
        .find("td.table-value")[1]
      author = $(altauthor)
        .find("a")
        .text();

      let altstatus = $(urlinfos[0])
        .find("table.variations-tableInfo")
        .find("td.table-value")[2]
      status = $(altstatus)
        .text();
      status = status.replace("Status : ", "")
      switch (status) {
        case "Ongoing":
          status = 1
          break
        case "Completed":
          status = 2
          break
        case "Unknown":
          status = 0
          break
        case "Licensed":
          status = 3
          break
        default:
          status = 0
          break
      }

      let urlinfoElems2 = $("div.panel-story-info-description");
      description = urlinfoElems2[0].children[2].data
      description = description.replace(/^\s+/g, '');
      description = description.replace(/(\r\n|\n|\r)/gm, " ");
      description = description.replace(/“|”|"/g, "'")

      let altgenres = $(urlinfos[0])
        .find("table.variations-tableInfo")
        .find("td.table-value")[3]
      let genres = $(altgenres)
        .find("a")
      for (let i = 0; i < genres.length; i++) {
        genrearr.push('"' + genres[i].children[0].data + '"');
      }

      const urlchapElems = $("div.panel-story-chapter-list");
      const chapterurls = $(urlchapElems[0])
        .find("ul.row-content-chapter")
        .find("li.a-h")
        .find("a")[0].attribs.href;
      let searchfor = "chapter_";
      let chapterurlsearch = chapterurls.search(searchfor) - 1;
      newchapterurl = chapterurls.substring(0, chapterurlsearch);

      const urlchaplistElems = $("div.panel-story-chapter-list");
      chapterlist = $(urlchaplistElems[0])
        .find("ul.row-content-chapter")
        .find("li.a-h").get().reverse()

      if (callback) callback();
    });
  };
  getinfos1(async function () {
    let jsonData = '{"title": "' + name + '", "author": "' + author + '", "description": "' + description + '", "genre": [' + genrearr + '], "status": "' + status + '", "_status values": ["0 = Unknown", "1 = Ongoing", "2 = Completed", "3 = Licensed"]}';
    try {
      if (fs.existsSync("./cache/" + newname)) {
        getchapter1(newchapterurl, newname, chapterlist, $);
      } else {
        fs.mkdirSync("./cache/" + newname);
        fs.writeFileSync("./cache/" + newname + "/details.json", jsonData);
        const options = {
          url: coverurl,
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0",
            "Accept-Language": "en-gb",
            "Accept-Encoding": "br, gzip, deflate",
            Accept: "test/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            Referer: "https://mangakakalot.com"
          },
          dest: "./cache/" + newname + "/cover.jpg"
        };

        await download
          .image(options)
          .then(({
            filename
          }) => {
            console.log("Saved to", filename);
          })
          .catch(err => console.error(err));
        getchapter1(newchapterurl, newname, chapterlist, $);
      }
    } catch (err) {
      console.error(err)
    }
  });
};

function getchapter1(str, newname, chapterlist, $) {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('What Chapter do you want to Download from ' + chapterlist.length + "? (Maximum is 5 at a time. Use 1 Number or a Number range like 1-5.)", (answer) => {
    var multiget = answer.split('-', 2);
    if (multiget > 2) {
      console.log("Your Answer was not in the Chapter range try again.")
    }
    if (multiget[0] == NaN) {
      console.log("The first Number was not a Number " + multiget[0])
    } else if (multiget[1] == NaN && multiget[1] != undefined) {
      console.log("The first Number was not a Number " + multiget[1])
    }
    if (multiget[1] == undefined) {
      let chapternamearr = [];
      let chapternamearrreal = [];
      let chapterlistel = $(chapterlist[multiget[0] - 1])
        .find("a")
        .text()
      let searchfor = ":";
      let chaptersearch = chapterlistel.search(searchfor);
      if (chaptersearch == -1) {} else {
        chapterdir = chapterlistel.substring(0, chaptersearch);
        chapterlistel = chapterdir
      }
      chapternamearr.push(regexall2(chapterlistel))
      chapternamearrreal.push(regexall(chapterlistel))
      startscrape(chapternamearr, chapternamearrreal)
    } else {
      let chapternamearr = [];
      let chapternamearrreal = [];
      for (let i = multiget[0] - 1; i < multiget[1]; i++) {
        let chapterlistel = $(chapterlist[i])
          .find("a")
          .text()
        let searchfor = ":";
        let chaptersearch = chapterlistel.search(searchfor);
        if (chaptersearch == -1) {} else {
          chapterdir = chapterlistel.substring(0, chaptersearch);
          chapterlistel = chapterdir
        }
        chapternamearr.push(regexall2(chapterlistel))
        chapternamearrreal.push(regexall(chapterlistel))
      }
      startscrape(chapternamearr, chapternamearrreal)
    }
    rl.close();
  });

  async function startscrape(answer, answer2) {
    let newjsonobject
    async function read() {
      var obj = await JSON.parse(fs.readFileSync('./downloadlist.json', 'utf8'));
      jsonobj = obj
    }

    await read();
    for (let i = 0; i < answer.length; i++) {
      arrurl = [];

      function getindex(object) {
        let index = object.findIndex(ads => ads.name == newname)
        return index
      }

      async function writenewentry(obj) {
        newjsonobject = new Object(obj.downloads)
        if (getindex(newjsonobject) == -1) {
          newjsonobject[newjsonobject.length] = {
            "name": newname,
            "chapterdownloaded": []
          }
          jsonobj = obj
          await testchapterexist(jsonobj.downloads[getindex(newjsonobject)])
        } else {
          await testchapterexist(obj.downloads[getindex(newjsonobject)])
        }
      }

      await writenewentry(jsonobj)

      async function testchapterexist(a1) {
        let even = (element) => element === answer[i];
        if (a1.chapterdownloaded.some(even) == true) {} else if (a1.chapterdownloaded.some(even) == false) {
          a1.chapterdownloaded.push(answer[i])
          await startscrape();
        }
      }

      async function startscrape() {
        await axios.get(str + "/" + answer[i]).then(response => {
          const $ = cheerio.load(response.data);
          const urlElems = $("div.container-chapter-reader");

          const urlimg = $(urlElems[0]).find("img");
          if (urlimg) {
            for (let i1 = 0; i1 < urlimg.length; i1++) {
              arrurl.push(urlimg[i1].attribs.src);
            }
          }
        });
        try {
          if (!fs.existsSync("./cache/" + newname + "/" + answer2[i])) {
            fs.mkdirSync("./cache/" + newname + "/" + answer2[i]);
          } else if (fs.existsSync("./cache/" + newname + "/" + answer2[i]) && fs.readdirSync("./cache/" + newname + "/" + answer2[i]).length != 0) {
            console.log(newname + "/" + answer2[i] + " Already exists")
          }
          async function scrap() {
            for (let i2 = 0; i2 < arrurl.length; i2++) {
              const options = {
                url: arrurl[i2],
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0",
                  "Accept-Language": "en-gb",
                  "Accept-Encoding": "br, gzip, deflate",
                  Accept: "test/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                  Referer: "https://mangakakalot.com"
                },
                dest: "./cache/" + newname + "/" + answer2[i]
              };

              await download
                .image(options)
                .then(({
                  filename
                }) => {
                  console.log("Saved to", filename);
                })
                .catch(err => console.error(err));
            }
          }
          await scrap();
          async function pack() {
            class ZipAFolder {
              static async main() {
                await zip("./cache/" + newname + "/" + answer2[i], "./cache/" + newname + "/" + answer2[i] + ".zip");
                await del.sync(["./cache/" + newname + "/" + answer2[i], "!./cache/" + newname]);
              }
            }
            ZipAFolder.main();
          }
          await pack();

          if (i == answer.length - 1) {
            let tempsortstg = jsonobj.downloads[getindex(newjsonobject)].chapterdownloaded;
            tempsortstg.sort()
            await writenewchapters();
          }

          async function writenewchapters() {
            const jsonString = JSON.stringify(jsonobj)
            fs.writeFile('./downloadlist.json', jsonString, err => {
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
    }
  }
}