console.log('partial_merge');
function localStorageSwap() {
    const todata = localStorage.getItem('toContainer');
    const fromdata = localStorage.getItem('fromContainer');
    localStorage.setItem('toContainer', fromdata);
    localStorage.setItem('fromContainer', todata);
}
// localStorage.clear();
var containerMap = new Map();
function getContainer(input, div) {
    fetch(`/api/container/amazon_container/${input}`, {
        method: 'GET'
    }).then(function (response) {
        if (response.status == 500) {
            return null
        } else {
            return response.json();
        }
    }).then(function (data) {
        localStorage.removeItem(div.id);
        document.getElementById('okBtn').disabled = true;
        if (!data) {
            div.parentElement.querySelectorAll('p').forEach(i => i.remove());
            const notes = document.createElement('p');
            div.parentElement.appendChild(notes);
            notes.innerHTML = `<small class="text-danger">${input} is not eligible for merging</small>`;
        } else {
            const container = new Object();
            div.parentElement.querySelectorAll('p').forEach(i => i.remove());
            const notes = document.createElement('p');
            div.parentElement.appendChild(notes);
            notes.innerHTML = `User: ${data.user.name}, Account: ${data.account.name}`;
            localStorage.setItem(div.id, input);
            container.user_id = data.user_id;
            container.account_id = data.account_id;
            container.id = data.id;
            container.cost = data.cost;
            containerMap.set(input, container);
            if(containerMap.size == 2 && localStorage.getItem('toContainer') != localStorage.getItem('fromContainer')) {
                const toNumber = localStorage.getItem('toContainer');
                const fromNumber = localStorage.getItem('fromContainer')
                if (toNumber[0] != fromNumber[0] && (toNumber[0] == "R" || fromNumber[0] == "R")) {
                    if (fromNumber[0] != "R") {
                        alert('Direct SKU transfer from physical box (AM, SP, and TEMP) to virtual box (REQ) is prohibited!');
                        localStorage.removeItem(div.id);
                        div.value = null;
                        div.parentElement.querySelectorAll('p').forEach(i => i.remove());
                        containerMap.delete(input);
                    } else {
                        document.getElementById('okBtn').disabled = false;
                        document.getElementById('okBtn').href = `/partial_merge/${containerMap.get(localStorage.getItem('fromContainer')).id}&${containerMap.get(localStorage.getItem('toContainer')).id}`
                    }
                } else {
                    document.getElementById('okBtn').disabled = false;
                    document.getElementById('okBtn').href = `/partial_merge/${containerMap.get(localStorage.getItem('fromContainer')).id}&${containerMap.get(localStorage.getItem('toContainer')).id}`
                }
            } else if (localStorage.getItem('toContainer') == localStorage.getItem('fromContainer')) {
                div.value = null;
                div.parentElement.querySelectorAll('p').forEach(i => i.remove());
                localStorage.removeItem(div.id);
            }
        }
    });
};
function findId(params) {
    const inputDiv = document.getElementById(params);
    const input = inputDiv.value.toUpperCase().trim();
    if (input.length >= 5) {
        getContainer(input, inputDiv)
    }
};
function error() {
    var audio = new Audio('../media/wrong.mp3');
    audio.play();
};

const container_id = location.href.split('/').slice(-1)[0].split('&')[0];
const container_id_to = parseInt(location.href.split('/').slice(-1)[0].split('&')[1].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''));
const pre_shipN = document.getElementById('pre-shipN');
const notes = document.getElementById('notes');
const input = document.getElementById("scanned_item");
const checkBox = document.getElementById('scanned_whole');
const sku_list = document.getElementById('sku_list');
var sku_list_am, sku_table_am;
if (!sku_list) {
    sku_list_am = document.getElementById('to_confirmTable').querySelector('tbody');
    sku_table_am = document.getElementById('to_confirmTable').querySelector('table');
    sku_list_am.querySelectorAll('tr').forEach(tr => tr.setAttribute('class', 'bg-secondary'))
};

const newContainerTable = document.getElementById('sku_table');
var item_numberMap = new Map();
var id_qtyMap = new Map();
var iidArr = [];
var user_id, account_id, user_id_to, account_id_to;
var selectedSkuArr = [];
var skuArr = [];
// var printCheck = false;
if (!localStorage.getItem('sp_number')) {
    localStorage.setItem('sp_number', 0)
} else {
    localStorage.setItem('sp_number', parseInt(localStorage.getItem('sp_number'))+1)
};

