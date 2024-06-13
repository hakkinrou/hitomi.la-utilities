// ==UserScript==
// @name         hitomi.la Utilities
// @author       hakkinrou
// @version      1.0
// @description  Utils addon for hitomi.la, adding features like notes, votes and whatever
// @match        https://hitomi.la/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hitomi.la
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

const REMOVABLE = ["Notes", "Vote"];

var storage = GM_getValue("storage", null);
if(!storage) storage = [];

var interval = setInterval(() => {
    var galleryInfoRef = document.querySelector(".gallery-info");
    var galleryContentRef = document.querySelector(".gallery-content");
    if(galleryContentRef.children.length < 1 || document.getElementById("loader-content")){
        return false;
    }
    galleryInfo(galleryInfoRef);
    galleryContent(galleryContentRef);
    document.addEventListener("visibilitychange", () => { //If user has more than 1 tab open, this ensures sync
        if(!document.hidden){
            storage = GM_getValue("storage", null);
            if(galleryInfoRef){
                for(let i=0;i<galleryInfoRef.children[0].children[0].children.length;i++){
                    if(REMOVABLE.includes(galleryInfoRef.children[0].children[0].children[i].children[0].innerHTML)){
                        galleryInfoRef.children[0].children[0].children[i].remove();
                        i--;
                    }
                }
            }
            for(let doujin of galleryContentRef.children){
                for(let i=0;i<doujin.children[3].children[0].children[0].children.length;i++){
                    if(REMOVABLE.includes(doujin.children[3].children[0].children[0].children[i].children[0].innerHTML)){
                        doujin.children[3].children[0].children[0].children[i].remove();
                        i--;
                    }
                }
            }
            galleryInfo(galleryInfoRef);
            galleryContent(galleryContentRef);
        }
    });
    if(window.location.href.includes("search.html")){ // Little trick that uses the site's function, adding a callback to it
        const old_moveimages = moveimages;
        moveimages = () => {
            old_moveimages();
            galleryInfo(galleryInfoRef);
            galleryContent(galleryContentRef);
        };
    }
    clearInterval(interval);
}, 100);

let createNotesRow = (item, href, usage, node) => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = "Notes";
    let td2 = document.createElement("td");
    let td2Text = document.createElement("p");
    if(item.note){
        td2Text.innerHTML = item.note;
    } else {
        td2Text.innerHTML = "Add Note";
    }
    td2Text.style = "margin-top:0;margin-bottom:0;font-size:14px;font-weight:600;text-transform:none;white-space: break-spaces;display:inline-block;"
    if(!item.note){
        td2Text.style.color = "lightgray";
    }
    td2.append(td2Text);
    tr.append(td1, td2);
    if(usage==="content"){
        node.children[3]?.children[0]?.children[0].append(tr);
    } else if(usage==="info"){
        node.children[0].children[0].append(tr);
    }
    td2Text.addEventListener("click", (event) => {
        td2.innerHTML = "";
        let editNote = document.createElement("textarea");
        editNote.style.width = "400px";
        editNote.style.height = "60px";
        editNote.focus()
        editNote.value = item.note || "";
        td2.append(editNote);
        editNote.focus();
        editNote.addEventListener("focusout", (event) => {
            td2Text.innerHTML = editNote.value || "Add Note";
            item.note = editNote.value;
            updateStorage(item, href);
            td2.append(td2Text);
            if(item.note){
                td2Text.style.color = "";
            } else {
                td2Text.style.color = "lightgray";
            }
            editNote.remove();
        })
    })
}

let createVoteRow = (item, href, usage, node) => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = "Vote";
    let td2 = document.createElement("td");
    let td2Select = document.createElement("select");
    let noneElement = document.createElement("option");
    noneElement.value = "none";
    noneElement.innerHTML = "None";
    td2Select.append(noneElement);
    for(let i=1;i<=10;i++){
        let iElement = document.createElement("option");
        iElement.value = i;
        iElement.innerHTML = i;
        td2Select.append(iElement);
    }
    if(item.vote){
        td2Select.value = item.vote;
    } else {
        td2Select.value = "none";
    }
    // td2Text.style = "margin-top:0;margin-bottom:0;font-size:14px;font-weight:600;text-transform:none;white-space: break-spaces;display:inline-block;"
    td2.append(td2Select);
    tr.append(td1, td2);
    if(usage==="content"){
        node.children[3]?.children[0]?.children[0].append(tr);
    } else if(usage==="info"){
        node.children[0].children[0].append(tr);
    }
    td2Select.addEventListener("change", (event) => {
        item.vote = td2Select.value;
        updateStorage(item, href);
    })
}

let galleryInfo = (galleryInfo) => {
    if(galleryInfo){
        let item = {};
        let href = window.location.href;
        href = href.substring(0, href.lastIndexOf(".html")+5);
        item.href = href;
        for(let storageItem of storage){
            if(storageItem.href===href){
                item = storageItem;
                break;
            }
        }
        createNotesRow(item, href, "info", galleryInfo);
        createVoteRow(item, href, "info", galleryInfo);
    }
};

let galleryContent = (galleryContent) => {
    for(let doujin of galleryContent.childNodes){
        let item = {};
        let href = doujin.childNodes[3]?.childNodes[0]?.href;
        if(!href){
            continue;
        }
        item.href = href;
        for(let storageItem of storage){
            if(storageItem.href===href){
                item = storageItem;
                break;
            }
        }
        createNotesRow(item, href, "content", doujin);
        createVoteRow(item, href, "content", doujin);
    }
};

let updateStorage = (item, href) => {
    storage = storage.filter((doujin) => {
        return item.href!=doujin.href;
    });
    storage.push(item);
    GM_setValue("storage", storage);
}
