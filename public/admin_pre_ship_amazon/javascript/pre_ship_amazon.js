const container_id = location.href.split('/').slice(-1)[0].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
console.log(container_id);
const pre_shipN = document.getElementById('pre-shipN');
const notes = document.getElementById('notes');
const input = document.getElementById("scanned_item");
const checkBox = document.getElementById('scanned_whole');
const sku_list = document.getElementById('sku_list');
const length = document.getElementById('new_len');
const height = document.getElementById('new_hei');
const weight = document.getElementById('new_wei');
const width = document.getElementById('new_wid');
const newContainerTable = document.getElementById('sku_table');
var xcQtyCount = 0;
var item_numberMap = new Map();
var id_qtyMap = new Map();
var iidArr = [];
var user_id, account_id;
var selectedSkuArr = [];
var skuArr = [];
var printCheck = false;
var skuChecker = false;
var getXCchecker = false;
if (!localStorage.getItem('sp_number')) {
    localStorage.setItem('sp_number', 0)
} else {
    localStorage.setItem('sp_number', parseInt(localStorage.getItem('sp_number'))+1)
};

var container_numberArr = [];
function supplemental () {
    fetch(`/api/container/container/${container_id}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.length) {
            user_id = data[0].user_id;
            account_id = data[0].account_id;
            notes.innerHTML = data[0].notes;
            const descriptionArr = document.querySelectorAll('h5');
            const tableArr = document.querySelectorAll('table')
            for (let i = 0; i < descriptionArr.length; i++) {
                const container_number = descriptionArr[i].innerText.split(':')[0];
                descriptionArr[i].setAttribute('id',container_number);
                tableArr[i].setAttribute('id', `t_${container_number}`);
                container_numberArr.push(container_number);
            };
            itemIdCollection();
        } else {
            window.location.replace('/admin_move_main_amazon');
        }
    })
};

function itemIdCollection() {
    fetch(`/api/item/findAllPerContainer/${container_id}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.length) {
            for (let i = 0; i < data.length; i++) {
                const item_number = data[i].item_number;
                const description = data[i].description;
                const item_id = data[i].id;
                const box_number = description.split(':')[0];
                const itemCode = `${item_number}-${box_number}`;
                item_numberMap.set(itemCode, item_id)
                skuArr.push(itemCode)
            }
        } else {
            console.log('no item in this container! box self-destroyed');
            updateReqContainer(container_id);
        }
    })
};