var hrefPromises = [];
var container_numberArr = [];
var deletable = true;
const autoDelPromise = [];
function supplemental() {
    fetch(`/api/container/container/${container_id}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.length) {
            user_id = data[0].user_id;
            account_id = data[0].account_id;
            if ([1,3].includes(data[0].type)) {
                deletable = false;
            };
            if (!document.getElementById(`fromBoxId${container_id}`)) {
                // if (data[0].type == 0 || data[0].type == 2 || data[0].type == 3 || parseInt(data[0].cost) == 0) {
                if ([0,2].includes(data[0].type)) {
                    autoDelPromise.push(updateReqContainer(container_id))
                } else if ([1,3].includes(data[0].type)) {
                    autoDelPromise.push(updateEmptyContainer(container_id))
                }
                Promise.all(autoDelPromise).then(() => {
                    window.location.replace(`/merger`);
                }).catch((e) => {console.log(e)})
            } else {
                document.getElementById(`fromBoxId${container_id}`).innerHTML = data[0].container_number;
            };
            const descriptionArr = document.getElementById('from_confirmTable').querySelectorAll('h5');
            const tableArr = document.getElementById('from_confirmTable').querySelectorAll('table')
            for (let i = 0; i < descriptionArr.length; i++) {
                const container_number = descriptionArr[i].innerText.split(':')[0];
                hrefPromises.push(idFinder(container_number, descriptionArr[i]));
                descriptionArr[i].setAttribute('id',container_number);
                tableArr[i].setAttribute('id', `t_${container_number}`);
                container_numberArr.push(container_number);
            };
            Promise.all(hrefPromises).then(() => {
                itemIdCollection()
            }).catch((e) => {console.log(e)})
        } else {
            window.location.replace(`/merger`);
        }
    })
};supplemental();

function supplemental_2() {
    fetch(`/api/container/container/${container_id_to}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.length) {
            user_id_to = data[0].user_id;
            account_id_to = data[0].account_id;
            const toBoxNumber =  document.getElementById(`toBoxId${container_id_to}`);
            toBoxNumber.innerHTML = data[0].container_number;
            const extraNotes = document.createElement('h6');
            toBoxNumber.parentElement.appendChild(extraNotes);
            extraNotes.innerHTML = `User: ${data[0].user.name}, Account: ${data[0].account.name}`
        }
    })
};

