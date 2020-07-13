const {
    ipcRenderer
} = require('electron')
let getappPath = ipcRenderer.send('getapppath')
let getappdownloadPath = ipcRenderer.send('getdownloadpath')
let appPath
let appdownloadPath

ipcRenderer.on('getapppath', (event, arg) => {
    appPath = arg
})
ipcRenderer.on('getdownloadpath', (event, arg) => {
    appdownloadPath = arg
})

const scrape = require('./commands/scrape.js');
const scrapedownload = require('./commands/download.js');
let val;
let mangasearchvalue;
let oldvalue;
var selectionarr = {1 : "mangakakalot", 2 : "manganelo"} 
var selected = document.getElementById("selectorlist"); 

window.onload = function () {
    document.getElementsByClassName("searchbutton")[0].addEventListener("click", function () {
        getvalue("");
    }, false);
    for(index in selectionarr) {
        selected.options[selected.options.length] = new Option(selectionarr[index], index);
}
};

async function getvalue(str) {
    console.log(selectionarr[selected.value])
    if (str == "") {
        skip = "no"
        mangasearchvalue = document.getElementById("searchmanga").value;
        oldvalue = mangasearchvalue
    } else {
        skip = "yes"
        mangasearchvalue = oldvalue + "?page=" + str;
    }
    val = await scrape.search(mangasearchvalue, skip)
    document.getElementsByClassName("container")[0].innerHTML = ""
    addtopage(val.data, val.sitenumber)
}

async function addtopage(val, sitenumber) {
    let start = document.createElement('div');
    start.className = "allitems"
    document.getElementsByClassName("container")[0].appendChild(start);
    let newitem = document.getElementsByClassName("allitems")[0]
    for (let a = 0; a < val.length; a++) {
        let a1 = document.createElement('div');
        a1.id = val[a][6]
        a1.className = "item"
        a1.innerHTML = '<div class="cover"><img src="' + val[a][1] + '" "alt="' + val[a][0] + '"></img></div>'
        newitem.appendChild(a1);
        let newitemright = document.getElementsByClassName("item")[a]
        let a2;
        for (let i = 0; i < 3; i++) {
            if (i == 0) {
                a2 = document.createElement('div');
                a2.className = "allitems_right"
                a2.innerHTML = '<h3 class="item_name"><a>' + val[a][0] + '</a></h3>'
                newitemright.appendChild(a2);
            }
            if (i == 1) {
                newitemright = document.getElementsByClassName("allitems_right")[a]
                a2 = document.createElement('a');
                a2.className = "item_chapter_left"
                a2.innerHTML = '<img src="./assets/icons/book-solid.svg" class="svgfill" height="20px" width="20px"><a>' + val[a][3][0] + '</a>'
                newitemright.appendChild(a2);
            }
            if (i == 2 && val[a][3][1] == undefined) {} else if (i == 2 && val[a][3][1] != undefined) {
                newitemright = document.getElementsByClassName("allitems_right")[a]
                a2 = document.createElement('a');
                a2.className = "item_chapter_right"
                a2.innerHTML = '<img src="./assets/icons/book-solid.svg" class="svgfill" height="20px" width="20px"><a>' + val[a][3][1] + '</a>'
                newitemright.appendChild(a2);
            }
        }
        let a3 = document.createElement('span');
        a3.innerHTML = '<img src="./assets/icons/clock-regular.svg" class="svgfill" height="20px" width="20px">' + val[a][5]
        newitemright.appendChild(a3);
        let a4 = document.createElement('span');
        a4.innerHTML = '<img src="./assets/icons/paint-brush-solid.svg" class="svgfill" height="20px" width="20px">' + val[a][4]
        newitemright.appendChild(a4);
    }
    if (sitenumber[0][0] != 0) {
        let a2;
        let containerget = document.getElementsByClassName("container")[0]
        let a1 = document.createElement('div');
        a1.className = "item_pages";
        containerget.appendChild(a1);
        let newitemright = document.getElementsByClassName("item_pages")[0]
        for (let a = 0; a < sitenumber[0][0]; a++) {
            a2 = document.createElement('a');
            if (sitenumber[0][1] == a + 1) {
                a2.className = "active"
            }
            a2.innerHTML = a + 1
            newitemright.appendChild(a2);
        }
    }
    document.querySelectorAll('.item_pages a:not(.active)').forEach(dis => dis.addEventListener("click", getit, false));
    document.querySelectorAll('.item').forEach(item => item.addEventListener("click", getitem, false));
}