//helper function for bulk check
function auth() {
    if (checkBox.checked) {
        const passcode = prompt('Please enter passcode to enable bulk-check function');
        if (passcode != '0523') {
            checkBox.checked = false;
            alert('The passcode is incorrect!')
        }
    }
}
//input function
var totalItem = 0;
function pre_check() {
    printCheck = false
    document.getElementById('alert').innerHTML = null;
    const value = input.value.trim();
    const all_td = document.querySelectorAll('#pre_confirmTable td');
    if (container_numberArr.includes(value) && document.getElementById(value).getAttribute('class') != 'lead text-center rounded shadow-sm bg-info') {
        for (let i = 0; i < container_numberArr.length; i++) {
            document.getElementById(container_numberArr[i]).setAttribute('class', 'lead text-center rounded shadow-sm bg-light')
        };
        document.getElementById(value).setAttribute('class','lead text-center rounded shadow-sm bg-info');
        localStorage.setItem('selectedBox',value);
        const eachTable = document.getElementById(`t_${value}`);
        const rows = eachTable.rows;
        for (let i = 1; i < rows.length; i++) {
            const sku = rows[i].getElementsByTagName("td")[0];
            sku.setAttribute('id',`${sku.innerText}_${value}`)
            const qty = rows[i].getElementsByTagName("td")[1];
            qty.setAttribute('id',`qty_${sku.innerText}_${value}`)
        };
        input.value = null;
    } else if (container_numberArr.includes(value) && document.getElementById(value).getAttribute('class') == 'lead text-center rounded shadow-sm bg-info') {
        if (checkBox.checked) {
            const eachTable = document.getElementById(`t_${value}`);
            const rows = eachTable.rows;
            rows[0].setAttribute('class','bg-info');
            for (let i = 1; i < rows.length; i++) {
                totalItem += parseInt(rows[i].getElementsByTagName("td")[1].innerText);
                document.getElementById('totalItem').innerHTML = `(${totalItem})`;
                rows[i].setAttribute('class','bg-info');
                const sku = rows[i].getElementsByTagName("td")[0];
                selectedSkuArr.push(`${sku.innerText}-${localStorage.getItem('selectedBox')}`);
                eachBoxContent(rows[i])
            };
            input.value = null;
        } else {
            input.value = null;
        }
    } else if (skuArr.includes(`${value}-${localStorage.getItem('selectedBox')}`) && !selectedSkuArr.includes(`${value}-${localStorage.getItem('selectedBox')}`) && document.getElementById(localStorage.getItem('selectedBox')).getAttribute('class') == 'lead text-center rounded shadow-sm bg-info') {
        const qtyPerSKu = document.getElementById(`qty_${value}_${localStorage.getItem('selectedBox')}`);
        if (qtyPerSKu) {
            totalItem++;
            document.getElementById('totalItem').innerHTML = `(${totalItem})`;
            const newQty = parseInt(qtyPerSKu.innerHTML)-1;
            const iid = item_numberMap.get(`${value}-${localStorage.getItem('selectedBox')}`);
            if (newQty > 0) {
                document.getElementById(`qty_${value}_${localStorage.getItem('selectedBox')}`).innerHTML = newQty;
                id_qtyMap.set(iid,newQty);
                if (!iidArr.includes(iid)) {
                    iidArr.push(iid); // arr to store updated info for master boxes
                };
                eachBoxContent(null, value);
                input.value = null;
            } else if (newQty == 0) {
                eachBoxContent(null, value);
                iidArr = iidArr.filter(id => id != iid); // remove qty-0 item from upadte arr becuase it will be removed
                document.getElementById(`qty_${value}_${localStorage.getItem('selectedBox')}`).innerHTML = newQty;
                document.getElementById(`qty_${value}_${localStorage.getItem('selectedBox')}`).parentElement.setAttribute('class','bg-info');
                selectedSkuArr.push(`${document.getElementById(`${value}_${localStorage.getItem('selectedBox')}`).innerHTML}-${localStorage.getItem('selectedBox')}`);// deleteArr for 0-qty item
                input.value = null;
            }
        } else {
            error();
            document.getElementById('alert').innerHTML = `${value} is not associated with the box: ${localStorage.getItem('selectedBox')}; please scan the right box first`;
            input.value = null;
        }
    } else if (value[0] == '-') {
        var removeItemMap = new Map();
        var removeArr = [];
        const removedValue = value.substring(1,value.length);
        var rows = newContainerTable.rows;
        for (let r = 1; r < rows.length; r++) {
            const itemNumber = rows[r].cells[0].innerHTML;
            const itemQty = parseInt(rows[r].cells[1].innerHTML);
            removeItemMap.set(itemNumber, itemQty);
            removeArr.push(itemNumber);
        };
        if (removeArr.includes(removedValue)) {
            totalItem--;
            document.getElementById('totalItem').innerHTML = `(${totalItem})`;
            const index = removeArr.indexOf(removedValue) + 1;
            const masterQty =  document.getElementById(`qty_${removedValue}_${localStorage.getItem('selectedBox')}`)
            if (removeItemMap.get(removedValue) > 1 && masterQty) {
                rows[index].cells[1].innerHTML = removeItemMap.get(removedValue) - 1;
                masterQty.innerHTML = parseInt(masterQty.innerHTML) + 1;
                skuQtyMap.set(removedValue, skuQtyMap.get(removedValue) - 1)
            } else if (removeItemMap.get(removedValue) == 1 && masterQty) {
               masterQty.innerHTML = parseInt(masterQty.innerHTML) + 1;
               tdSkuArr = tdSkuArr.filter(i => i != removedValue);
               skuQtyMap.delete(removedValue);
               rows[index].remove();
            };
            const iid = item_numberMap.get(`${removedValue}-${localStorage.getItem('selectedBox')}`);
            if(masterQty.parentElement.getAttribute('class') == 'bg-info') {
                masterQty.parentElement.setAttribute('class', '');
                if (!iidArr.includes(iid)) {
                    iidArr.push(iid); // arr to store updated info for master boxes
                };
                id_qtyMap.set(iid,1);
                selectedSkuArr = selectedSkuArr.filter( i => i != `${document.getElementById(`${removedValue}_${localStorage.getItem('selectedBox')}`).innerHTML}-${localStorage.getItem('selectedBox')}`);
            } else {
                id_qtyMap.set(iid,id_qtyMap.get(iid) + 1);
            }
            input.value = null;
        } else if (value[0] == '-' && value.length > 9 && !removeArr.includes(removedValue)){
            input.value = null;
            error();
        }
    } else {
        error();
        document.getElementById('alert').innerHTML = 'incorrect input';
        input.value = null;
    }
};