function idFinder(target_container, h5Element) {
    fetch(`/api/container/amazon_container/${target_container}`, {
        method: 'GET'
    }).then(function (response) {
        if (response.status != 200) {
            return null;
        } else {
            return response.json();
        };
    }).then(function (data) {
        if (data) {
            if (container_id != data.id) {
                const aTag = document.createElement('a');
                h5Element.parentElement.prepend(aTag);
                aTag.setAttribute('uk-icon','icon: check');
                aTag.setAttribute('class','text-success');
                aTag.setAttribute('uk-tooltip', `Redirect ${target_container} as the receiving container`)
                aTag.href = `/partial_merge/${container_id}&${data.id}`;
            }
        } else {
            const warning = document.createElement('span');
            h5Element.parentElement.prepend(warning);
            warning.setAttribute('uk-icon','icon: warning');
            warning.setAttribute('uk-tooltip', `${target_container} no longer physically exists; please transfer to other boxes`);
            warning.setAttribute('class','text-warning')
        }
    })
}

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
                var box_number;
                if (!data[i].description || !description.includes(':')) {
                    const descriptionOne = document.getElementById('from_confirmTable').querySelector('h5');
                    box_number = descriptionOne.innerText.split(':')[0];
                } else {
                    box_number = description.split(':')[0];
                };
                const itemCode = `${item_number}-${box_number}`;
                item_numberMap.set(itemCode, item_id)
                skuArr.push(itemCode)
            };
            if (container_id_to != NaN) {
                supplemental_2();
            }
        } else {
            console.log('no item in this container! box self-destroyed');
            // updateReqContainer(container_id);///// need to add cost element in it before deletion
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
function pre_check() {
    // printCheck = false
    document.getElementById('alert').innerHTML = null;
    const value = input.value.trim();
    const all_td = document.querySelectorAll('#from_confirmTable td');
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
                rows[i].setAttribute('class','bg-info')
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
            const newQty = parseInt(qtyPerSKu.innerHTML)-1;
            const iid = item_numberMap.get(`${value}-${localStorage.getItem('selectedBox')}`);
            if (newQty > 0) {
                document.getElementById(`qty_${value}_${localStorage.getItem('selectedBox')}`).innerHTML = newQty;
                id_qtyMap.set(iid,newQty);
                itemCount++
                if (!iidArr.includes(iid)) {
                    iidArr.push(iid); // arr to store updated info for master boxes
                };
                eachBoxContent(null, value);
                input.value = null;
            } else if (newQty == 0) {
                itemCount++
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
        var rows;
        if (newContainerTable) {
            rows = newContainerTable.rows;
        } else {
            rows = sku_list_am.parentElement.rows;
        }
        for (let r = 1; r < rows.length; r++) {
            console.log(rows.length);
            var itemNumber;
            if (rows[r].getAttribute('class')) {
                itemNumber = rows[r].cells[0].innerHTML + "*";
            } else {
                itemNumber = rows[r].cells[0].innerHTML;
            };
            const itemQty = parseInt(rows[r].cells[1].innerHTML);
            removeItemMap.set(itemNumber, itemQty);
            removeArr.push(itemNumber);
        };
        if (removeArr.includes(removedValue)) {
            const index = removeArr.indexOf(removedValue) + 1;
            const masterQty =  document.getElementById(`qty_${removedValue}_${localStorage.getItem('selectedBox')}`);
            itemCount--;
            if (removeItemMap.get(removedValue) > 1 && masterQty) {
                rows[index].cells[1].innerHTML = removeItemMap.get(removedValue) - 1;
                masterQty.innerHTML = parseInt(masterQty.innerHTML) + 1;
                skuQtyMap.set(removedValue, skuQtyMap.get(removedValue) - 1)
            } else if (removeItemMap.get(removedValue) == 1 && masterQty) {
               masterQty.innerHTML = parseInt(masterQty.innerHTML) + 1;
               tdSkuArr = tdSkuArr.filter(i => i != removedValue);
            //    console.log(tdSkuArr);
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
        window.location.replace(`/merger`);
    }

};

// var amazon_box = new Object();
// function shippmentCreate() {
//     amazon_box.length = length.value.trim()*2.54;
//     amazon_box.width = width.value.trim()*2.54;
//     amazon_box.height = height.value.trim()*2.54;
//     amazon_box.weight = weight.value.trim()*0.45;
//     amazon_box.volume = amazon_box.width*amazon_box.height*amazon_box.length;
//     amazon_box.container_number = pre_shipN.innerHTML;
//     if (amazon_box.container_number.substring(0,4) == 'TEMP') {
//         amazon_box.type = 0;
//         amazon_box.description = `${amazon_box.container_number}:N/A`
//     } else {
//         amazon_box.type = 3;
//     }
//     amazon_box.user_id = user_id;
//     amazon_box.account_id = account_id;
//     amazon_box.tracking = container_id;
//     boxCreate(amazon_box)
// };
// async function boxCreate(data) {
//     console.log('boxCreate');
//     const response = await fetch('/api/container/amazon_box', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//       });

//       if (response.ok) {
//        console.log("amazon box inserted");
//        findContainerId(data.container_number);
//       } else {
//         alert('try again')
//    }
// };
// function findContainerId(c_number) {
//     console.log('getting container_id');
//     fetch(`/api/container/amazon_container/${c_number}`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         console.log('container_id fetched');
//         // var instance = new Date().valueOf().toString().substring(5,13)+container_id;
//         // pre_shipN.innerHTML = `SP${instance}`
//         amazon_box.id = data.id
//         console.log(data.id);
//         itemCreate()
//     })
// };
// function itemCreate() {
//     console.log('itemCreate');
//     var rows = newContainerTable.rows;
//     for (let i = 1; i < rows.length; i++) {
//         var item = new Object()
//         item.item_number = rows[i].cells[0].innerHTML;
//         item.qty_per_sku = parseInt(rows[i].cells[1].innerHTML);
//         item.user_id = amazon_box.user_id;
//         item.account_id = amazon_box.account_id;
//         item.container_id = amazon_box.id;
//         item.description = amazon_box.description;
//         loadingItems(item);
//     };
//     removeItem();
//     console.log('done');
//     alert(`1 container(#${amazon_box.container_number}) with ${rows.length-1} items is inserted to client_id: ${amazon_box.user_id}!`)
//     if (amazon_box.container_number.substring(0,4) == 'TEMP') {
//         location.href = `/admin_pre_ship_amazon/${amazon_box.id}`
//     } else {
//         location.reload()
//     }
// };
// function loadingItems(data) {
//     fetch('/api/item/new', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: {'Content-Type': 'application/json'}
//     });
// };

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


// function printable() {
//     const displayElement = document.getElementById('assignFunction');
//     const notesElement = document.getElementById('notesFunction');
//     printCheck = true;
//     if (displayElement.style.display == 'none') {
//         notesElement.style.display = '';
//         displayElement.style.display = ''
//     } else {
//         displayElement.style.display = 'none';
//         notesElement.style.display = 'none';
//         window.print();
//         notesElement.style.display = '';
//         displayElement.style.display = ''
//     }

// }
function error() {
    var audio = new Audio('../media/wrong.mp3');
    audio.play();
};
function masterCheck () {
    if (length.value && height.value && weight.value && width.value) {
        document.getElementById('order_pre-check').style.display = '';
        document.getElementById('fake').style.display = 'none';
        // printCheck = false;
    } else {
        document.getElementById('order_pre-check').style.display = 'none'
        document.getElementById('fake').style.display = '';
    }
};
var skuQtyMap = new Map();
var tdSkuArr = [];
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
                if(sku_list) {
                    sku_list.appendChild(newTr);
                } else {
                    sku_list_am.appendChild(newTr);
                };
                const newBoxSku = document.createElement('td');
                newBoxSku.setAttribute('contenteditable', true);
                const newBoxQty = document.createElement('td');
                newBoxSku.setAttribute('id', boxSku);
                newBoxQty.setAttribute('id', `${boxSku}q`);
                newTr.appendChild(newBoxSku);
                newTr.appendChild(newBoxQty);
                tdSkuArr.push(boxSku);
                itemCount = itemCount + parseInt(boxQty);
                skuQtyMap.set(boxSku, parseInt(boxQty));
                newBoxSku.innerHTML = boxSku;
                newBoxQty.innerHTML = boxQty;

            } else {
                itemCount = itemCount + parseInt(boxQty);
                skuQtyMap.set(boxSku, skuQtyMap.get(boxSku)+ parseInt(boxQty))
                document.getElementById(`${boxSku}q`).innerHTML = skuQtyMap.get(boxSku);
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
            const newBoxQty = document.createElement('td');
            newBoxQty.setAttribute('id', `${input}q`)
            if(sku_list) {
                sku_list.appendChild(newTr);
            } else {
                sku_list_am.appendChild(newTr);
            };
            newTr.appendChild(newBoxSku);
            newTr.appendChild(newBoxQty);
            newBoxSku.innerHTML = input;
            newBoxQty.innerHTML = skuQtyMap.get(input)
        } else {
            skuQtyMap.set(input, skuQtyMap.get(input)+1)
            document.getElementById(`${input}q`).innerHTML = skuQtyMap.get(input);
        }
    }

};

