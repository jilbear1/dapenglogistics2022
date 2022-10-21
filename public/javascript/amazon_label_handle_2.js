console.log("type_2");
const promises = [];
var alreadyCalculated = false;
function masterFunction(id, type) {
    const code =  prompt(`Please enter the passcode to confirm the ${type.toUpperCase()} of REQ box (id: ${id})`);
    if (code == '0523') {
        if (type == 'delete') {
            if (confirm('Friednly reminder: all items assocaited with this REQ box will be removed!')) {
                updateReqContainer(id);
            }
        } else if (type == 'reverse') {
            if (confirm('Friednly reminder: all items assocaited with this REQ box will be returned back to original AM boxes!')) {
                reverseConfirm(id)
            }
        } else if (type == 'merge') {
            if (confirm('Friednly reminder: all items which get merged from will permanently be disconnected from their original boxes!')) {
                alreadyCalculated?combinePostCal(id):combinePreCal(id);
            }
        }
    } else if (code && code != '0523') {
        alert('Incorrect passcode!')
    }
};

const combinePreCal = (id) => {
    fetch(`/api/item/findAllPerContainer/${id}`, {
        method: 'GET'
    }).then((response) => {
        return response.json();
    }).then((items) => {
        const itemsArr = [];
        const duplicateArr = [];
        var itemQtyMap = new Map();
        for (let b = 0; b < items.length; b++) {
            const item = items[b];
            const index = itemsArr.indexOf(item.item_number);
            if (index < 0) {
                itemsArr.push(item.item_number);
                itemQtyMap.set(item.item_number, item.qty_per_sku)
            } else {
                itemQtyMap.set(item.item_number, itemQtyMap.get(item.item_number) + item.qty_per_sku)
                duplicateArr.push(item.id)
            }
        }
        if (duplicateArr.length) {
            removeItems(duplicateArr, id, itemsArr, itemQtyMap)
        } else {
            alert('The merging function is not valid in this request card!')
        }
    })
}
const removeItems = async (removeables, container_id, itemsArr, itemQMap) => {
    const update_promises = [];
    const response = await fetch(`/api/item/bulkDestroy/`, {
        method: 'DELETE',
        body: JSON.stringify({
            id: removeables
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
        for (let p = 0; p < itemsArr.length; p++) {
            const item_number = itemsArr[p];
            const qty_per_sku = itemQMap.get(item_number);
            update_promises.push(mergeExistedItem(container_id, item_number, qty_per_sku))
        };
        Promise.all(promises).then(() => {
            location.reload();
        }).catch((e) => {console.log(e)})
    }
}

const mergeExistedItem = async (container_id, item_number, qty) => {
    const payload = await fetch(`/api/item/updateQty_ExistedItem/${container_id}&${item_number}`, {
        method: 'PUT',
        body: JSON.stringify({
            qty_per_sku: qty
        }),
        headers: {'Content-Type': 'application/json'}
    })
}

const combinePostCal = (id) => {
    UIkit.notification({message: 'The drag & drop merger is initiated', pos: 'top-center'})
    console.log('postCal');
    document.querySelectorAll('tr').forEach(i => {
        i.draggable = true;
    })
}
const drag = (ev) => {
    ev.dataTransfer.setData("text", ev.target.id);
};
function allowDrop(ev) {
  ev.preventDefault();
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text").split('_')[1];
    const target_id = ev.target.parentElement.id.split('_')[1];
    if (data != target_id) {
        !skuArr.includes(data)?skuArr.push(data):console.log('array already has "from id" (qty update)');
        !skuArr.includes(target_id)?skuArr.push(target_id):console.log('array already has "to to" (qty update)');
        const target_qty = parseInt(document.getElementById(`qty_${target_id}`).innerHTML);
        const targetNewQty = target_qty + parseInt(document.getElementById(`qty_${data}`).innerText);
        document.getElementById(`qty_${target_id}`).innerHTML = targetNewQty;
        document.getElementById(`qty_${data}`).innerHTML = 0;
        skuOldMap.set(data, 0);
        skuOldMap.set(target_id, targetNewQty);
    }
};

async function updateReqContainer(container_id) {
    const id = container_id;
    const response = await fetch(`/api/container/destroyBulk`, {
        method: 'DELETE',
        body: JSON.stringify({
            id: id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        alert('this requested container has been confirmed for deletion!');
        location.reload();
    }

};
//////////////////////////
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *charactersLength));
    }
   return result;
};
//bpp: # box/pallet
//upb: # unit/box
//ipu: # item/unit
const putBack = (id, n, sp, ev, bpp, indexPal, old_item_n, new_item_n, upb) => {
    console.log('before change (pallet count): ' + palletCount);
    console.log('before change: ' + spArr);
    console.log('before change: ' + skuOldMap.get(id) + ` + ${n}`);
    console.log('before change (pallet numbers): ' + indexArr);
    console.log('before change (xc qty count): ' + xcQtyCount);
    ev.preventDefault();
    ev.target.parentElement.parentElement.remove();
    const returnQty = parseInt(document.getElementById(`qty_${id}`).innerHTML) + parseInt(n);
    document.getElementById(`qty_${id}`).innerHTML = returnQty;
    spArr = spArr.filter(i => i != sp);
    skuOldMap.set(id, skuOldMap.get(id) + n);
    masterCheck ();
    palletCount-=(1/bpp);
    indexArr = indexArr.filter(i => i != indexPal);
    console.log('after change: ' + spArr);
    console.log('after change: ' + skuOldMap.get(id));
    console.log('after change (pallet count): ' + palletCount);
    console.log('after change (pallet numbers): ' + indexArr);
    if (old_item_n != new_item_n) {
        xcQtyCount -= upb;
        skuRecord = skuRecord.filter(i => i != `${old_item_n}=>${new_item_n}`)
        console.log('after change (xc qty count): ' + xcQtyCount);
    }
    const nextClick = document.querySelector(`.index${indexPal}`);
    if (palletized) {
        nextClick?nextClick.click():console.log(`put back all box associated with P${indexPal}`);
    }
}
var indexP = 1;
var indexCount = 0;
var spPalletMap = new Map();
var indexArr = [];
const id_generator = (parent, num, item_number, upb, ipu, bpp, oldItemId, oldItemNumber) => {
    indexCount++;
    var pad = "000";
    var ans = pad.substring(0, pad.length - num.toString().length) + num.toString();
    var instance = parseInt(parent.id) + makeid(3) + ans;
    const select = document.createElement('td');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const td_1 = document.createElement('td');
    const td_2 = document.createElement('td');
    const td_3 = document.createElement('td');
    parent.appendChild(tr);
    tr.appendChild(select);
    tr.appendChild(td);
    tr.appendChild(td_1);
    tr.appendChild(td_2);
    tr.appendChild(td_3)
    select.innerHTML = `<a class="text-danger index${indexP}" onclick="putBack('${oldItemId}', ${upb*ipu}, 'SP${instance}', event, '${bpp}', ${indexP}, '${oldItemNumber}', '${item_number}', ${upb})">&#10060</a>`
    td.innerHTML = `SP${instance}`;
    td_1.innerHTML = item_number;
    td_2.innerHTML = `<b>${upb}</b>`;
    if (palletized) {
        td_3.innerHTML = `P${indexP}`;
    }
    spMap.set(`SP${instance}`, item_number);
    skuNewMap.set(`SP${instance}${item_number}`, upb);
    spPalletMap.set(`SP${instance}`, indexP);
    spArr.push(`SP${instance}`);
    indexArr.includes(indexP)?console.log(indexP + " already in array"):indexArr.push(indexP);
    if (indexCount == bpp) {
        indexP++;
        indexCount = 0;
    }
}
var skuArr = [];//check old items
var spArr = [];//create a series of new SP box
var skuOldMap = new Map();//update old inventory
var skuNewMap = new Map();//create new item
var spMap = new Map();//create new relation with item
const evt_trigger = (item_number, int, container_id, item_id, ev) => {
    ev.preventDefault();
    reqBoxInfoFetcher(container_id);
    indexCount = 0;
    const parentId = ev.target.parentElement.parentElement.id.split('_')[1];
    int = parseInt(document.getElementById(`qty_${parentId}`).innerHTML);
    getXC(container_id)
    var merging_ratio = prompt(`Total Quantity: ${int} items of ${item_number}. How many item will be merged into EACH UNIT (choose a whole number between 1 to ${int}; default: 1 item = 1 unit)?`);//important question
    if (parseInt(merging_ratio)>0 && parseInt(merging_ratio)<=int) {
        merging_ratio=parseInt(merging_ratio)
    } else {
        merging_ratio=1
    }
    const totalUnit = Math.floor(int/merging_ratio);
    var qty_ans = prompt(`Total Units: ${totalUnit} units of packed (${merging_ratio}) ${item_number}. How many units will be placed into EACH SP BOX  (choose a whole number between 1 to ${totalUnit}; default: 1 box)?`);//important question
    if (parseInt(qty_ans)>0 && parseInt(qty_ans)*merging_ratio <= int) {
        qty_ans=parseInt(qty_ans)
    } else {
        qty_ans=1
    }
    const totalBox = Math.floor(totalUnit/qty_ans);
    var pallet_ratio = prompt(`Total Boxes: ${totalBox} boxes of boxed (${qty_ans} units of packed ${merging_ratio} ${item_number}). How many SP boxes will be placed into EACH PALLET  (choose a whole number between 1 to ${totalBox}; default: 1 pallet)?`);//important question
    if (parseInt(pallet_ratio)>0 && pallet_ratio*qty_ans*merging_ratio <= int) {
        pallet_ratio=parseInt(pallet_ratio)
    } else {
        pallet_ratio=1
    }
    const thisCard = document.getElementById(`radio_${item_id}_${container_id}`).parentElement.parentElement.parentElement.parentElement.parentElement;
    const create_form = thisCard.querySelector('form');
    const tbody = create_form.querySelector('tbody');
    !skuArr.includes(item_id)?skuArr.push(item_id):console.log(item_id + "already exists");
    const cardCollection = document.querySelectorAll('.card_collection');
    cardCollection.forEach(i => {i.id==`thisCard_${container_id}`?console.log('one card focus mode'):i.remove();});
    const resultInfo = document.createElement('div');
    document.getElementById(`thisCard_${container_id}`).prepend(resultInfo);
    document.getElementById(`thisCard_${container_id}`).className = 'col-6 card_collection uk-animation-fade';
    const totalPallet = Math.floor(totalBox/pallet_ratio);
    const masterTotalBox = totalPallet*pallet_ratio;
    const itemsPerPallet = merging_ratio*qty_ans*pallet_ratio;
    const unitsPerPallet = qty_ans*pallet_ratio;
    //const masterRemainder = Math.floor(((int/(merging_ratio*qty_ans*pallet_ratio)) - totalPallet)*itemsPerPallet);
    const masterRemainder = int - (totalPallet*itemsPerPallet);
    skuOldMap.set(item_id, masterRemainder);
    palletCount+=totalPallet;
    //100/4 = 25
    const new_item_number = skuFilter(item_number, unitsPerPallet*totalPallet);
    for (let i = 0; i < masterTotalBox; i++) {
        id_generator(tbody, i, new_item_number, qty_ans, merging_ratio, pallet_ratio, item_id, item_number);
    };
    // palletMap.set(skuFilter(item_number,0), totalPallet);
    resultInfo.innerHTML = `<ul class="text-success">
        <h4>Fact Check: <i class="text-primary">${item_number}</i></h4>
        <li>${merging_ratio} old items for 1 new unit (new sku)</li>
        <li>${qty_ans} new units for 1 SP box</li>
        <li>${pallet_ratio} SP boxes for 1 pallet</li>
        <hr>
        <li>Total of <b class="text-primary">${totalPallet} pallet(s)</b></li>
        <li>Total of <b class="text-primary">${masterTotalBox} boxes</b></li>
        <li>Remainder: ${masterRemainder} old items</li>
    </ul>`
    masterRemainder>0?alert(`${masterRemainder} items are insufficient for another pallet`):null;
    document.getElementById(`qty_${item_id}`).innerHTML = masterRemainder;
    create_form.style.display = '';
    console.log(`The end of the calculation for ${item_number}; remainder = ${skuOldMap.get(item_id)}`);
    // document.getElementById(`radio_${item_id}_${container_id}`).onclick = null;
    alreadyCalculated = true;
    masterCheck();
}
///////////
var oldsku,newsku
const filterLoader = async (n) => {
    await fetch(`/api/record/skufilter/${n}`, {
        method: 'GET'
    }).then(function (response) {
        if (response.status != 200){
            return null
        } else {
            return response.json();
        }
    }).then(function (data) {
        if (data.length) {
            loadingFilterOp(data);
        }
    })
};
const mapinngOptions = document.getElementById('mapping options')
const loadingFilterOp = (dataArr) => {
    for (let i = 0; i < dataArr.length; i++) {
        const tr = document.createElement('tr');
        const td_1 = document.createElement('td');
        const td_2 = document.createElement('td');
        const item = dataArr[i];
        const input = document.createElement('input');
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.innerHTML =item.action_notes;
        input.className = 'form-check-input';
        input.type = 'radio';
        input.name = 'mappingOptions';
        input.value = item.action_notes;
        input.setAttribute('onclick',`initskuchange(${item.action_notes}, ${item.id})`);
        tr.appendChild(td_1);
        tr.appendChild(td_2);
        td_1.appendChild(input);
        td_2.appendChild(label);
        mapinngOptions.appendChild(tr);
        if (i == 0 && !localStorage.getItem('filter_history')) {
            localStorage.setItem('filter_history', item.id)
            input.checked = true//default checked filter is the most recent linkage
            initskuchange(JSON.parse(item.action_notes), item.id)
        } else {
            if (item.id == localStorage.getItem('filter_history')) {
                input.checked = true;
                initskuchange(JSON.parse(item.action_notes), item.id)
            }
        }
    }
}
const initskuchange = (str, id) => {
    console.log(`swtich to ${str}`);
    localStorage.setItem('filter_history', id)
    var arr = str.split('=>');
    oldsku = arr[0].split(',');
    newsku = arr[1].split(',');
}

///main sku replacement occurs here
var skuRecord = [];
const skuFilter = (input, n) => {
    var index;
    oldsku?index=oldsku.indexOf(input):index=-1;
    if (index>-1 && filterAuthFunction() && newsku[index]) {
        xcQtyCount = xcQtyCount + n;
        console.log("xc qty count + "+xcQtyCount);
        !skuRecord.includes(`${input}=>${newsku[index]}`)?skuRecord.push(`${input}=>${newsku[index]}`):console.log(`${input}=>${newsku[index]} + 1`);
        return newsku[index]
    } else {
        return input
    }
};

///filter yes or no
const allowCheckBox = document.getElementById('allowFilter');
const palletizeCheckBox = document.getElementById("palletizeCheckBox");
const filterAuthFunction = () => {
    if (allowCheckBox.checked) {
        return true
    } else {
        return false
    }
};
const palletizeAuthFunction = () => {
    if (palletizeCheckBox.checked) {
        palletized = true
    } else {
        palletized = false;
        palletizeCheckBox.disabled = true;//need more test before allowing on and off
        console.log('turn off palletization');
    }
};
const applyAllAuthFunction = (id) => {
    const applyAllCheckBox = document.getElementById(`applyAllCheckBox${id}`);
    if (applyAllCheckBox.checked) {
        applyAll = true;
        console.log('apply all ON');
    } else {
        applyAll = false;
        console.log('apply all OFF');
    }
};
////master check function//////
let length, height, weight, width;
function masterCheck () {
    length = document.getElementById('new_len');
    height = document.getElementById('new_hei');
    weight = document.getElementById('new_wei');
    width = document.getElementById('new_wid');
    const bigTable = document.getElementsByClassName('bigTable');
    if (length.value && height.value && weight.value && width.value && bigTable[0].querySelectorAll('td').length) {
        document.getElementById('order_pre-check').style.display = '';
        document.getElementById('fake').style.display = 'none';
        printCheck = false;
    } else {
        document.getElementById('order_pre-check').style.display = 'none'
        document.getElementById('fake').style.display = '';
    }
};
//////get additional charge
var xcQtyCount = 0;
var xcExist = false;
var xcObject = new Object();
const getXC = async (container_id) => {
    await fetch(`/api/container/fba/LR${container_id}`, {
        method: 'GET'
    }).then(function (response) {
        if (response.status != 200) {
            return null
        } else {
            return response.json();
        };
    }).then(function (data) {
        if (data) {
            if (!xcExist) {
                xcExist = true;
                xcQtyCount+= parseInt(data.qty_of_fee);
                xcObject.notes = data.notes;
                xcObject.description = data.description;
                console.log(`xc qty count (history pulls ${parseInt(data.qty_of_fee)}) associated with this Req: ${xcQtyCount}`);
            } else {
                console.log(`current xc qty count: ${xcQtyCount}`);
            }
        } else {
            console.log('no xc yet');
        }
    })
};
filterLoader (10);
var palletCount = 0;
// var palletMap = new Map();
var palletized = true;//************ */
var applyAll = true;//************* */
const shipment_init = (container_id, user_id, account_id) => {
    if (palletized) {
        const pallet_modal_btn = document.getElementById(`pallet_confirm_btn${container_id}`);
        const pallet_modal_content = document.getElementById(`pallet_confirm_${container_id}`).querySelector('ul');
        pallet_modal_content.querySelectorAll('li').forEach(i => i.remove());
        palletCount = Math.round(palletCount);
        for (let p = 0; p < indexArr.length; p++) {
            const pNumber = indexArr[p];
            const list = document.createElement('li');
            pallet_modal_content.appendChild(list);
            const plength = 48;
            const pwidth = 40;
            const pheight = (height.value.trim()*spArr.length/palletCount).toFixed(2);
            const pweight = (weight.value.trim()*spArr.length/palletCount + 30).toFixed(2);
            list.innerHTML = `<div class="row">
            <div class="col">
                <h5>P${pNumber}</h5>
            </div>
            <div class="col">
                <label for="length">Length</label>
                <input type="number" class="form-control pallet_length" id='${pNumber}_len' value='${plength}' placeholder="inch" onkeyup="sync(event)">
            </div>
            <div class="col">
                <label for="width">Width</label>
                <input type="number" class="form-control pallet_width" id='${pNumber}_wid' value='${pwidth}' placeholder="inch" onkeyup="sync(event)">
            </div>
            <div class="col">
                <label for="height">Height</label>
                <input type="number" class="form-control pallet_height" id='${pNumber}_hei' value='${pheight}' placeholder="inch" onkeyup="sync(event)">
            </div>
            <div class="col">
                <label for="weight">Weight</label>
                <input type="number" class="form-control pallet_weight" id='${pNumber}_wei' value='${pweight}' placeholder="lb" onkeyup="sync(event)">
            </div>
        </div>`
        }
        pallet_modal_btn.click();
    } else {
        const pallet_batch = prompt('Add a pallet number (optional)?');
        pallet_batch?container_id=container_id+`p${pallet_batch}`:container_id=container_id;
        shipment_next(container_id, user_id, account_id, null)
    }
};

const sync = (ev) => {
    ev.preventDefault();
    if (applyAll) {
        for (let k = 0; k < document.getElementsByClassName(ev.target.className).length; k++) {
            const element = document.getElementsByClassName(ev.target.className)[k];
            element.value = ev.target.value;
        }
    }
    if (ev.target.value<0) {
        ev.target.value=1;
        error();
        UIkit.notification({message: 'The input value should be greater than 0', pos: 'top-center'});
    }
};
function error() {
    var audio = new Audio('../media/wrong.mp3');
    audio.play();
  };
const shipment_next = (container_id, user_id, account_id, event) => {
    if (event) {
        event.preventDefault();
        event.target.style.display = 'none';
        document.getElementById('spinner_2').style.display = '';
    }
    document.getElementById('order_pre-check').style.display = 'none';
    document.getElementById('spinner').style.display = '';
    const foregin_key = new Object();
    foregin_key.container_id = container_id;
    foregin_key.user_id = user_id;
    foregin_key.account_id = account_id;
    for (let i = 0; i < spArr.length; i++) {
       shippmentCreate(spArr[i], foregin_key)
    };
    update_init();
    xcQtyCount>0?promises.push(xcGenerator(foregin_key)):console.log('no label change');
    Promise.all(promises).then(() => {
        console.log('done');
    }).catch((e) => {console.log(e)})
};

const piArr=[];
const piMap = new Map();
function shippmentCreate(sp_number, foregin_key) {
    const sp_box = new Object;
    sp_box.length = length.value.trim()*2.54;
    sp_box.width = width.value.trim()*2.54;
    sp_box.height = height.value.trim()*2.54;
    sp_box.weight = weight.value.trim()*0.45;
    sp_box.volume = sp_box.width*sp_box.height*sp_box.length;
    sp_box.container_number = sp_number;
    sp_box.type = 3;
    sp_box.user_id = foregin_key.user_id;
    sp_box.account_id = foregin_key.account_id;
    if (palletized) {
        const pi = spPalletMap.get(sp_number); //pallet index
        const phei = document.getElementById(`${pi}_hei`).value;
        const pwid = document.getElementById(`${pi}_wid`).value;
        const pleng = document.getElementById(`${pi}_len`).value;
        const pwei = document.getElementById(`${pi}_wei`).value;
        if (!piArr.includes(pi)) {
            piArr.push(pi);
            const uuid = makeid(4);
            sp_box.custom_1 = `${pi}*${pleng}*${pwid}*${phei}*${pwei}*${uuid}`;
            console.log(`${pi}*${pleng}*${pwid}*${phei}*${pwei}*${uuid}`);
            piMap.set(pi, uuid);
            sp_box.tracking = `${foregin_key.container_id}_${uuid}`;
        } else {
            sp_box.custom_1 = `${pi}*${pleng}*${pwid}*${phei}*${pwei}*${piMap.get(pi)}`;
            sp_box.tracking = `${foregin_key.container_id}_${piMap.get(pi)}`;
            console.log(`${pi}*${pleng}*${pwid}*${phei}*${pwei}*${piMap.get(pi)}`);
        }
    } else {
        sp_box.costum_1 = null;
        sp_box.tracking = foregin_key.container_id
    }
    promises.push(boxCreate(sp_box))
};
async function boxCreate(data) {
    console.log('boxCreate');
    boxCreateIndex++;
    const response = await fetch('/api/container/amazon_box', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
       console.log("amazon box inserted");
       findContainerId(data);
      } else {
        alert('try again')
   }
};
const xcGenerator = async (data) => {
    if (xcExist) {
        const newfba = `LR${data.container_id}`;
        var itemDescription=JSON.parse(xcObject.description.split('Items: ')[1]);
        const response = await fetch('/api/container/xc_LabelChangeUpdate', {
            method: 'PUT',
            body: JSON.stringify({
                fba:newfba,
                qty_of_fee: xcQtyCount,
                description: `AM Relabel Services - ${xcQtyCount} Items: ${JSON.stringify(skuRecord.concat(itemDescription))}`,////could be more deatil
                notes: `Label Change (Qty: ${xcQtyCount}); Batch# ${data.container_id}; Date: ${new Date().toLocaleDateString("en-US")}`,

            }),
            headers: { 'Content-Type': 'application/json' }
        });
        response.ok?console.log('xc_charge updated sucessfully'):console.log('fail to update the xc_chagre');
    } else {
        const ref_code = "AC" + parseInt(String(new Date().valueOf() + Math.floor(1000000000 + Math.random() * 9000000000)).substring(4, 11));
        const response = await fetch('/api/container/xc_LabelChange', {
            method: 'post',
            body: JSON.stringify({
                user_id: data.user_id,
                account_id: data.account_id,
                container_number: ref_code,
                qty_of_fee: xcQtyCount,
                description: `AM Relabel Services - ${xcQtyCount} Items: ${JSON.stringify(skuRecord)}`,
                notes: `Label Change (Qty: ${xcQtyCount}); Batch# ${data.container_id}; Date: ${new Date().toLocaleDateString("en-US")}`,
                fba: 'LR' + data.container_id,
            }),
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
           console.log("new xc_charge is inserted");
          } else {
            alert('try again')
       }
    }
};
function findContainerId(sp_object) {
    console.log('getting container_id');
    fetch(`/api/container/amazon_container/${sp_object.container_number}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log('container_id fetched');
        sp_object.id = data.id
        console.log(data.id);
        itemCreate(sp_object)
    })
};
function itemCreate(sp) {
    console.log('itemCreate');
    const item = new Object()
    item.item_number = spMap.get(sp.container_number);
    item.qty_per_sku = parseInt(skuNewMap.get(`${sp.container_number}${item.item_number}`));
    item.user_id = sp.user_id;
    item.account_id = sp.account_id;
    item.container_id = sp.id;
    item.description = sp.description;
    promises.push(loadingRecord(prepareRecord(sp, item, 'sp')));
    promises.push(loadingRecord(prepareRecord(sp, item, 'sku')));
    promises.push(loadingItems(item))
};
async function loadingItems(data) {
    const response = await fetch('/api/item/new', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        finishlineIndex++;
        console.log('finished new item insert: ' + finishlineIndex + ' item(s)');
        beforeRefresh();
    }
};

const update_init = () => {
    console.log('update qty/remove 0-qty item init!');
    for (let j = 0; j < skuArr.length; j++) {
        const item_id = skuArr[j];
        if (skuOldMap.get(item_id) == 0) {
           promises.push(deleteItem(item_id))
        } else {
           promises.push(updateItem(item_id))
        }
    }
};
const deleteItem = async (item_id) => {
    console.log('bulk removal');
    const response = await fetch(`/api/item/bulkDestroy/`, {
      method: 'DELETE',
      body: JSON.stringify({
        id: item_id
        }),
      headers: {'Content-Type': 'application/json'}
    });
    response.ok?console.log("item with id: " + item_id + " removed"):console.log('failed to remove 0-qty item');
};
const updateItem = async (item_id) => {
    const response = await fetch(`/api/item/updateQtyPerItemId/${item_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          qty_per_sku: skuOldMap.get(item_id)
          }),
        headers: {'Content-Type': 'application/json'}
    });
    response.ok?console.log(`item qty with id ${item_id} has been updated to ${skuOldMap.get(item_id)}`):console.log("failed to update qty");
}

var boxCreateIndex = 0;
var finishlineIndex = 0;
const beforeRefresh = () => {
 if (boxCreateIndex == finishlineIndex) {
    console.log('all tasks done. ready to refresh');
    location.reload();
 } else {
    console.log(`${boxCreateIndex} Boxes Created and ${finishlineIndex} Items Inserted`);
 }
}


var startPoint = 0;
var endPoint = 0;
async function self_destroy(container_id) {
    const id = container_id;
    const response = await fetch(`/api/container/destroyBulk`, {
        method: 'DELETE',
        body: JSON.stringify({
            id: id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('self-delete done');
        location.reload();
    }

};
const reversePromises = [];
const reverseConfirm = (container_id) => {
    fetch(`/api/item/findAllPerContainer/${container_id}`, {
        method: 'GET'
    }).then((response) => {
        return response.json();
    }).then((data) => {
        record_action_reverse(data, reversePromises);
        Promise.all(reversePromises).then(() => {
            console.log('record insert!');
            for (let i = 0; i < data.length; i++) {
                startPoint++;
                const container_number = data[i].description.split(':')[0];
                fetch(`/api/container/amazon_container/${container_number}`, {
                    method: 'GET'
                }).then((r) => {
                    return r.json();
                }).then((d) => {
                    const parentContainerId = d.id;
                    const parentAccountId = d.account_id;
                    duplicatationValidator(data[i], parentContainerId, container_id, parentAccountId)
                })
            }
        }).catch((e) => {console.log(e)})
    })
};
async function duplicatationValidator(obj, ContainerId, oldContainerId, parentAccountId) {
    await fetch(`/api/item/itemValidation/${obj.item_number}&${ContainerId}`, {
        method: 'GET'
    }).then((response) => {
        if (response.status != 200) {
            return null;
        } else {return response.json()}
    }).then((data) => {
        if(data) {
            const newQty = data.qty_per_sku + obj.qty_per_sku;
            updateExistedItem(data, newQty, oldContainerId)
        } else {
            reverse_Back_To_Parent_Box(ContainerId, obj.id, oldContainerId, parentAccountId)
        };
    })
};
const repeated = [];
const reverse_Back_To_Parent_Box = async (container_id, item_id, delete_id, parentAccountId) => {
    const response = await fetch(`/api/item/rewireClientRequest/${item_id}&${container_id}&${parentAccountId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('REVERSED SUCCESSFULLY (rewire)');
        if (!repeated.includes(container_id)) {
            repeated.push(container_id)
            unlabelShippedDate(container_id, delete_id);
        } else {
            endPoint++;
            if (endPoint == startPoint) {
                self_destroy(delete_id)
            }
        }
    }
};
async function updateExistedItem(obj, newSkuQ, delete_id) {
    const payload = await fetch(`/api/item/updateQty_ExistedItem/${obj.container_id}&${obj.item_number}`, {
        method: 'PUT',
        body: JSON.stringify({
            qty_per_sku: newSkuQ
        }),
        headers: {'Content-Type': 'application/json'}
    })
    if (payload.ok) {
        console.log('REVERSED SUCCESSFULLY (update)');
        endPoint++;
        if (endPoint == startPoint) {
            self_destroy(delete_id)
        }
    }
};
const unlabelShippedDate = async (id, delete_id) => {
    const response = await fetch(`/api/container/shipped_date_unlabeling/${id}`, {
      method: 'PUT'
    });
    if (response.ok) {
        endPoint++;
        if (endPoint == startPoint) {
            self_destroy(delete_id)
        }
    }
}
/**
 * AM = 1
 * Req = 11;
 * Req reverse = 10
 * SP = 12;
 * SP create = 121
 * SP final confirm = 129;
 * China = 0 (create and request);
 * China Confirm  = -100;
 * Mapping = 50
 * */
 const record_action_reverse = (data) => {
    for (let b = 0; b < data.length; b++) {
        const mainBoxNumber = data[b].description.split(':')[0];
        const accountName = data[b].account.name;
        const user_id  = data[b].user_id;
        const itemNumber = data[b].item_number;
        const qty_to = data[b].qty_per_sku
        reversePromises.push(record_put_action(user_id, itemNumber, mainBoxNumber, qty_to, accountName, data[b].container_id))
    }
 }
 const record_put_action = async (id, ref, sub, count, accountName, parentBoxId) => {
    const user_id = id;
    const ref_number = ref;
    const sub_number = sub;
    const qty_to = count;
    const status_from = 2;
    const status_to = 1;
    const action = `Admin Reversed Req Box #${parentBoxId} (for Acct: ${accountName})`;
    const action_notes = `Quick Mode Reversal Performed; ${ref}(${count}) back to ${sub}`
    const type = 112;
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/record/record_create`, {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        ref_number,
        sub_number,
        qty_to,
        status_to,
        status_from,
        action,
        action_notes,
        type,
        date
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    });
};
const prepareRecord = (boxData, itemData, recordType) => {
    var record = new Object;
    record.user_id = boxData.user_id;
    record.type = 122;
    record.date = new Date().toISOString().split('T')[0];
    if (recordType == "sp") {
        record.ref_number = boxData.container_number;
        record.sub_number = `${requestBoxData.container_number} (#${requestBoxData.id})`;
        // record.status_from = null;
        record.status_to = 1;
        // record.qty_from = null;
        record.qty_to = itemData.qty_per_sku;
        record.action = `Admin Creating SP Container via Quick Mode (for Acct: ${requestBoxData.account.name})`;
        boxData.custom_1 != null?record.action_notes = `Collection (P)`:record.action_notes = `Collection`;
        record.action_notes += `: ${itemData.item_number} (${itemData.qty_per_sku}), File 1: ${requestBoxData.file}; File 2: ${requestBoxData.file_2}`;
    } else if (recordType == "sku") {
        record.ref_number = itemData.item_number;
        record.sub_number = boxData.container_number;
        record.status_from = 2;
        record.status_to = 1;
        // record.qty_from = null;
        record.qty_to = itemData.qty_per_sku
        record.action = `Admin Creating Item to ${boxData.container_number} via Quick Mode (for Acct: ${requestBoxData.account.name})`;
        record.action_notes = `File 1: ${requestBoxData.file}; File 2: ${requestBoxData.file_2}`;
    } else {
        record.type = 402;
        record.ref_number;
        record.sub_number;
        record.status_from;
        record.status_to;
        record.qty_from;
        record.qty_to;
        record.action;
        record.action_notes;

    }
    return record

};

var requestBoxData = new Object;
const reqBoxInfoFetcher = async (reqBoxId) => {
    await fetch(`/api/container/container/${reqBoxId}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        requestBoxData = data[0];
    })
};
/////////record keeping/////////
const loadingRecord = async (data) => {
    const response = await fetch(`/api/record/record_create`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
          'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
        console.log('record created');
    }
};