var timer = null;
function delay(fn){
    clearTimeout(timer);
    timer = setTimeout(fn, 50)
};
async function updateReqContainer(container_id) {
    localStorage.removeItem('sp_number');
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
        alert('this requested container has been confirmed for shipping!');
        window.location.replace('/admin_move_main_amazon');
    }

};

var amazon_box = new Object();
function shippmentCreate() {
    document.getElementById('order_pre-check').style.display = 'none';
    document.getElementById('spinner').style.display = '';
    amazon_box.length = length.value.trim()*2.54;
    amazon_box.width = width.value.trim()*2.54;
    amazon_box.height = height.value.trim()*2.54;
    amazon_box.weight = weight.value.trim()*0.45;
    amazon_box.volume = amazon_box.width*amazon_box.height*amazon_box.length;
    amazon_box.container_number = pre_shipN.innerHTML;
    if (amazon_box.container_number.substring(0,4) == 'TEMP') {
        amazon_box.type = 0;
        amazon_box.description = `${amazon_box.container_number}:N/A`
    } else {
        amazon_box.type = 3;
    }
    amazon_box.user_id = user_id;
    amazon_box.account_id = account_id;
    amazon_box.tracking = container_id;
    boxCreate(amazon_box)
};
async function boxCreate(data) {
    console.log('boxCreate');
    const response = await fetch('/api/container/amazon_box', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
       console.log("amazon box inserted");
       xcQtyCount>0?xcCreate(data):console.log('no label change');;
       findContainerId(data.container_number);
      } else {
        alert('try again')
   }
};
const xcCreate = async (data) => {
    if (getXCchecker) {
        const newfba = `LR${container_id}`
        const response = await fetch('/api/container/xc_LabelChangeUpdate', {
            method: 'PUT',
            body: JSON.stringify({
                fba:newfba,
                qty_of_fee: xcQtyCount,
                description: `AM Relabel Services - ${xcQtyCount} Items`,
                notes: `Label Change (Qty: ${xcQtyCount}); Batch# ${container_id}`,

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
                description: `AM Relabel Services - ${xcQtyCount} Items`,
                notes: `Label Change (Qty: ${xcQtyCount}); Batch# ${container_id}`,
                fba: 'LR' + container_id,
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

const getXC = async () => {
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
            getXCchecker = true;
            xcQtyCount = parseInt(data.qty_of_fee);
            console.log(xcQtyCount);
        };
        console.log(getXCchecker);
    })
};
function findContainerId(c_number) {
    console.log('getting container_id');
    fetch(`/api/container/amazon_container/${c_number}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log('container_id fetched');
        // var instance = new Date().valueOf().toString().substring(5,13)+container_id;
        // pre_shipN.innerHTML = `SP${instance}`
        amazon_box.id = data.id
        console.log(data.id);
        itemCreate()
    })
};
var promises = [];
function itemCreate() {
    console.log('itemCreate');
    var rows = newContainerTable.rows;
    for (let i = 1; i < rows.length; i++) {
        var item = new Object()
        item.item_number = rows[i].cells[0].innerHTML;
        item.qty_per_sku = parseInt(rows[i].cells[1].innerHTML);
        item.user_id = amazon_box.user_id;
        item.account_id = amazon_box.account_id;
        item.container_id = amazon_box.id;
        item.description = amazon_box.description;
        promises.push(loadingItems(item))
    };
    removeItem();
    Promise.all(promises).then(() => {
        console.log('done');
        alert(`1 container(#${amazon_box.container_number}) with ${rows.length-1} items is inserted to client_id: ${amazon_box.user_id}!`)
        if (amazon_box.container_number.substring(0,4) == 'TEMP') {
            location.href = `/admin_pre_ship_amazon/${amazon_box.id}`
        } else {
            location.reload()
        }
    }).catch((e) => {console.log(e)})
};
async function loadingItems(data) {
    const response = await fetch('/api/item/new', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        console.log(data.item_number);
    }
};

//helper functions
// function idChanger(sku) {
//     const input = document.getElementById(sku).innerHTML;
//     skuQtyMap.set(input, skuQtyMap.get(sku));
//     skuQtyMap.delete(sku);
//     tdSkuArr.filter(i => i != sku);
//     tdSkuArr.push(input);
//     document.getElementById(sku).setAttribute('onkeyup', `idChanger(${input})`);
//     document.getElementById(sku).setAttribute('id', input);
// }

function printable() {
    const oldSize = document.getElementById('pre-shipN').style.fontSize;
    document.getElementById('pre-shipN').style.fontSize = '200%';
    const hideables = [
        document.getElementById("labChangeHx"),
        document.getElementById('assignFunction'),
        document.getElementById('notesFunction'),
        document.getElementById('topline'),
        document.getElementById('content_table'),
        document.getElementById('container_detail'),
        document.getElementById('order_pre-check'),
        document.getElementById('fake')
    ];
    hideables.forEach(i => i.style.display = 'none')
    window.print();
    hideables.forEach(i => i.style.display = '');
    masterCheck();
    printCheck = true;
    document.getElementById('pre-shipN').style.fontSize = oldSize;
}
function error() {
    var audio = new Audio('../media/wrong.mp3');
    audio.play();
};
function masterCheck () {
    if (length.value && height.value && weight.value && width.value) {
        document.getElementById('order_pre-check').style.display = '';
        document.getElementById('fake').style.display = 'none';
        printCheck = false;
    } else {
        document.getElementById('order_pre-check').style.display = 'none'
        document.getElementById('fake').style.display = '';
    }
};
var skuQtyMap = new Map();
var tdSkuArr = [];
var placeholder;
function eachBoxContent (arr, input) {
    if (arr) {
        const tdPerRow = arr.querySelectorAll('td');
        const boxSku = tdPerRow[0].innerText;
        const boxQty = tdPerRow[1].innerText;
        // newBoxSku.setAttribute('onkeyup', `idChanger(${tdPerRow[0].innerText})`);
        if (boxQty != "0") {
            tdPerRow[1].innerHTML = 0;
            if(!tdSkuArr.includes(boxSku)) {
                const newTr = document.createElement('tr');
                sku_list.appendChild(newTr);
                const newBoxSku = document.createElement('td');
                newBoxSku.setAttribute('contenteditable', true);
                const newBoxQty = document.createElement('td');
                newBoxSku.setAttribute('id', boxSku);
                newBoxQty.setAttribute('id', `${boxSku}q`);
                newBoxSku.setAttribute('onkeyup',`modify(${boxSku})`)
                newTr.appendChild(newBoxSku);
                newTr.appendChild(newBoxQty);
                tdSkuArr.push(boxSku);
                skuQtyMap.set(boxSku, parseInt(boxQty));
                newBoxSku.innerHTML = skuFilter(boxSku);
                newBoxQty.innerHTML = boxQty;
                placeholder = skuFilter(boxSku,parseInt(boxQty)-1)
            } else {
                skuQtyMap.set(boxSku, skuQtyMap.get(boxSku)+ parseInt(boxQty))
                document.getElementById(`${boxSku}q`).innerHTML = skuQtyMap.get(boxSku);
                placeholder = skuFilter(boxSku,parseInt(boxQty));
            }
        } else {
            error();
        }
    } else {
        if(!tdSkuArr.includes(input)) {
            tdSkuArr.push(input);
            skuQtyMap.set(input, 1);
            const newTr = document.createElement('tr');
            const newBoxSku = document.createElement('td');
            newBoxSku.setAttribute('contenteditable', true);
            newBoxSku.setAttribute('id', input);
            // newBoxSku.setAttribute('onkeyup', `idChanger(${input})`);
            newBoxSku.setAttribute('onkeyup',`modify(${input})`)
            const newBoxQty = document.createElement('td');
            newBoxQty.setAttribute('id', `${input}q`)
            sku_list.appendChild(newTr);
            newTr.appendChild(newBoxSku);
            newTr.appendChild(newBoxQty);
            newBoxSku.innerHTML = skuFilter(input);
            newBoxQty.innerHTML = skuQtyMap.get(input)
        } else {
            skuQtyMap.set(input, skuQtyMap.get(input)+1)
            document.getElementById(`${input}q`).innerHTML = skuQtyMap.get(input);
            placeholder = skuFilter(input);
        }
    }

};
const modify = (element) => {
    element.setAttribute('class','text-dark');
    const newSku = element.innerText.toUpperCase().trim();
    console.log(newSku);
    modifiable(newSku, element);
};
const modifiable = async (number, element) => {
    skuChecker = false
    await fetch(`/api/document/validation/${number}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    }).then((r) => {
        if (r.status != 200) {
            return null
        } else {
            return r.json();
        }
      }).then((d) => {
        if (d) {
            const image = document.createElement('img');
            // const embed = document.createElement('embed');
            image.src = `/image/${d.file}`;
            // embed.src = `/image/${d.file}`;
            // image.onerror = switchpdf(embed);
            image.style.pageBreakAfter='always';
            document.getElementById('image_placeholder').appendChild(image);
            element.innerText = element.innerText.toUpperCase().trim();
            element.setAttribute('class','text-success');
        }
      })
};

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
            loadingFilterOp(data)
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
    console.log(`switch to ${str}`);
    localStorage.setItem('filter_history', id)
    var arr = str.split('=>');
    oldsku = arr[0].split(',');
    newsku = arr[1].split(',');
}

const skuFilter = (input, n) => {
    var index;
    oldsku?index=oldsku.indexOf(input):index=-1;
    if (index>-1 && filterAuthFunction() && newsku[index]) {
        imgAttach(newsku[index], n);
        filter_record(input, newsku[index])
        return newsku[index]
    } else {
        return input
    }
};
const filterRecordArr = [];
const skuRecordList =  document.getElementById('skurecord')
const filter_record = (oldsku, newsku) => {
    const skuSet = `${oldsku}-${newsku}`;
    if (!filterRecordArr.includes(skuSet)) {
        filterRecordArr.push(skuSet);
        const list = document.createElement('li');
        list.className = 'text-primary';
        list.id = skuSet
        list.innerHTML = `${oldsku} --->  ${newsku} (1)`;
        skuRecordList.append(list);
    } else {
        const changingCount = parseInt(document.getElementById(skuSet).innerHTML.split('(')[1].split(')')[0])+1;
        document.getElementById(skuSet).innerHTML = `${oldsku} --->  ${newsku} (${changingCount})`;
    }
}
const imgAttach = async (number,n) => {
    skuChecker = false
    await fetch(`/api/document/validation/${number}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    }).then((r) => {
        if (r.status != 200) {
            error();
            return null
        } else {
            return r.json();
        }
      }).then((d) => {
        if (d) {
            if(n) {
                for (let i = 0; i < n; i++) {
                    xcQtyCount++;
                    const image = document.createElement('img');
                    image.src = `/image/${d.file}`;
                    image.style.pageBreakAfter='always';
                    image.style.paddingTop = marginvalue();
                    document.getElementById('image_placeholder').appendChild(image);
                }
            } else {
                xcQtyCount++;
                const image = document.createElement('img');
                image.src = `/image/${d.file}`;
                image.style.pageBreakAfter='always';
                image.style.paddingTop = marginvalue();
                document.getElementById('image_placeholder').appendChild(image);
            }
        } else {
            document.getElementById('alert').innerHTML = `<h3>NO IMAGE ATTACHED WITH THIS SKU CHANGE: ${number}</h3>`;
        };
      })
};
function marginvalue() {
    const image_container = document.getElementById("image_placeholder");
    const images = image_container.getElementsByTagName("img");
    if (images.length>0){
        return "25px";
    } else {
        return null;
    };
};
const allowCheckBox = document.getElementById('allowFilter');
const filterAuthFunction = () => {
    if (allowCheckBox.checked) {
        return true
    } else {
        return false
    }
}
// const switchpdf = (obj) => {
//     document.getElementById('image_placeholder').prepend(obj);
// }
const printImage = () => {
    skuChecker = true;
    const hideables = [
        document.getElementById('assignFunction'),
        document.getElementById('notesFunction'),
        document.getElementById('topline'),
        document.getElementById('creator_form'),
        document.getElementById("labChangeHx")
    ];
    document.getElementById('image_placeholder').style.display = '';
    hideables.forEach(i => i.style.display = 'none')
    window.print();
    document.getElementById('image_placeholder').querySelectorAll('img').forEach(i => i.remove());
    document.getElementById('image_placeholder').style.display = 'none';
    hideables.forEach(i => i.style.display = '');
    // document.getElementById('image_placeholder').querySelectorAll('img').forEach(i => i.remove());
}
//helper function to make radnom code
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
};
const id_and_barcode_generator = () => {
    var pad = "000";
    var ans = pad.substring(0, pad.length - localStorage.getItem('sp_number').length) + localStorage.getItem('sp_number');
    var instance = container_id + makeid(3) + ans;
    pre_shipN.innerHTML = `SP${instance}`;
    document.getElementById('image').src = `http://bwipjs-api.metafloor.com/?bcid=code128&text=SP${instance}`;
}

function removeItem() {
    console.log('preparing removal');
    var idarr = [];
    for (let i = 0; i < selectedSkuArr.length; i++) {
        idarr.push(item_numberMap.get(selectedSkuArr[i]))
    };
    if(idarr.length) {
        promises.push(removeZeroItem(idarr));
    } else {
        console.log('all items still have remaining qty');
    };
    for (let k = 0; k < iidArr.length; k++) {
        var eachUpdatedItem = new Object();
        eachUpdatedItem.id = iidArr[k];
        eachUpdatedItem.qty_per_sku = id_qtyMap.get(iidArr[k]);
        promises.push(updateQty(eachUpdatedItem));
    }
};
async function removeZeroItem(id) {
    console.log('bulk removal');
    const response = await fetch(`/api/item/bulkDestroy/`, {
      method: 'DELETE',
      body: JSON.stringify({
        id: id
        }),
      headers: {'Content-Type': 'application/json'}
    });
};
async function updateQty(data) {
    const response = await fetch(`/api/item/updateQtyPerItemId/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          qty_per_sku: data.qty_per_sku
          }),
        headers: {'Content-Type': 'application/json'}
    });
};
function pre_create_checker() {
    if (!document.getElementById('image_placeholder').querySelector('img')) {
        skuChecker = true;
    };
    if (printCheck) {
        skuChecker?shippmentCreate():printImage()
    } else {
        printable();
    }
};
const alt_step = document.getElementById('alt_step')
function alter() {
    alt_step.disabled = true;
    pre_shipN.innerHTML = `TEMP${container_id}`;
    length.value = 0;
    height.value = 0;
    weight.value = 0;
    width.value = 0;
    document.getElementById('creator_form').setAttribute('class', 'shadow p-2 py-3 mt-2 rounded border border-danger bg-warning');
    masterCheck ();
};
function deleteConfirm() {
    const id = container_id;
    const code =  prompt(`Please enter the passcode to confirm the DELETION of REQ/TEMP box (id: ${id})`);
    if (code == '0523') {
        if (confirm('Friednly reminder: all items assocaited with this REQ/TEMP box will be removed!')) {
            updateReqContainer(id);
        }
    } else {
        alert('Incorrect passcode!')
    }
};

id_and_barcode_generator();
supplemental();
getXC();
filterLoader(10);