//helper function to make radnom code
// function makeid(length) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//       result += characters.charAt(Math.floor(Math.random() *
//  charactersLength));
//    }
//    return result;
// };

// function newSP(params) {
//     var pad = "000";
//     var ans = pad.substring(0, pad.length - localStorage.getItem('sp_number').length) + localStorage.getItem('sp_number');
//     // const major_length = container_id.length + ans.length;
//     // var instance = container_id + new Date().valueOf().toString().substring(2 + major_length,13) + ans;
//     var instance = container_id + makeid(3) + ans;
//     pre_shipN.innerHTML = `SP${instance}`;
//     document.getElementById('image').src = `http://bwipjs-api.metafloor.com/?bcid=code128&text=SP${instance}`;

// }
function removeItem() {
    console.log('preparing removal');
    var idarr = [];
    for (let i = 0; i < selectedSkuArr.length; i++) {
        idarr.push(item_numberMap.get(selectedSkuArr[i]))
    };
    if (idarr.length) {
        promises.push(removeZeroItem(idarr));
    };
    for (let k = 0; k < iidArr.length; k++) {
        var eachUpdatedItem = new Object();
        eachUpdatedItem.id = iidArr[k];
        eachUpdatedItem.qty_per_sku = id_qtyMap.get(iidArr[k]);
        promises.push(updateQty(eachUpdatedItem));
    }
};
async function removeZeroItem(id) {
    const response = await fetch(`/api/item/bulkDestroy/`, {
      method: 'DELETE',
      body: JSON.stringify({
        id: id
        }),
      headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        console.log('bulk removal for id: ' + id);
    }
};
async function updateQty(data) {
    const response = await fetch(`/api/item/updateQtyPerItemId/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          qty_per_sku: data.qty_per_sku
          }),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        console.log(`qty of item id: ${data.id} has been updated to ${data.qty_per_sku}`);
    }
};

// function pre_create_checker() {
//     if (printCheck) {
//         shippmentCreate()
//     } else {
//         printable();
//     }
// };

// const alt_step = document.getElementById('alt_step')
// function alter() {
//     alt_step.disabled = true;
//     pre_shipN.innerHTML = `TEMP${container_id}`;
//     length.value = 0;
//     height.value = 0;
//     weight.value = 0;
//     width.value = 0;
//     document.getElementById('creator_form').setAttribute('class', 'shadow p-2 py-3 mt-2 rounded border border-danger bg-warning');
//     masterCheck ();
// };

function deleteConfirm() {
    const id = container_id;
    const code =  prompt(`Please enter the passcode to confirm the DELETION of this box (id: ${id})`);
    if (code == '0523') {
        if (confirm('Friednly reminder: all items assocaited with this this box will be removed!')) {
            if (deletable) {
                updateReqContainer(id);
            } else {
                removeItemsOnly(id);
            }
        }
    } else {
        alert('Incorrect passcode!')
    }
};
// function redirectPostZero() {
//     const id = container_id;
//     if (deletable) {
//         updateReqContainer(id);
//     } else {
//         removeItemsOnly(id);
//     }
// };


const today = new Date().toLocaleDateString("en-US");//****//
const newAccountInput = document.getElementById('newAccountInput');//****//
const accountSelect = document.getElementById('account');//****//
const date = document.getElementById('today');
// const loader = document.getElementById('loader'); // loader
const client_list = document.getElementById("user");//****//
const username = document.getElementById('newUserName');//****//
const password = document.getElementById('newPassword');//****//
const height = document.getElementById('new_hei');//****//
const length = document.getElementById('new_len');//****//
const width = document.getElementById('new_wid');//****//
const description = document.getElementById('new_des');//****//
const container_number = document.getElementById('new_container');//****//
// const sku = document.getElementById('sku');
// const sku_list = document.getElementById('sku_list');
const sku_table = document.getElementById('sku_table');//****//
var itemCount = 0;
///////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
var masterMap = new Map();
var userMap = new Map();
var accouuntMap = new Map();
//////////////////////////user_data\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function client_data() {
    fetch(`/api/user/`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
        const user = document.createElement('option');
        user.innerHTML = data[i].name;
        user.setAttribute('value', data[i].id);
        client_list.appendChild(user)
        };
    });
};
if (date) {
    date.value = today;
    client_data();
};
//////////////////////////account_data\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function account_data() {
    unattach();
    document.getElementById("scanDiv").style.display = 'none';
    fetch(`/api/user/account_per_user`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data_u) {
        const data = data_u[client_list.value]
        if (!data) {
            newAccountInput.style.display = '';
            accountSelect.style.display = 'none'
        } else {
            newAccountInput.style.display = 'none';
            accountSelect.style.display = '';
            accountSelect.disabled = false;
            for (let i = 0; i < data.length; i++) {
                const account = document.createElement('option');
                account.innerHTML = data[i].name;
                account.setAttribute('value', data[i].id);
                accountSelect.appendChild(account)
            };
        }
    });
};
function accountSelection() {
    masterCheck();
    if (accountSelect.value == 0) {
        newAccountInput.style.display = '';
        accountSelect.style.display = 'none'
    };
};

var checker = false
var tempCost = 0;
function containerChecker(cNumber) {
    fetch(`/api/container/amazon_container/${cNumber}`, {
        method: 'GET'
    }).then(function (response) {
        if (response.status == 500) {
            document.getElementById('uniqueMark').innerHTML = `&#10004;`;
        }
        return response.json();
    }).then(function (data) {
        if (data.id && client_list.value == data.user_id && accountSelect.value == data.account_id) {
            alert('This box is already assocaited with this account! Please use refill mode to add more items')
            let code = prompt('Please enter the passcode to override the restriction');
            if(code == '0523') {
                checker = true;
                amazon_box.id = data.id;
                amazon_box.user_id = data.user_id;
                amazon_box.account_id = data.account_id;
                tempCost = parseFloat(data.cost);
                length.value = (data.length/2.54).toFixed(2);
                width.value = (data.width/2.54).toFixed(2);
                height.value = (data.height/2.54).toFixed(2);
            } else {
                container_number.value = null;
            }
        } else if (data.id && client_list.value == data.user_id) {
            alert(`This box is already associated with the account: ${data.account.name}! Please use a new amazon box #`);
            let code = prompt('Please enter the passcode to override the restriction');
            if(code == '0523') {
                checker = true;
                amazon_box.id = data.id;
                amazon_box.user_id = data.user_id;
                amazon_box.account_id = data.account_id;
                tempCost = parseFloat(data.cost);
                length.value = (data.length/2.54).toFixed(2);
                width.value = (data.width/2.54).toFixed(2);
                height.value = (data.height/2.54).toFixed(2);
            } else {
                container_number.value = null;
            }
        } else if (data.id) {
            alert(`This box is already associated with a client ${data.user.name}! Please use a new amazon box #`);
            container_number.value = null;
        }
    })
};