async function getit() {
    getvalue(this.innerText)
}

async function getitem() {
    getappPath
    let x = this.id;
    let url = val.data[x][2]
    let namecache = val.data[x][0]
    let soloval = await scrape.searchsolo(url, namecache, appPath)
    if (soloval.a2 == "manganelo meme") {
        return alert("War manganelo so no dice")
    }
    document.getElementsByClassName("container")[0].innerHTML = ""
    let start = document.createElement('div');
    start.className = "soloitems"
    document.getElementsByClassName("container")[0].appendChild(start);
    let newitem = document.getElementsByClassName("soloitems")[0]
    let name = soloval.a2.data[0][0]
    let author = soloval.a2.data[0][1]
    let description = soloval.a2.data[0][2]
    let genres = soloval.a2.data[0][3]
    let genrearr = [];
    let status = soloval.a2.data[0][4]
    let lastupdate = soloval.a2.data[0][5]
    let coverimg = soloval.a2.data[0][6]
    let formatname = soloval.a2.data[0][7]
    let altnames = soloval.a2.data[0][8]
    let chapterlist = soloval.a3;
    let main;
    let classname;
    let innervalue;
    let lastid;
    let activedls = [];
    async function scrapedowncheck(a1) {
        return await scrapedownload.check(soloval.a2.cache[0][0], formatname, a1, name)
    }
    for (let i = 0; i < 7; i++) {
        switch (i) {
            case 0:
                main = 'div'
                classname = "cover"
                innervalue = '<img src="' + coverimg + '" "alt="' + formatname + '"></img>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                newitem.appendChild(i);
                let a1 = document.createElement('div');
                a1.className = "manga-info"
                newitem.appendChild(a1);
            case 1:
                let a2 = document.createElement('div');
                a2.className = "manganame"
                document.getElementsByClassName("manga-info")[0].appendChild(a2);
                main = 'h1'
                classname = "item_name"
                innervalue = '<a>' + name + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manganame")[0].appendChild(i);
            case 2:
                main = 'h2'
                classname = "item_name_alt"
                innervalue = '<a>' + altnames + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manganame")[0].appendChild(i);
            case 3:
                let a3 = document.createElement('div');
                a3.className = "scrollbox"
                a3.tabIndex = "0"
                document.getElementsByClassName("manga-info")[0].appendChild(a3);
                main = 'div'
                classname = "manga_items_info description-content"
                innervalue = '<a>' + description + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("scrollbox")[0].appendChild(i);
            case 4:
                author = author.replace(/\([^()]*\)/g, "")
                author = author.replace(/[ \t]+$/, "");
                main = 'div'
                classname = "manga_items_info author"
                innervalue = '<a style="color: #3db4f2">' + "Author: " + '</a><a style="color: #2ca1db">' + author + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 5:
                main = 'div'
                classname = "manga_items_info status"
                innervalue = '<a style="color: #3db4f2">' + "Status: " + '</a><a style="color: #2ca1db">' + status + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 6:
                main = 'div'
                classname = "manga_items_info lastupdate"
                innervalue = '<a style="color: #3db4f2">' + "Last Update: " + '</a><a style="color: #2ca1db">' + lastupdate + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 7:
                for (let ii = 0; ii < genres.length; ii++) {
                    let str = genres[ii].replace(/^"|"$/g, '');
                    genrearr.push(str)
                }
                main = 'div'
                classname = "manga_items_info genrediv"
                i = document.createElement(main);
                i.className = classname
                document.getElementsByClassName("manga-info")[0].appendChild(i);
        }
    }
    for (let i = 0; i < genrearr.length; i++) {
        main = 'a'
        classname = "genre"
        let a1 = document.createElement(main);
        a1.className = classname
        a1.innerHTML = genrearr[i]
        document.getElementsByClassName("manga_items_info genrediv")[0].appendChild(a1);
    }
    for (let i = 0; i < 4; i++) {
        switch (i) {
            case 0:
                i = document.createElement('div');
                i.className = "manga-chapters-container"
                newitem.appendChild(i);
            case 1:
                i = document.createElement('div');
                i.className = "manga-chapters-info"
                document.getElementsByClassName("manga-chapters-container")[0].appendChild(i);
            case 2:
                i = document.createElement('div');
                i.className = "row chapters-infos"
                i.innerHTML = '<span style="width: 83%">Chapter</span><span style="margin-left: 3px">Updated</span>'
                document.getElementsByClassName("manga-chapters-info")[0].appendChild(i);
            case 3:
                i = document.createElement('div');
                i.className = "chapter-list scrollbox"
                document.getElementsByClassName("manga-chapters-info")[0].appendChild(i);
                a1 = document.createElement('div');
                a1.className = "chapter-list-content"
                document.getElementsByClassName("chapter-list scrollbox")[0].appendChild(a1);
        }
        for (let i = 0; i < chapterlist.length; i++) {
            if (await scrapedowncheck(chapterlist[i][0]) == true) {
                a1 = document.createElement('div');
                a1.className = "row down"
                a1.id = i
                a1.innerHTML = '<span><a>' + chapterlist[i][0] + '</a></span><span>' + chapterlist[i][1] + '</span>'
                document.getElementsByClassName("chapter-list-content")[0].appendChild(a1);
            } else {
                a1 = document.createElement('div');
                a1.className = "row"
                a1.id = i
                a1.innerHTML = '<span><a>' + chapterlist[i][0] + '</a></span><span>' + chapterlist[i][1] + '</span>'
                document.getElementsByClassName("chapter-list-content")[0].appendChild(a1);
            }
        }
        a1 = document.createElement('button');
        a1.className = "downloadbutton"
        a1.id = "downloadbutton"
        a1.innerHTML = "Download"
        document.getElementsByClassName("manga-chapters-info")[0].appendChild(a1);

        document.querySelectorAll('.row:not(.chapters-infos)').forEach(item => item.addEventListener("click", selectchapters, false));
        document.getElementsByClassName("downloadbutton")[0].addEventListener("click", getdownloadchp, false);

        function selectchapters() {
            if (event.shiftKey == true) {
                if (lastid < this.id) {
                    for (let i = Number(lastid) + 1; i < this.id; i++) {
                        document.querySelectorAll('.row:not(.chapters-infos)')[i].classList.toggle("active");
                    }
                    lastid = this.id;
                    document.querySelectorAll('.row:not(.chapters-infos)')[lastid].classList.toggle("active");
                } else if (lastid > this.id) {
                    for (let i = Number(lastid); i > this.id; i--) {
                        document.querySelectorAll('.row:not(.chapters-infos)')[i].classList.toggle("active");
                    }
                    lastid = this.id;
                    document.querySelectorAll('.row:not(.chapters-infos)')[lastid].classList.toggle("active");
                }
            } else {
                lastid = this.id;
                this.classList.toggle("active");
            }
        }

        function getdownloadchp() {
            activedls = [];
            if (document.querySelectorAll('.row.active').length == 0) {
                return alert("Du hast keine Chapter ausgewählt.")
            } else {
                for (let i = 0; i < document.querySelectorAll('.row.active').length; i++) {
                    activedls.push(chapterlist[document.querySelectorAll('.row.active')[i].id])
                }
                scrapedownload.get(activedls, soloval.a2.cache[0][0], formatname, name)
            }
        }
    }
}