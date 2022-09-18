console.log(location.href, 'req_amazon sku_qty js');
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
//init
function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
}
function allItem() {
    fetch(`/api/item/allItem/${account_id}`, {
      method: 'GET'
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      for (let k = 0; k < data.length; k++) {
        const item = data[k];
        itemRef.set(item.id, item.item_number);
        containerRef.set(item.container_id, item.container.container_number);
        locationRef.set(item.container_id, item.container.location);
      };
      const container_data = data.reduce((r, a) => {
        r[a.container.container_number] = r[a.container.container_number] || [];
        r[a.container.container_number].push(a);
        return r;
      }, Object.create(null));
      const newData = Object.values(container_data);
      for (let i = 0; i < newData.length; i++) {
        const containerNumber = newData[i][0].container.container_number;
        containerMap.set(containerNumber, newData[i]);
      };
      var tr;
      tr = containerTable.getElementsByTagName('tr');
      var emptyBoxArr = [];
      for (let i = 1; i < tr.length; i++) {
        const container_number = tr[i].getElementsByTagName('td')[2].innerHTML;
        const sku = tr[i].getElementsByTagName('td')[3];
        const qty = tr[i].getElementsByTagName('td')[4];
        if(containerMap.get(container_number)){
        containerMap.get(container_number).forEach(item => {
          const singleSKU = document.createElement('div');
          const singleQty = document.createElement('div');
          singleQty.setAttribute('class','itemQ');
          singleQty.setAttribute('id',`${item.container_id}_${item.id}_${item.qty_per_sku}`)
          singleQty.setAttribute('onkeyup', `validationSKU(${item.container_id},${item.id},${item.qty_per_sku})`)
          singleSKU.innerHTML = item.item_number;
          singleQty.innerHTML = item.qty_per_sku;
          sku.appendChild(singleSKU);
          qty.appendChild(singleQty)
        })
        } else {
          emptyBoxArr.push(tr[i])
         tr[i].style.display ='none';
        }
      }
      emptyBoxArr.forEach(i => i.remove());
      if (tr.length == 1) {
        containerTable.style.display = 'none';
        document.getElementById('noSign').style.display = '';
      }
    })
};
allItem();
//helper tools
function validationSKU(container_id, item_id, qty_per_sku) {
  const qtyInput = document.getElementById(`${container_id}_${item_id}_${qty_per_sku}`);
  const qtysku = parseInt(qtyInput.innerHTML);
  if (qtysku <= qty_per_sku && qtysku > 0) {
    qtyInput.setAttribute('class', 'text-danger itemQ')
  } else {
    qtyInput.innerHTML = null;
    qtyInput.setAttribute('class', 'itemQ')
  };
};
function containerValidation(id) {
  const eachContainer = document.getElementById((`container_${id}`));
  const checkbox = eachContainer.getElementsByTagName('input');
  const singleQty = eachContainer.querySelectorAll('.itemQ');
  if (checkbox[0].checked) {
    for (let i = 0; i < singleQty.length; i++) {
      const div = singleQty[i];
      div.setAttribute('contenteditable',true)
    }
  } else {
    for (let i = 0; i < singleQty.length; i++) {
      const div = singleQty[i];
      const divInfo = singleQty[i].getAttribute('id').split('_');
      div.innerHTML = divInfo[2];
      div.removeAttribute('class','text-danger');
      div.setAttribute('class', 'itemQ');
      div.setAttribute('contenteditable',false)
    }
  }
};
// submit function
var requestedObjArr = [];
var requestedItemIdArr = [];
var masterArr = [];
var masterContainerIdArr = [];//to update shipped_date to containers which are empty after the request, so that it can be only billed once for storage fee afterwards
function GetSelected() {
  const code = new Date().valueOf();
  var fba = document.getElementById('amazon_ref').value.trim()
  fba = fba.toUpperCase();
  const notes = document.getElementById('notes').value;
  var table = document.getElementById("myTable");
  var selectedSkus = table.querySelectorAll(".text-danger");
  for (var i = 0; i < selectedSkus.length; i++) {
    const eachSkuInfo = selectedSkus[i].getAttribute('id').split('_');
    const container_id = parseInt(eachSkuInfo[0]);
    const item_id = parseInt(eachSkuInfo[1]);
    const original_qty = parseInt(eachSkuInfo[2]);
    masterContainerIdArr.push(container_id);
    const location = locationRef.get(container_id);
    const container_number = containerRef.get(container_id);
    const selectedAcccountId = containerMap.get(container_number)[0].account_id;
    masterAccountIdArr.push(selectedAcccountId);
    const item_number = itemRef.get(item_id);
    const qty_per_sku = parseInt(selectedSkus[i].innerHTML);
    costCount = costCount + qty_per_sku;
    const master_qty = original_qty - qty_per_sku;
    /////// EACH master_item obj to update the master box
    var master_item = new Object();
    master_item.id = item_id;
    master_item.qty_per_sku = master_qty;
    master_item.container_id = container_id;
    master_item.container_number = container_number;
    master_item.item_number = item_number;
    master_item.qty_from = original_qty;
    masterArr.push(master_item);
    ////// EACH requested obj to insert into a new container
    var requested_item = new Object();
    requested_item.item_number = item_number;
    requested_item.qty_per_sku = qty_per_sku;
    if (account_id) {
      requested_item.account_id = account_id
     } else {
      requested_item.account_id = masterAccountIdArr[0];
     };
    requested_item.description = `${container_number}:${location}`
    requestedObjArr.push(requested_item);
    requestedItemIdArr.push(item_id);
  };
   /////// create ONE new container
   var requestedContainer = new Object();
   if (account_id) {
    requestedContainer.account_id = account_id
   } else {
    requestedContainer.account_id = masterAccountIdArr[0];
   }
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
    updateMasterItem(masterArr, requestedObjArr, requestedContainer);
  } else {
    loader.style.display = 'none';
    alert('You need to select at least one box! 您需要选择至少一个箱货')
  }

};
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
    promises.push(record_item(objArr[i], container_number));
  };
  Promise.all(promises).then(() => {
    upload_file(s3, container_number)
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
function upload_file(e, container_number) {
  const promises_2 = [];
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];
  if (!file_2 && file) {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '1'));
    promises_2.push(upload_framwork(file, e))
  } else if (!file && file_2) {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '1'));
    promises_2.push(upload_framwork(file_2, e))
  } else if (file && file_2) {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '2'));
    promises_2.push(upload_framwork(file, e))
    promises_2.push(upload2F_framwork_file2(file_2, e))
  } else {
    promises_2.push(record_container(itemCounter, itemCollection, container_number, e, '0'));
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
function selectAll(id) {
  const eachContainer = document.getElementById((`container_${id}`));
  const checkbox = eachContainer.getElementsByTagName('input');
  const singleQty = eachContainer.querySelectorAll('.itemQ');
  if (checkbox[0].checked) {
    for (let i = 0; i < singleQty.length; i++) {
      const div = singleQty[i];
      div.setAttribute('class','text-danger itemQ');
    }
  }
};
////// request init & pre check ////////
function validation_request() {
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];
  var check_label = document.getElementById('label_not_required')
  if (!file && !file_2 && !check_label.checked) {
    alert('The shipping label is missing! Please attach a pdf file and try again! 无夹带档案！请夹带档案或者勾选无夹带档案栏，然后再试一遍。')
  } else {
    preCheckPage(file, file_2)
  }
};
var accountName;
function preCheckPage(file, file_2) {
  var fileName, fileName_2;
  var confirmationArr = [];
  var noRepeatArr = [];
  const notes = document.getElementById('notes').value;
  var table = document.getElementById("myTable");
  var selectedSkus = table.querySelectorAll(".text-danger");
  for (var i = 0; i < selectedSkus.length; i++) {
    accountName = selectedSkus[i].parentElement.parentElement.getElementsByTagName('td')[1].innerText;
    var eachBox;
    const eachSkuInfo = selectedSkus[i].getAttribute('id').split('_');
    const container_id = parseInt(eachSkuInfo[0]);
    const item_id = parseInt(eachSkuInfo[1]);
    const item_number = itemRef.get(item_id);
    const qty_per_sku = parseInt(selectedSkus[i].innerHTML);
    const container_number = containerRef.get(container_id);
    if (!noRepeatArr.includes(container_number)) {
      noRepeatArr.push(container_number);
      eachBox = `<tr>
      <td class='text-primary'><b>${container_number}</b><td>
      <td>${item_number}<td>
      <td>${qty_per_sku}<td>
      </tr>`;
    } else {
      eachBox = `<tr>
      <td><td>
      <td>${item_number}<td>
      <td>${qty_per_sku}<td>
      </tr>`;
    }
      confirmationArr.push(eachBox)
  };
  if (selectedSkus.length) {
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
        <th>箱码/ SKU/ 数量</th>
        <th></th>
        <th></th>
        </tr>
      </thead>
      <tbody>
      ${confirmationArr}
      </tbody>
      </table><hr><b>附注留言</b>: ${notes}<hr><b>档案:</b> <u>${fileName}</u> & <u>${fileName_2}</u>`).then(function () {
        loader.style.display = '';
        GetSelected()
    }, function () {
        console.log('Rejected.')
    });
  } else {
    alert('You need to select at least one box! 您需要选择至少一个SKU')
  }
};
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
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("myTable");
  switching = true;
  dir = "asc";
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount ++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
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
const record_item = async (itemData, container_number) => {
  const ref_number = itemData.item_number;
  const sub_number = container_number;
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
const record_container = async (count, collection, container_number, file_code, numberOfFile) => {
  const ref_number = container_number;
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
}