var amazon_box = new Object();
var newClient = new Object();
var newAccount = new Object();
function amazonCreate() {
    if (itemCount < 1 && !confirm('No item was scanned! Continue to create an empty amazon box?')) {
        return
    };
    // loader.style.display = '';
    const length = document.getElementById('new_len');
    amazon_box.description = description.value.trim();
    amazon_box.length = length.value.trim()*2.54;
    amazon_box.width = width.value.trim()*2.54;
    amazon_box.height = height.value.trim()*2.54;
    amazon_box.volume = amazon_box.length * amazon_box.width * amazon_box.height;
    amazon_box.container_number = container_number.value.trim().toUpperCase();
    localStorage.setItem('refToNumber', amazon_box.container_number);
    // amazon_box.cost = itemCount;
    amazon_box.cost = 0;
    const newAccountName = newAccountInput.value.trim();
    const username_d = username.value.trim();
    const password_d = password.value.trim();
    if (username_d && password_d) {
        newClient.name = username_d;
        newClient.username = username_d;
        newClient.password = password_d;
        newAccount.prefix = newAccountName.substring(0,3);
        newAccount.name = newAccountName;
        userCreate(newClient, newAccount)
    } else if (newAccountName) {
        amazon_box.user_id = client_list.value;
        newAccount.user_id = client_list.value;
        newAccount.prefix = newAccountName.substring(0,3);
        newAccount.name = newAccountName;
        accountCreate(newAccount)
    } else if (checker) {
        amazon_box.cost += tempCost;
        updateCost(amazon_box.cost, amazon_box.id);
        itemCreate_newAM();
    } else {
        amazon_box.user_id = client_list.value;
        amazon_box.account_id = accountSelect.value;
        boxCreate(amazon_box)
    }
};
async function userCreate(data, data_2) {
    console.log('user created');
    const response = await fetch('/api/user/newUser', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
      });

      if (response.ok) {
       console.log("user inserted");
       user_data(data.name, data_2);
      } else {
        alert('try again')
   }
};
function user_data(name, data_2) {
    fetch(`/api/user/`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log('user_id fetched');
        for (let i = 0; i < data.length; i++) {
        userMap.set(data[i].name, data[i].id)
        };
        amazon_box.user_id = userMap.get(name);
        accountCreate({
         name: data_2.name,
         prefix: data_2.prefix,
         user_id: amazon_box.user_id
        })
    });
};
async function accountCreate(data) {
    console.log('account created');
    const response = await fetch('/api/account/amazon_newAccount', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
       console.log("account inserted");
       findAccountId(data.user_id)
      } else {
        alert('try again')
   }
};
function findAccountId(id) {
    fetch(`/api/user/accountsbyuser_id/${id}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log('account_id fetched');
        for (let i = 0; i < data.length; i++) {
            accouuntMap.set(data[i].name, data[i].id)
        };
        amazon_box.account_id = accouuntMap.get(newAccount.name);
        console.log(amazon_box);
        boxCreate(amazon_box)
    })
};
async function boxCreate(data) {
    console.log('boxCreate');
    const response = await fetch('/api/batch/amazon_box', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
       console.log("amazon box inserted");
       findContainerId(data.container_number);
      } else {
        alert('try again')
   }
};
function findContainerId(c_number) {
    console.log('getting container_id');
    fetch(`/api/container/amazon_container/${c_number}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log('container_id fetched');
       amazon_box.id = data.id
       itemCreate_newAM()
    })
};

