console.log(location.href, 'master_req_amazon_sku js');
const locationAddress = location.href.split('/');
const account_id = locationAddress[locationAddress.length-1].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
const loader = document.getElementById('loader');
const containerTable = document.getElementById('myTable');
var containerMap = new Map();
var itemMap = new Map();
var itemRef = new Map();
var containerRef = new Map();
var locationRef = new Map();
var costCount = 0;
var masterAccountIdArr = [];

// submit function
var requestedObjArr = [];
var requestedItemIdArr = [];
var masterArr = [];
var masterContainerIdArr = [];//to update shipped_date to containers which are empty after the request, so that it can be only billed once for storage fee afterwards

async function createContainer(requestedObjArr, requestedContainer) {
  console.log('Container Created');
  const response = await fetch('/api/container/amazon_request', {
      method: 'post',
      body: JSON.stringify(requestedContainer),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
     console.log("amazon box inserted", `S3 = ${requestedContainer.s3}`);
     findContainerId(requestedContainer.container_number, requestedContainer.s3, requestedObjArr);
    } else {
      alert('try again')
 }
};
function findContainerId(c_number, s3, objArr) {
  console.log('getting container_id');
  fetch(`/api/container/amazon_container/${c_number}`, {
      method: 'GET'
  }).then(function (response) {
      return response.json();
  }).then(function (data) {
      console.log('container_id fetched');
     const containerID = data.id
     itemCreate(objArr, s3, containerID, c_number);
  })
};

var itemCounter = 0;
var itemCollection = 'Colletion: ';
function itemCreate(objArr, s3, id, container_number) {
  console.log('itemCreate');
  const promises = [];
  for (let i = 0; i < objArr.length; i++) {
    objArr[i].container_id = id;
    promises.push(loadingItems(objArr[i]));
    promises.push(record_item(objArr[i], container_number, id));
  };
  Promise.all(promises).then(() => {
    upload_file(s3, container_number, id)
  }).catch((e) => {console.log(e)})
};
async function loadingItems(data) {
  const response = await fetch('/api/item/new', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'}
  });
  if (response.ok) {
    itemCollection += `${data.item_number}(${data.qty_per_sku}), `;
    itemCounter += data.qty_per_sku;
  }
};
function upload_file(e, container_number, id) {
  const promises_2 = [];
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];
  if (!file_2 && file) {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '1', id));
    promises_2.push(upload_framwork(file, e))
  } else if (!file && file_2) {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '1', id));
    promises_2.push(upload_framwork(file_2, e))
  } else if (file && file_2) {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '2', id));
    promises_2.push(upload_framwork(file, e))
    promises_2.push(upload2F_framwork_file2(file_2, e))
  } else {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '0', id));
  };
  Promise.all(promises_2).then(() => {
    loader.style.display = 'none';
    document.location.reload();
  }).catch((e) => {console.log(e)})
};
async function upload_framwork(file, e) {
  let formData = new FormData();
  formData.append('file', file);
  formData.append('s3',e)
  const response = await fetch(`/api/container/upload`, {
    method: 'POST',
    body: formData
  });
  if (response.ok) {
    console.log(response);
  } else {
    alert(response.statusText);
  }
};
async function upload2F_framwork_file2(file, e) {
  let formData = new FormData();
  formData.append('file', file);
  formData.append('s3',e)
  const response = await fetch(`/api/container/upload_2`, {
    method: 'POST',
    body: formData
  });
  if (response.ok) {
    console.log(response);
  } else {
    alert(response.statusText);
  }
};
//////// update masterBox ////////
function updateMasterItem (arr, requestedObjArr, requestedContainer) {
  const promises_init = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item.qty_per_sku < 1) {
      promises_init.push(removeZeroItem(item));
      promises_init.push(record_itemRemove(item));
    } else {
      promises_init.push(updateRemainderItem(item));
      promises_init.push(record_itemUpdate(item));
    }
  };
  Promise.all(promises_init).then(() => {
    shipped_date_labeling(requestedObjArr, requestedContainer);
  }).catch((e) => {console.log(e)})
};
async function updateRemainderItem(data) {
  const response = await fetch(`/api/item/updateQty_ExistedItemId/${data.container_id}&${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {'Content-Type': 'application/json'}
  });
};
async function removeZeroItem(data) {
  const response = await fetch(`/api/item/destroy/${data.id}`, {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'}
  });
};
////// request init & pre check ////////
var accountName;

///file function////
function clear_file() {
  document.getElementById('label').value = null;
  document.getElementById('label_2').value = null;
  document.getElementById('amazon_ref').value = null;
  document.getElementById('label_2').style.display = 'none';
  document.getElementById('amazon_ref').style.display= 'none';
  const no_file = document.getElementById("label_not_required");
  if (no_file.checked) {
    document.getElementById('amazon_ref').style.display = ''
  }
};
function clear_noFile_radio() {
  const no_file = document.getElementById("label_not_required");
  if (no_file.checked) {
    document.getElementById('amazon_ref').value = null;
    no_file.checked = false;
  }
};
function second_file() {
  document.getElementById('label_2').style.display = '';
  document.getElementById('amazon_ref').style.display= '';
  clear_noFile_radio()
};
function check_amazon() {
  const no_file = document.getElementById("label_not_required");
  var amazon = document.getElementById('amazon_ref').value.trim();
  amazon = amazon.toUpperCase();
  if (!no_file.checked && document.getElementById('amazon_ref').style.display == '' || no_file.checked) {
    // if ( amazon.substring(0,3) != 'FBA' || amazon.length != 12) {
    //   alert('invalid amazon ref number! start with FBA following by XXXXXXXXX');
    // }
  } else {
   return
  }
};
/////record//////
const record_item = async (itemData, container_number, id) => {
  const ref_number = itemData.item_number;
  const sub_number = container_number + ` (#${id})`;
  const status_from = 1;
  const status_to = 2;
  const qty_to = itemData.qty_per_sku;
  const type = 11;
  const date = new Date().toISOString().split('T')[0];
  const action = `Client Requesting Item (Acct: ${accountName})`;
  const response = await fetch(`/api/record/record_create_client`, {
    method: 'POST',
    body: JSON.stringify({
      qty_to,
      sub_number,
      ref_number,
      status_from,
      status_to,
      date,
      type,
      action
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
};
const record_itemRemove = async (itemData) => {
  const ref_number = itemData.item_number;
  const sub_number = itemData.container_number;
  const status_from = 1;
  const status_to = 99;
  const qty_to = 0;
  const type = 1;
  const date = new Date().toISOString().split('T')[0];
  const action = `System Removing Item @ Amazon Request Queue`;
  const response = await fetch(`/api/record/record_create_client`, {
    method: 'POST',
    body: JSON.stringify({
      ref_number,
      sub_number,
      status_from,
      status_to,
      qty_to,
      type,
      date,
      action
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
};
const record_itemUpdate = async (itemData) => {
  const ref_number = itemData.item_number;
  const sub_number = itemData.container_number;
  const status_from = 1;
  const qty_from = itemData.qty_from;
  const qty_to = itemData.qty_per_sku;
  const type = 1;
  const date = new Date().toISOString().split('T')[0];
  const action = `System Updating Item @ Amazon Request Queue`;
  const response = await fetch(`/api/record/record_create_client`, {
    method: 'POST',
    body: JSON.stringify({
      ref_number,
      sub_number,
      status_from,
      qty_from,
      qty_to,
      date,
      type,
      action
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
};
const record_container = async (count, collection, container_number, file_code, numberOfFile, id) => {
  const ref_number = container_number + ` (#${id})`;
  const sub_number = file_code;
  const status_to = 2;
  const qty_to = count;
  const action = `Client Creating Container (Acct: ${accountName})`;
  const action_notes = `${collection}${numberOfFile} file(s)`;
  const type = 11;
  const date = new Date().toISOString().split('T')[0];
  const response = await fetch(`/api/record/record_create_client`, {
    method: 'POST',
    body: JSON.stringify({
      ref_number,
      sub_number,
      status_to,
      qty_to,
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

///cap function when all selected
const shipped_date_labeling = (requestedObjArrD, requestedContainerD) => {
  const shipped_date = new Date().toLocaleDateString("en-US");
  fetch(`/api/item/emptyContainerSearch/${JSON.stringify(masterContainerIdArr)}`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    for (let r = 0; r < data.length; r++) {
      const containerId = data[r].container_id;
      masterContainerIdArr = masterContainerIdArr.filter(i => i != containerId);
    }
    if (masterContainerIdArr.length) {
      const shippedPromises = [];
      shippedPromises.push(updateShippedDate(masterContainerIdArr, shipped_date));
      Promise.all(shippedPromises).then(() => {
        createContainer(requestedObjArrD, requestedContainerD);
      }).catch((e) => {console.log(e)})
    } else {
      console.log('no empty box! :)');
      createContainer(requestedObjArrD, requestedContainerD);
    }
  })
};
const updateShippedDate = async (id, shipped_date) => {
  const response = await fetch(`/api/container/shipped_date_labeling`, {
    method: 'PUT',
    body: JSON.stringify({
      shipped_date: shipped_date,
      id: id
    }),
    headers: {'Content-Type': 'application/json'}
  });
  response.ok?console.log(`updated the ending date to box id: ${id}`):console.log('failed to update');
};
/////new functions starts here
var originalList = new Map();
const selectedItemArr = [];
const focusListener = (event) => {
  const selectedItem = event.target.parentElement.nextSibling.nextSibling.nextSibling.nextSibling.innerText;
  if (!selectedItemArr.includes(selectedItem)) {
    selectedItemArr.push(selectedItem);
    amBoxFetch(selectedItem);
  };
  const boxCollection = event.target.parentElement.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
  const oldContent = boxCollection.innerHTML;
  const oldContentContext = boxCollection.innerText;
  if (!boxCollection.innerText.includes('AM')) {
    boxCollection.innerHTML = originalList.get(boxCollection.getElementsByTagName('input')[0].id);
  } else {
    const containerArr = boxCollection.innerText.split(', ');
    var totalCount = 0;
    for (let i = 0; i < containerArr.length; i++) {
      const element = containerArr[i];
      const qty_per_sku = parseInt(element.split('(')[1].split(')')[0]);
      const container_number = element.split('(')[0];
      totalCount += qty_per_sku
    };
    boxCollection.innerHTML = `<input type="number" value=${totalCount} id="${oldContentContext}" class="inputCollection uk-input uk-form-width-small uk-form-small text-danger" onkeyup="checkSKU(event, ${totalCount})" placeholder="0">`
    originalList.set(oldContentContext, oldContent);
  }
};
const checkSKU = (event, number) => {
  if (parseInt(event.target.value)<=parseInt(number) && parseInt(event.target.value)>0) {
    event.target.className = "uk-input inputCollection uk-form-width-small uk-form-small text-danger";
  } else {
    event.target.value = null;
    event.target.className = "uk-input uk-form-width-small uk-form-small";
  }
};
///1. submition btn pressed
function validation_request(event) {
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];
  var check_label = document.getElementById('label_not_required')
  if (!file && !file_2 && !check_label.checked) {
    alert('The shipping label is missing! Please attach a pdf file and try again! 无夹带档案！请夹带档案或者勾选无夹带档案栏，然后再试一遍。')
  } else {
    preCheckPage(file, file_2, event)
  }
};
//2. pre-check process
function preCheckPage(file, file_2, event) {
  var fileName, fileName_2;
  var confirmationArr = [];
  const notes = document.getElementById('notes').value;
  var table = document.getElementById("skuTable");
  var allInputs = table.querySelectorAll('.inputCollection')
  for (var i = 0; i < allInputs.length; i++) {
    accountName = allInputs[i].parentElement.previousElementSibling.previousElementSibling.innerText;
    var eachBox;
    const qty_per_sku = allInputs[i].value;
    const item_number = allInputs[i].parentElement.previousElementSibling.innerText;
    const relatedBoxes = allInputs[i].id;
    const relatedBoxesArr = relatedBoxes.split(', ');
      eachBox = `<tr>
      <td class='text-primary'><b>${item_number}</b><td>
      <td>${qty_per_sku}<td>
      </tr>`;
      confirmationArr.push(eachBox);
  };
  if (allInputs.length) {
    confirmationArr = confirmationArr.join('');
      if (file) {
        fileName = file.name
      } else {
        fileName = `no file`
      };
      if (file_2) {
        fileName_2 = file_2.name
      } else {
        fileName_2 = `no file`
      };
      UIkit.modal.confirm(`<small class='text-primary' uk-tooltip="title: This page is a pre-check step before proceeding the confirmation. Please review your request order. If there is any input error, simply click “Cancel” and correct it. Otherwise, click “OK” to continue; pos: right">此页为检查页面，若发现输入/选择错误，请按“Cancel”并更改；若所有输入皆正确，请按“OK”完成通知</small><table class="uk-table uk-table-small uk-table-divider">
      <thead>
        <tr>
        <th>SKU/ 数量</th>
        <th></th>
        </tr>
      </thead>
      <tbody>
      ${confirmationArr}
      </tbody>
      </table><hr><b>附注留言</b>: ${notes}<hr><b>档案:</b> <u>${fileName}</u> & <u>${fileName_2}</u>`).then(function () {
        loader.style.display = '';
        GetSelected(event)
    }, function () {
        console.log('Rejected.')
    });
  } else {
    alert('You need to select at least one box! 您需要选择至少一个SKU')
  }
};
//3. action trigger
function GetSelected(event) {
  const code = new Date().valueOf();
  var fba = document.getElementById('amazon_ref').value.trim()
  fba = fba.toUpperCase();
  const notes = document.getElementById('notes').value;
  var table = document.getElementById("skuTable");
  var allInputs = table.querySelectorAll('.inputCollection');
  for (var j = 0; j < allInputs.length; j++) {
    accountName = allInputs[j].parentElement.previousElementSibling.previousElementSibling.innerText;
    var requestedQty = allInputs[j].value;
    const item_number = allInputs[j].parentElement.previousElementSibling.innerText.trim();
    const relatedBoxes = allInputs[j].id;
    var sourceBoxArr = relatedBoxes.split(', ');
    costCount += parseInt(requestedQty);
    for (var i = 0; i < sourceBoxArr.length; i++) {
      if(sourceBoxArr[i] && requestedQty>0){
        var qty_per_sku = 0;
        const container_number = sourceBoxArr[i].split('(')[0];
        const selectedAcccountId = amBoxMap.get(`${container_number}*${item_number}`).account_id;
        const container_id = amBoxMap.get(`${container_number}*${item_number}`).container_id;
        const location = amBoxMap.get(`${container_number}*${item_number}`).container.location;
        const item_id = amBoxMap.get(`${container_number}*${item_number}`).id;
        const originalQty= parseInt(amBoxMap.get(`${container_number}*${item_number}`).qty_per_sku);
        masterContainerIdArr.push(container_id);
        masterAccountIdArr.push(selectedAcccountId);
        var master_qty;
        if (requestedQty >= originalQty) {
          master_qty=0;
          requestedQty-=originalQty
          qty_per_sku=originalQty
        } else {
          master_qty=originalQty-requestedQty;
          qty_per_sku=requestedQty;
          requestedQty=0;
          sourceBoxArr.splice(i+1, sourceBoxArr.length);
        };
        /////// EACH master_item obj to update the master box
        var master_item = new Object();
        master_item.id = item_id;
        master_item.qty_per_sku = master_qty;
        master_item.container_id = container_id;
        master_item.container_number = container_number;
        master_item.item_number = item_number;
        master_item.qty_from = master_qty+qty_per_sku;
        masterArr.push(master_item);
        ////// EACH requested obj to insert into a new container
        var requested_item = new Object();
        requested_item.item_number = item_number;
        requested_item.qty_per_sku = qty_per_sku;
        requested_item.account_id = masterAccountIdArr[0];
        requested_item.description = `${container_number}:${location}`
        requestedObjArr.push(requested_item);
        requestedItemIdArr.push(item_id);
      }
    };
  };
   /////// create ONE new container
   var requestedContainer = new Object();
   requestedContainer.account_id = masterAccountIdArr[0];
   requestedContainer.cost = costCount;
   requestedContainer.fba = fba;
   requestedContainer.location = 'virtual';
   requestedContainer.notes = notes;
   requestedContainer.s3 = code;
   if (fba) {
    requestedContainer.container_number = `REQ-${fba}`
   } else {
    requestedContainer.container_number = `REQ-${code}`
   };
  if (requestedObjArr.length) {
    event.target.innerHTML = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only"> 整理资料中...</span>`;
    event.target.onclick = null;
    updateMasterItem(masterArr, requestedObjArr, requestedContainer);
  } else {
    loader.style.display = 'none';
    alert('You need to select at least one box! 您需要选择至少一个箱货')
  }

};

const amBoxMap = new Map();
const amBoxFetch = async (item_number) => {
  await fetch(`/api/item/allItemPerItemNumber/${item_number}`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      console.log(`fetched data: ${element.item_number} in the box: ${element.container.container_number}`);
      amBoxMap.set(`${element.container.container_number}*${item_number.trim()}`, element);
    }
  })
}

////remove any tag which does not have modal per dataTable page
var aTagArr = document.getElementsByClassName('aTagCollection');
const collectionFilter = () => {
  aTagArr = document.getElementsByClassName('aTagCollection');
  for (let i = 0; i < aTagArr.length; i++) {
    const href = aTagArr[i].href.split('#')[1];
    if (document.getElementById(href)) {
      aTagArr[i].style.display = '';
    } else {
      aTagArr[i].remove();
    }
  }
};
setInterval(collectionFilter, 100);
