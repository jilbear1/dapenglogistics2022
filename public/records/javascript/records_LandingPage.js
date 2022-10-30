console.log(location.href, 'records_LandingPage.js');
const url = location.href.split('/');
var targetedNumber = url[url.length-1].toUpperCase();
if (targetedNumber.includes("%")) {
    targetedNumber = targetedNumber.split("%")[0].toUpperCase();
};
const searchBtn = () => {
    const input = document.getElementById("keyWordSearch").value;
    input.length < 1?alert('Cannot search with an empty input!'):location.replace(`../records/${input}`);
};
const target_data = (target_number) => {
    var isSP = false;
    var type = "container";
    if (targetedNumber.substring(0,2) == "SP") {
       isSP = true;
    } else if (targetedNumber.substring(0,2) == "RE" || targetedNumber.substring(0,2) == "TE" || targetedNumber.substring(0,2) == "AM" || targetedNumber.substring(0,2) == "AC") {} else {
       type = "box"
    }
    dataFetch(target_number, isSP, type);
};
const dataFetch = (target_number, isSP, type) => {
    fetch(`/api/${type}/boxDataUsingNumber/${target_number}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        message(data.status, isSP);
    });
};
const message = (key, isSP) => {
    let message = null;
    switch (key) {
        case 0:
            message = "Pending"
            break;
        case 1:
            isSP?message = "Waiting for client confirmation":message ="Received"
            break;
        case 2:
            isSP?message = "Waiting for admin confirmation":message="Requested"
            break;
        case 3:
            message = "Completed"
            break;
        case 4:
            message = "Relabel Charge"
            break;
        case 5:
            message = "Charge Billed"
            break;
        case 98:
            message = "Archived"
            break;
        default:
            message = "Not Available"
            break;
    }
    UIkit.notification({
        message: `${targetedNumber}<hr>${message}`,
        status: 'primary',
        pos: 'top-right',
        timeout: 60000
    });
};
targetedNumber.length>0?target_data(targetedNumber):UIkit.notification({
    message: `Record Page`,
    status: 'primary',
    pos: 'top-right',
    timeout: 3000
});

var handlingModal= document.getElementById('hanQM');
var reqestModal = document.getElementById('reqQM');
var associatedReqs = reqestModal.getElementsByTagName('h3');
var assoicatedSPs = handlingModal.getElementsByTagName('h3');
var spSiblings = `<div class="row">`;
var allSkusPerSP = `<div class="row">`;
var spTime = null;
var reqTime = null;
var req_number = null;
for (let i = 0; i < assoicatedSPs.length; i++) {
    const ref_number = assoicatedSPs[i].innerText;
    if (ref_number.substring(0,2) == "SP") {
        spSiblings+=`<div class="col-md-3 col-sm-4"><a href="/records/${ref_number}">${ref_number}</a></div>`;
        if (ref_number == targetedNumber) {
            var skuArr;
            handlingModal.getElementsByTagName('i')[i].innerText[10] != ":"?skuArr=handlingModal.getElementsByTagName('i')[i].innerText.split("(P): ")[1].split(','):skuArr=handlingModal.getElementsByTagName('i')[i].innerText.split("Collection: ")[1].split(',');
            spTime = handlingModal.getElementsByClassName("timeStamp")[i].innerText;
            req_number = handlingModal.getElementsByClassName("sub_number")[i].innerText.split("(")[0];
            skuArr.pop();
            for (let j = 0; j < skuArr.length; j++) {
                const sku = skuArr[j];
                allSkusPerSP+=`<div class="col-md-3 col-sm-4"><a href="/records/${sku.split("(")[0].trim()}">${sku}</a></div>`;
            }
        }
    }
};
for (let k = 0; k < associatedReqs.length; k++) {
    const ref_number = associatedReqs[k].innerText;
    if (ref_number.substring(0,6) == req_number.substring(0,6)) {
        reqTime = reqestModal.getElementsByClassName("timeStamp")[k].innerText;
    }

}

const statement = `
This <a href="/records/${targetedNumber}">${targetedNumber}</a> was generated at ${spTime} with the following SKUs: ${allSkusPerSP}</div> along with its sibling SP boxes: ${spSiblings}</div> under a single REQUEST: <br><a href="/records/${req_number}">${req_number}</a><br>
The associated REQ was requested at ${reqTime} with the following SKUs. EACH SKU came from associated AM INVENTORY BOX.
<br>
This <a href="/records/${targetedNumber}">${targetedNumber}</a> was confirmed by the client at TIME 3, and received the final confirmation by admin at TIME 4
<br>
Relabel service was engaged when the admin handling the client’s request at TIME 5. SKU CHNAGED TO SKU 2.
`


const statementHeader = document.getElementById('statmentHeader');
const statementBody = document.getElementById('statementBody');
const statementFormation = () => {
    if (statementHeader.className == "lead") {
        statementHeader.className = "text-primary lead";
        statementBody.style.display = ""
        statementBody.innerHTML = statement;
    } else {
        statementHeader.className = "lead";
        statementBody.style.display = "none";
    }
}
