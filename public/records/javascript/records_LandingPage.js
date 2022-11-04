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

const statementGenerator = (isAdmin) => {
    var handlingModal= document.getElementById('hanQM');
    var reqestModal = document.getElementById('reqQM');
    var clientConfirmModal = document.getElementById('incQM');
    var adminConfirmModal = document.getElementById('ficQM');
    var xcModal = document.getElementById('xccQM');
    var associatedReqs = reqestModal.getElementsByTagName('h3');
    var assoicatedSPs = handlingModal.getElementsByTagName('h3');
    var associatedCC = clientConfirmModal.getElementsByTagName('h3');
    var associatedAC = adminConfirmModal.getElementsByTagName('h3');
    var associatedXC = xcModal.getElementsByTagName('h3');
    var spSiblings = `<div class="row">`;
    var allSkusPerSP = `<div class="row">`;
    var allSkusPerReq = `<div class="row">`;
    var spTime ="<samp>Not Available</samp>";
    var reqTime ="<samp>Not Available</samp>";
    var ccTime ="<samp>Not Confirmed Yet</samp>";
    var acTime ="<samp>Not Confirmed Yet</samp>";
    var req_number = "<samp>Not Available</samp>";
    var reqSkus = null;
    var relabel ="<samp>No Relabling</samp>"
    var reqAmArr = [];
    var xcArr = [];
    var reqAmMap = new Map;
    if (assoicatedSPs.length) {
        for (let i = 0; i < assoicatedSPs.length; i++) {
            const ref_number = assoicatedSPs[i].innerText;
            if (ref_number.substring(0,2) == "SP") {
                spSiblings+=`<div class="col-md-3 col-sm-4"><a href="/records/${ref_number}">${ref_number}</a></div>`;
                if (ref_number == targetedNumber) {
                    var skuArr;
                    handlingModal.getElementsByTagName('i')[i].innerText[10] != ":"?skuArr=handlingModal.getElementsByTagName('i')[i].innerText.split("(P): ")[1].split(','):skuArr=handlingModal.getElementsByTagName('i')[i].innerText.split("Collection: ")[1].split(',');
                    spTime = handlingModal.getElementsByClassName("timeStamp")[i].innerText.split(": ")[1];
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
                reqTime = reqestModal.getElementsByClassName("timeStamp")[k].innerText.split(": ")[1];
                reqSkus = reqestModal.getElementsByClassName("action_notes")[k].innerText.split("Colletion: ")[1].split(",");
                reqSkus.pop();
            } else {
                var reqAmBox = "<samp>Not Available</samp>";
                if (reqestModal.getElementsByClassName("action_notes")[k].innerText.split(": ")[2]) {
                    reqAmBox = reqestModal.getElementsByClassName("action_notes")[k].innerText.split(": ")[2];
                }
                if (!reqAmArr.includes(reqAmBox)) {
                    reqAmArr.push(reqAmBox);
                    reqAmMap.set(reqAmBox, [ref_number]);
                } else {
                    var oldArr = reqAmMap.get(reqAmBox);
                    oldArr.push(ref_number);
                    reqAmMap.set(reqAmBox, oldArr);
                }
            }
        };
        reqSkus==null?reqSkus=[]:`reqSkus has ${reqSkus.length} elements`;
        for (let m = 0; m < reqAmArr.length; m++) {
            const amBox = reqAmArr[m];
            const skus = reqAmMap.get(amBox);
            allSkusPerReq += `
            <div class="bg-warning text-center mt-2">
                <a href="/records/${amBox}">
                   ${amBox}
                </a>
            </div>
            `
            for (let l = 0; l < reqSkus.length; l++) {
                const sku = reqSkus[l];
                const skuNoQty = sku.split("(")[0].trim();
                if (skus.includes(skuNoQty)){
                    allSkusPerReq += `
                    <div class="col-md-3 col-sm-4">
                        <a href="/records/${skuNoQty}">${sku}</a>
                    </div>
                `;
                }
            };
        }
        for (let n = 0; n < associatedCC.length; n++) {
            const ref_number = associatedCC[n].innerText.trim();
            if (ref_number == targetedNumber) {
                ccTime = clientConfirmModal.getElementsByClassName("timeStamp")[n].innerText.split(": ")[1];
            }
        }
        for (let o = 0; o < associatedAC.length; o++) {
            const ref_number = associatedAC[o].innerText.trim();
            if (ref_number == targetedNumber) {
                acTime = adminConfirmModal.getElementsByClassName("timeStamp")[o].innerText.split(": ")[1];
            }
        }
        var xcMap = new Map;
        for (let a = 0; a < associatedXC.length; a++) {
            const ref_number = associatedXC[a].innerText.trim();
            const sub_number = xcModal.getElementsByClassName('sub_number')[a].innerText;
            var hisArr = [];
            if (sub_number.includes("SPs")){
                hisArr = JSON.parse(xcModal.getElementsByClassName('action_notes')[a].innerText.split("Notes: ")[1].trim());
            } else {
                var hisArr2 = xcModal.getElementsByClassName('action_notes')[a].innerText.split("Notes: ")[1].split(",");
                hisArr2.pop();
                hisArr2.forEach(i => hisArr.push(`${i.split(" ---> ")[0]}=>${i.split(" ---> ")[1].split(" (")[0]}`));
            }
            if (!xcArr.includes(ref_number)) {
                xcArr.push(ref_number);
                xcMap.set(ref_number, hisArr);
            } else {
                var newArr = xcMap.get(ref_number).concat(hisArr);
                newArr = newArr.filter((c, index) => {
                    return newArr.indexOf(c) === index;
                });
                xcMap.set(ref_number, newArr);
            }
        }
        var xcInfo = "";
        for (let b = 0; b < xcArr.length; b++) {
            const eachLabelCharge = xcArr[b];
            const eachXCArr = xcMap.get(eachLabelCharge);
            eachXCArr.forEach(i => xcInfo+=`<li><a href="/records/${i.split("=>")[0]}">${i.split("=>")[0]}</a><span uk-icon="arrow-right"></span><a href="/records/${i.split("=>")[1]}">${i.split("=>")[1]}</a></li>`);
            relabel = xcInfo;
        }
    };
    var statement;
    if (isAdmin) {
        statement = `
        This container <a href="/records/${targetedNumber}">${targetedNumber}</a> was generated at ${spTime} containing the following SKUs: ${allSkusPerSP}</div> along with its sibling SP boxes: ${spSiblings}</div> under a single REQUEST: <br><a href="/records/${req_number}">${req_number}</a><br>
        The REQUEST was created at ${reqTime}, and the following SKUs were requested out of their associated AM INVENTORY BOX: ${allSkusPerReq}</div>
        <br>
        This <a href="/records/${targetedNumber}">${targetedNumber}</a> was confirmed by the client at ${ccTime}, and received the final confirmation by the admin at ${acTime}.
        <br>
        RELABEL service was engaged: <ul>${relabel}</ul>.
    `;
    } else {
        statement = `此一出库货箱 - <a href="/records/${targetedNumber}">${targetedNumber}</a> 与其内含货品SKU: ${allSkusPerSP}</div> 在 ${spTime} 被管理员从您的要求清单中 (<a href="/records/${req_number}">${req_number}</a>) 汇整出来。
        您的要求清单汇整出的其他出库货箱: ${spSiblings}
        <hr>
        <div class="textcenter">
        您的要求清单(<a href="/records/${req_number}">${req_number}</a>)细目如下 (库存母箱与其SKU):
        <br>
        <small class="text-secondary">纪录时间为${reqTime}</small>
        <br>
        ${allSkusPerReq}</div>
        <br>
        </div>
        <hr>
        <div class="ml-2"><a href="/records/${targetedNumber}">${targetedNumber}</a>${yetOrAlready(ccTime)}被您确认并寄出运输标签</div>
        <br>
        <small class="text-secondary">纪录时间为${ccTime}</small>
        <br>
        <div class="ml-2">并且${yetOrAlready(acTime)}被管理员在出库前做了最后确认。</div>
        <br>
        <small class="text-secondary">纪录时间为${acTime}</small>
        <br>
        <hr>
        <div class="ml-2">换标签服务: <ul>${relabel}</ul><div>
        `
    }
    return statement;
};
const statementHeader = document.getElementById('statmentHeader');
const statementBody = document.getElementById('statementBody');
const translater = document.getElementById('translater');
const statementFormation = (isAdmin) => {
    if (statementHeader.className == "lead text-center") {
        statementHeader.className = "text-primary lead text-center";
        statementBody.style.display = "";
        statementBody.innerHTML = statementGenerator(isAdmin);
    } else {
        statementHeader.className = "lead text-center";
        statementBody.style.display = "none";
    }
};
const yetOrAlready = (time) => {
    if (time.includes("samp")){
        return`<span class="text-danger">还没</span>`
    } return "已经"
};

const panelChange = (e) => {
    if (e.target.id == "spOnly") {
        e.target.className = "uk-button uk-button-secondary";
        document.getElementById("gsOnly").className = "uk-button uk-button-default";
        document.getElementById("grandSearchPanel").style.display = "none";
        document.getElementById("spOnlyPanel").style.display = "";
    } else {
        e.target.className = "uk-button uk-button-secondary";
        document.getElementById("spOnly").className = "uk-button uk-button-default";
        document.getElementById("grandSearchPanel").style.display = "";
        document.getElementById("spOnlyPanel").style.display = "none";
    }
}
