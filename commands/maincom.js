const scrape = require('./commands/scrape.js');
let val;
let mangasearchvalue;
let oldvalue;

window.onload = function () {
    document.getElementsByClassName("searchbutton")[0].addEventListener("click", function () {
        getvalue("");
    }, false);
};

async function getvalue(str) {
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
    let x = this.id;
    let url = val.data[x][2]
    let namecache = val.data[x][0]
    let soloval = await scrape.searchsolo(url, namecache)
    document.getElementsByClassName("container")[0].innerHTML = ""
    let start = document.createElement('div');
    start.className = "soloitems"
    document.getElementsByClassName("container")[0].appendChild(start);
    let newitem = document.getElementsByClassName("soloitems")[0]
    let name = soloval.data[0][0]
    let author = soloval.data[0][1]
    let description = soloval.data[0][2]
    let genres = soloval.data[0][3]
    let genrearr = [];
    let status = soloval.data[0][4]
    let lastupdate = soloval.data[0][5]
    let coverimg = soloval.data[0][6]
    let formatname = soloval.data[0][7]
    let altnames = soloval.data[0][8]
    let main;
    let classname;
    let innervalue;
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
                main = 'div'
                classname = "manga_items_info author"
                innervalue = '<a>' + author + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 4:
                main = 'div'
                classname = "manga_items_info status"
                innervalue = '<a>' + status + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 5:
                main = 'div'
                classname = "manga_items_info lastupdate"
                innervalue = '<a>' + lastupdate + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 6:
                main = 'div'
                classname = "manga_items_info genres"
                for (let ii = 0; ii < genres.length; ii++) {
                    let str = genres[ii].replace(/^"|"$/g, '');
                    genrearr.push(str)
                }
                innervalue = '<a>' + genrearr.join(", ") + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i);
            case 7:
                main = 'div'
                classname = "manga_items_info description"
                innervalue = '<a>' + description + '</a>'
                i = document.createElement(main);
                i.className = classname
                i.innerHTML = innervalue
                document.getElementsByClassName("manga-info")[0].appendChild(i); 
        }
    }
    let a2 = document.createElement('div');
    a2.className = "manga-chapters"
    newitem.appendChild(a2);
}