var promises = [];
function itemCreate_newAM() {
    console.log('itemCreate');
    var rows = sku_table.rows;
    for (let i = 1; i < rows.length; i++) {
        var item = new Object()
        item.item_number = rows[i].cells[0].innerHTML;
        item.qty_per_sku = parseInt(rows[i].cells[1].innerHTML);
        item.user_id = amazon_box.user_id;
        item.account_id = amazon_box.account_id;
        item.container_id = amazon_box.id;
        item.description = amazon_box.description;
        promises.push(loadingItems_newAM(item, rows[i]));
    };
    removeItem();
    Promise.all(promises).then(() => {
        // loader.style.display = 'none';
        alert(`1 container(#${amazon_box.container_number}) with ${itemCount} items is inserted to client_id: ${amazon_box.user_id}!`)
        // resetBoxSku();
        location.reload();
    }).catch((e) => {console.log(e)})
};
async function loadingItems_newAM(data, row) {
    const response = await fetch('/api/item/new', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        console.log(`inserted ${data.item_number}`);
        row.setAttribute('class','bg-secondary');
    } else {
        alert('error occurs; please inform developers!')
    }
};


//tools
function resetBoxSku() {
    console.log('reset process occurs');
    if (accountSelect.value == 0) {
        location.reload();
    } else {
        sku_list.querySelectorAll('tr').forEach(i => i.remove());
        container_number.value = null;
        skuArr = [];
        itemCount = 0;
        // skuMap.clear();
        masterCheck();
        promises = [];
    }
};
function unattach() {
    if (client_list.value == 0) {
        password.style.display = '';
        username.style.display = ''
    } else {
        password.style.display = 'none';
        username.style.display = 'none'
    };
    const sku_number = document.getElementById('scan');
    sku_number.value = null;
    newAccountInput.value = null;
    username.value = null;
    password.value = null;
    const old_account = accountSelect.querySelectorAll('option');
    old_account.forEach(i => i.remove());
    const selectOption = document.createElement('option');
    selectOption.innerHTML = 'select account';
    const zero = document.createElement('option');
    zero.innerHTML = '--- create new account ---';
    zero.setAttribute('value', 0);
    accountSelect.appendChild(selectOption);
    accountSelect.appendChild(zero);
    document.getElementById('order_pre-check').style.display = 'none';
    document.getElementById('fake').style.display = '';
};
function masterCheck() {
    const description_d = description.value.trim();
    const length_d = length.value.trim();
    const width_d = width.value.trim();
    const height_d = height.value.trim();
    const container_d = container_number.value.trim();
    const client_list_d = client_list.value;
    const account_d = accountSelect.value;
    if (description_d && length_d && width_d && height_d && container_d.substring(0,2).toUpperCase() == 'AM' && container_d.length == 8 && client_list_d && account_d && validation(client_list_d, account_d)) {
        containerChecker(container_d);
        document.getElementById('order_pre-check').style.display = '';
        document.getElementById('fake').style.display = 'none';
    } else {
        document.getElementById('uniqueMark').innerHTML = '';
        document.getElementById('order_pre-check').style.display = 'none';
        document.getElementById('fake').style.display = '';
    }
};
function validation(c, a) {
    if (c == 0) {
        if (username.value.trim() && password.value.trim() && newAccountInput.value.trim()) {
            return true
        } else {
            return false
        }
    } else if (a == 0) {
        if (newAccountInput.value) {
            return true
        } else {
            return false
        }
    } else {
        return true
    }
};
function updateCost(cost, id) {
    fetch(`/api/container/updateCost/${cost}&${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'}
    });
};
async function updateEmptyContainer (id) {
    var updateddescription;
    if (localStorage.getItem('refToNumber')) {
        updateddescription = `items merged to a new container(${localStorage.getItem('refToNumber')}) via partial merge`
    } else if (localStorage.getItem('toContainer')) {
        updateddescription = `items merged to the exisited container(${localStorage.getItem('toContainer')}) via partial merge`
    };
    const response = await fetch(`/api/container/updatePostMerge`, {
        method: 'PUT',
        body: JSON.stringify({
            description: updateddescription,
            id: id,
            shipped_date: new Date().toLocaleDateString("en-US")
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        window.location.replace(`/merger`);
    }
};



//////////scanned items\\\\\\\\\\\
// var skuArr = [];
// var skuMap = new Map()
// function itemInput() {
//     const skuValue = sku.value.trim().toUpperCase();
//    if ((skuValue.substring(0,1) == 'X' && skuValue.length == 10) || (skuValue.length > 6 && skuValue.substring(0,1) != '-')) {
//     if (skuArr.includes(skuValue)) {
//         itemCount++;
//         const skuAmount = document.getElementById(`${skuValue}c`);
//         const totalAmount = parseInt(skuAmount.innerHTML) + 1;
//         skuAmount.innerHTML = totalAmount;
//         skuMap.set(skuValue, totalAmount);
//     } else {
//         itemCount++;
//         skuArr.push(skuValue);
//         skuMap.set(skuValue, 1);
//         const trTag = document.createElement('tr');
//         const skuLabel = document.createElement('td');
//         const skuInit = document.createElement('td');
//         trTag.appendChild(skuLabel);
//         trTag.appendChild(skuInit);
//         sku_list.prepend(trTag);
//         trTag.setAttribute('id', `${skuValue}t`)
//         skuInit.setAttribute('id', `${skuValue}c`);
//         skuInit.innerHTML = 1;
//         skuLabel.innerHTML = skuValue;
//     };
//     sku.value = null;
//    } else if (skuValue.substring(0,1) == '-' && skuValue.length > 6) {
//         const newSku = skuValue.substring(1, skuValue.length);
//         const skuAmount = document.getElementById(`${newSku}c`);
//         if (skuAmount) {
//             itemCount--;
//             const totalAmount = parseInt(skuAmount.innerHTML) - 1;
//             const trTag = document.getElementById(`${newSku}t`)
//             if (totalAmount < 1) {
//                 trTag.remove();
//                 skuMap.delete(newSku);
//                 skuArr = skuArr.filter(i => i != newSku);
//                 sku.value = null;
//             } else {
//                 skuAmount.innerHTML = totalAmount;
//                 skuMap.set(newSku, totalAmount);
//                 sku.value = null;
//             }
//         }
//    }

// };
function scanSKU() {
    const sku_number = document.getElementById('scan');
    fetch(`/api/item/infoPerNumber/${sku_number.value}`, {
        method: 'GET'
    }).then(function (response) {
        if (response.status == 500) {
            return null
        } else {
            return response.json();
        }
    }).then(function (data) {
        if (data && data.item_number){
            console.log(data);
            document.getElementById("scanDiv").style.display = 'none';
            unattachUser();
            const user = document.createElement('option');
            user.innerHTML = data.user.name;
            user.setAttribute('value', data.user_id);
            client_list.appendChild(user);
            client_list.disabled = true;
            const account = document.createElement('option');
            account.innerHTML = data.account.name;
            account.setAttribute('value', data.account_id);
            accountSelect.appendChild(account);
            if (data.description) {
                description.value = data.description
            }
        } else {
            unattachUser();
            const selectOption = document.createElement('option');
            selectOption.innerHTML = 'select client';
            const zero = document.createElement('option');
            zero.innerHTML = '--- create new client ---';
            zero.setAttribute('value', 0);
            client_list.appendChild(selectOption);
            client_list.appendChild(zero);
            client_data();
        }
    })
};
function unattachUser() {
    const old_user = client_list.querySelectorAll('option');
    old_user.forEach(i => i.remove());
    accountSelect.disabled = false;
};

// const creater_form = document.getElementById('creator_form');
// const quick_form = document.getElementById('qucik_receiving');
// const scanned_item = document.getElementById('scanned_item');
// const clientName_q = document.getElementById('clientName_q');
// const accountName_q = document.getElementById('accountName_q');
// const containerNumber_q = document.getElementById('containerNumber_q');
// const inserted_item = document.getElementById('inserted_item');
// function modeChange() {
//     if (mode.innerHTML == 'Create') {
//       localStorage.setItem('amazon_mode', 'Q');
//       mode.innerHTML = 'Refill';
//       creater_form.style.display = 'none';
//       quick_form.style.display ='';
//       document.getElementById("badge").classList.add('bg-danger');
//       document.getElementById("badge").classList.remove('bg-success');
//     } else {
//       localStorage.setItem('amazon_mode', 'C')
//       mode.innerHTML = 'Create';
//       creater_form.style.display = '';
//       quick_form.style.display ='none';
//       document.getElementById("badge").classList.add('bg-success');
//       document.getElementById("badge").classList.remove('bg-danger');
//     }
// };
// var quickContainerObj = new Object();
// function quickReceiving() {
//     const scannedBox = scanned_item.value.trim().toUpperCase();
//     if (scannedBox.substring(0,2) == 'AM' && scannedBox.length == 8) {
//         fetch(`/api/container/amazon_container/${scannedBox}`, {
//             method: 'GET'
//         }).then(function (response) {
//             return response.json();
//         }).then(function (data) {
//             quickContainerObj.user_id = data.user_id;
//             quickContainerObj.account_id = data.account_id;
//             quickContainerObj.container_id = data.id;
//             quickContainerObj.cost = data.cost;
//             quickContainerObj.container_number = scannedBox;
//             clientName_q.innerHTML = data.user.name;
//             accountName_q.innerHTML = data.account.name;
//             containerNumber_q.innerHTML = scannedBox;
//             scanned_item.value = null;
//         })
//     } else if (scannedBox.length > 4 && !scannedBox.includes('-')){
//         if (quickContainerObj.user_id) {
//             quickContainerObj.cost++;
//             quickContainerObj.item_number = scannedBox;
//             updateCost(quickContainerObj.cost, quickContainerObj.container_id);
//             duplicatationValidator(quickContainerObj);
//             // loadingItems(quickContainerObj);
//             scanned_item.value = null;
//             const newsku = document.createElement('div');
//             inserted_item.prepend(newsku);
//             newsku.innerHTML = `Insert <b>${scannedBox}</b> into <b>${quickContainerObj.container_number}</b>`
//         } else {
//             alert('You need to scan the existed amazon box first!');
//             scanned_item.value = null;
//         }

//     }
// };
// // var timer = null;
// // function delay(fn){
// //     clearTimeout(timer);
// //     timer = setTimeout(fn, 100)
// // };

// var itemchecker = false
// function duplicatationValidator(obj) {
//     fetch(`/api/item/findAllPerContainer/${obj.container_id}`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (item) {
//         for (let i = 0; i < item.length; i++) {
//             var uniqueItemN = item[i];
//             if(uniqueItemN.item_number == obj.item_number) {
//                 uniqueItemN.qty_per_sku++
//                 updateExistedItem(obj, uniqueItemN.qty_per_sku);
//                 itemchecker = true
//             };
//         };
//         if (itemchecker == false) {
//             loadingItems(obj);
//         } itemchecker = false;
//     });
// };
// async function updateExistedItem(obj, newSkuQ) {
//     const load = await fetch(`/api/item/updateQty_ExistedItem/${obj.container_id}&${obj.item_number}`, {
//         method: 'PUT',
//         body: JSON.stringify({
//             qty_per_sku: newSkuQ
//         }),
//         headers: {'Content-Type': 'application/json'}
//     })
// };

// //reload
// function reconciliation() {
//     location.reload();
// };

// if (localStorage.getItem('amazon_mode') == 'Q') {
//     document.getElementById('badge').click();
// }


// var allContainerArr = [];
// var emptyArr = [];
// function removeEmptyContainer() {
//     fetch(`/api/item/allItemAdmin`, {
//         method: 'GET'
//       }).then(function (response) {
//         return response.json();
//       }).then(function (data) {
//         for (let i = 0; i < data.length; i++) {
//             const item = data[i];
//             if(!allContainerArr.includes(item.container_id)) {
//                 allContainerArr.push(item.container_id)
//             };

//         };
//         fetch(`/api/container/allContainerAdmin`, {
//             method: 'GET'
//           }).then(function (response) {
//             return response.json();
//           }).then(function (data) {
//             for (let i = 0; i < data.length; i++) {
//                 const container = data[i];
//                 if(!allContainerArr.includes(container.id) && container.cost == 0) {
//                     emptyArr.push(container.id)
//                 }; //cost == 0 means the empty box has been recently billed and ready to get reset

//             };
//             if (!emptyArr.length) {
//                 alert('No empty container was found in the database')
//             } else {
//                 removeEmpty(emptyArr);
//             }
//           })
//       });
// };
// async function removeEmpty(Arr) {
//     const response = await fetch(`/api/container/destroyBulk/`, {
//         method: 'DELETE',
//         body: JSON.stringify({
//             id: Arr
//         }),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });

//     if (response.ok) {
//         alert(`Successfully remove ${Arr.length} empty containers! `)
//     }
// }
///// am-to-am transfer //////
function transferAM () {
    const rows = sku_table_am.rows;
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getAttribute('class')) {
            var transferredItem = new Object();
            transferredItem.item_number = rows[i].cells[0].innerText;
            transferredItem.qty_per_sku = parseInt(rows[i].cells[1].innerText);
            transferredItem.user_id = user_id_to;
            transferredItem.account_id = account_id_to;
            transferredItem.container_id = container_id_to;
            transferredItem.description = null;
            promises.push(loadingItems_newAM(transferredItem, rows[i]));
        };
    };
    removeItem();
    Promise.all(promises).then(() => {
        itemMerger(container_id_to);
    }).catch((e) => {console.log(e)})
};

const itemArr = [];
const objArr = [];
var promises_cleaning = [];
function itemMerger(container_id) {
    fetch(`/api/item/findAllPerContainer/${container_id}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
            const item_number = data[i].item_number;
            if (!itemArr.includes(item_number)) {
                itemArr.push(item_number);
                objArr.push(data[i])
            } else {
                const index = itemArr.indexOf(item_number);
                objArr[index].qty_per_sku = objArr[index].qty_per_sku + data[i].qty_per_sku;
                promises_cleaning.push(updateExistedItem(objArr[index]));
                promises_cleaning.push(deleteExistedItem(data[i]));
            }
        };
        Promise.all(promises_cleaning).then(() => {
            alert(`The container(#${container_id_to}) with ${itemCount} items is inserted to client_id: ${user_id_to}!`)
            location.reload();
        }).catch((e) => {console.log(e)})
        // if (data.length == itemArr.length) {
        //     console.log('no repeated boxes');
        //     removalQ();
        // }
    })
};
async function updateExistedItem(data) {
    const response = await fetch(`/api/item/updateQtyPerItemId/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            qty_per_sku: data.qty_per_sku
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log(`qty of ${data.item_number}(${data.id}) has been updated to ${data.qty_per_sku}`);
    }
};
async function deleteExistedItem(data) {
    const response = await fetch(`/api/item/destroy/${data.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log(`${data.item_number}(${data.id}) has been remove`);
    }
};
async function removeItemsOnly(id) {
    const response = await fetch(`/api/item/destroyPerContainer/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        alert(`Items associated with this box (id: ${id}) will be removed but the box remains in the database. This box still has pending receiving/storage charge!`);
        updateEmptyContainer(id)
    }
}
///delete function need protection for billing
