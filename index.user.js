// ==UserScript==
// @name         hitomi.la Utilities
// @author       hakkinrou
// @version      1.0.2
// @description  Utils addon for hitomi.la, adding features like notes, votes and whatever
// @match        https://hitomi.la/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hitomi.la
// @downloadURL  https://github.com/hakkinrou/hitomi.la-utilities/raw/main/index.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

const REMOVABLE = ["Notes", "Vote"];

var storage = GM_getValue("storage", null);
if(!storage) storage = [];

function createBackButton(){
    let button = document.createElement("button");
    button.innerHTML = "Back";
    let a = document.createElement("a");
    a.href = "/";
    a.appendChild(button);
    return a;
}

function createDoujinRow(href, vote, note, img) {
    let div = document.createElement("div");
    div.className = "doujin-row";

    // Create image
    let imgElement = document.createElement("img");
    imgElement.src = img;
    imgElement.className = "doujin-img";
    div.appendChild(imgElement);

    // Create link
    let a = document.createElement("a");
    a.href = href;
    a.innerHTML = decodeURIComponent(href);
    a.target = "_blank"; // Open in a new tab
    div.appendChild(a);

    // Handle vote formatting
    if (vote === "none") vote = "None";
    let voteSpan = document.createElement("span");
    voteSpan.className = "doujin-vote";
    voteSpan.innerText = vote;
    div.appendChild(voteSpan);

    // Create note
    let noteSpan = document.createElement("span");
    noteSpan.className = "doujin-note";
    noteSpan.innerText = note;
    div.appendChild(noteSpan);

    // Create delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.className = "doujin-delete";
    deleteBtn.innerHTML = "❌";
    deleteBtn.onclick = () => {
        if(confirm("Do you want to delete this entry?")){
            deleteRow(div);
            storage = storage.filter((doujin) => {
                return href!=doujin.href;
            });
            GM_setValue("storage", storage);
        }
    }
    div.appendChild(deleteBtn);

    return div;
}

function deleteRow(row) {
    row.remove(); // Remove the row from the DOM
}

// Custom page
if (window.location.pathname === "/my-doujins") {
    document.documentElement.innerHTML = "";

    let content = document.createElement("div");
    content.className = "doujin-container";

    // Create header row
    let headerRow = document.createElement("div");
    headerRow.className = "doujin-header";
    headerRow.appendChild(createBackButton());
    headerRow.innerHTML += `
        <span>URL</span>
        <span>Vote</span>
        <span>Note</span>
        <span>Delete</span>
    `;
    content.appendChild(headerRow);

    for (let doujin of storage) {
        content.appendChild(createDoujinRow(doujin.href, doujin.vote, doujin.note, doujin.img));
    }

    document.body.append(content);
}

/* CSS */
const style = document.createElement('style');
style.innerHTML = `
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .doujin-container {
        width: 90%;
        max-width: 1000px;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        padding: 20px;
    }

    /* Header styling */
    .doujin-header {
        display: grid;
        grid-template-columns: 138px 1fr 100px 150px 64px;
        gap: 16px;
        padding: 12px;
        background-color: #e9ecef;
        border-bottom: 2px solid #ddd;
        font-weight: bold;
        color: #555;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .doujin-row {
        display: grid;
        grid-template-columns: 140px 1fr 100px 150px 64px;
        gap: 16px;
        padding: 12px;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s ease;
        align-items: center;
    }

    .doujin-row:hover {
        background-color: #f9f9f9;
    }

    .doujin-row:last-child {
        border-bottom: none;
    }

    .doujin-img {
        width: 128px;
        height: 128px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
    }

    .doujin-img:hover {
        transform: scale(1.05);
    }

    a {
        color: #007BFF;
        text-decoration: none;
        font-weight: bold;
        word-break: break-word;
        overflow-wrap: break-word;
        transition: color 0.2s ease;
    }

    a:hover {
        color: #0056b3;
    }

    .doujin-vote, .doujin-note {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f1f1f1;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        color: #555;
    }

    .doujin-vote {
        background-color: #e9f7ef;
        color: #2e7d32;
        font-weight: bold;
    }

    .doujin-note {
        background-color: #fff3cd;
        color: #856404;
    }

    /* Delete button */
    .doujin-delete {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        padding: 6px;
        border-radius: 6px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s ease;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .doujin-delete:hover {
        background-color: #f1b0b7;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
        .doujin-header {
            display: none;
        }

        .doujin-row {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 10px;
        }

        .doujin-img {
            width: 100%;
            height: auto;
            border-radius: 6px;
        }

        a, .doujin-vote, .doujin-note, .doujin-delete {
            justify-content: flex-start;
            font-size: 14px;
            padding: 4px;
        }

        .doujin-delete {
            width: 100%;
        }
    }
`;
if(window.location.pathname === "/my-doujins"){
    document.head.appendChild(style);
}

// Improve and enhance hitomi's UI
if(window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"))!=="/reader"){
    let navbar = document.querySelector(".navbar");
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = "/my-doujins";
    a.innerHTML = "My Doujins";
    li.appendChild(a);
    navbar.children[1].children[0].appendChild(li);
    navbar.classList.remove("navbar");
    navbar.style = "background-color: #817aa3; display: flex; align-items: center;";
}

var galleryInfoRef = document.querySelector(".gallery-info");
var galleryContentRef = document.querySelector(".gallery-content");
const old_moveimages = moveimages;
moveimages = () => {
    old_moveimages();
    galleryInfo(galleryInfoRef);
    galleryContent(galleryContentRef);
};
window.addEventListener("visibilitychange", () => { //If user has more than 1 tab open, this ensures sync
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
            for(let i=0;i<doujin.children[3]?.children[0]?.children[0]?.children?.length;i++){
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
        item.note = item.note || "";
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
        item.img = document.querySelector("#bigtn_img").src;
        for(let storageItem of storage){
            if(storageItem.href===href){
                updateStorage(item, href); // Update for images
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
        // console.log(doujin.children[0].children[0].children[0].children[0].children[1]); // Image is lazyloaded, so we can't get it easily here
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
