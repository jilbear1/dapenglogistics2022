console.log(location.href, 'master homepage js');
const inventory_count = document.getElementById('inventory_c');
const pending_count = document.getElementById('pending_c');
var receivedCount = 0;
var requestedCount = 0;
var pendingCount = 0;
var shippedCount = 0;
var objectMap = new Map();
var boxNumberArr = [];

const inventory_promises = [];
const init = () => {
  inventory_promises.push(allBox());
  inventory_promises.push(allItem());
  Promise.all(inventory_promises).then(() => {
    var inventoryCount = receivedCount + requestedCount;
    pending_count.innerHTML = pendingCount;
    inventory_count.innerHTML = `${inventoryCount} (出货通知: ${requestedCount} )`
}).catch((e) => {console.log(e)})
}
const allBox = async () => {
  await fetch(`/api/user/allBox`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    for (let i = 0; i < data.length; i++) {
      const status = data[i].status;
      const box_number = data[i].box_number;
      objectMap.set(box_number, data[i]);
      boxNumberArr.push(box_number);
        if (status == 0 ) {
          pendingCount++
        } else if (status == 1) {
          receivedCount++
        } else if (status == 2) {
          requestedCount++
        } else if (status == 3){
          shippedCount++
        }
    };
  });
};

const accounts_content = document.getElementById("myDropdown");
const accountInput = document.getElementById("accountInput");
const boxInput = document.getElementById("boxInput");
const boxTable = document.getElementById("boxTable");
function box_show() {
  accounts_content.style.display = 'none';
  accountInput.style.display = 'none';
  boxTable.style.display = '';
  boxInput.style.display ='';
  containerInput.style.display = 'none';
  box_search_bar.style.display = '';
  document.getElementById('account_search').checked = false;
  if (localStorage.getItem('mode') == 'A') {
    localStorage.setItem('mode', 'C')
    mode.innerHTML = 'C';
    containerInput.style.display = 'none';
    box_search_bar.style.display = '';
    containerTable.style.display = 'none';
    boxTable.style.display = '';
    document.getElementById("badge").classList.add('bg-success');
    document.getElementById("badge").classList.remove('bg-danger');
    containerInput.value = null;
    box_search_bar.value = null;
    unattach()
  } else {
    unattach();
    box_search_bar.value = null;
  }
}
function account_show() {
  localStorage.clear();
  localStorage.setItem('mode', 'X')
  accounts_content.style.display = '';
  accountInput.style.display = '';
  boxInput.style.display ='none';
  containerTable.style.display = 'none';
  boxTable.style.display = 'none';
  mode.innerHTML = 'C';
  document.getElementById("badge").classList.add('bg-success');
  document.getElementById("badge").classList.remove('bg-danger');
  containerInput.value = null;
  box_search_bar.value = null;
  document.getElementById('box_search').checked = false
}

function filterFunction() {
  var input, filter, div, a, i;
  div = document.getElementById("myDropdown");
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
        a[i].style.display = "none";
    }
  }
}

function box_searchBtn(b) {
    for (i = 0; i < boxNumberArr.length; i++) {
      txtValue = boxNumberArr[i];
      if (txtValue.toUpperCase().indexOf(b.toUpperCase()) > -1) {
        filterFunction_box(boxNumberArr[i]);
        document.getElementById('searchNote').innerHTML = null;
      }
  };
};

function box_searching() {
unattach();
 var box_input = document.getElementById('myBoxInput').value.trim();
 if (box_input.length > 2) {
  box_searchBtn(box_input)
 }
};

function unattach() {
const tBody = document.getElementById('boxBody');
const old_search = tBody.querySelectorAll('tr');
old_search.forEach(i => i.remove());
///////////////////////////
document.getElementById('searchNote').innerHTML = null;
document.getElementById('containerSearchNote').innerHTML = null;
const tCBody = document.getElementById('containerBody');
const old_search_c = tCBody.querySelectorAll('tr');
old_search_c.forEach(i => i.remove());
}

function filterFunction_box(b) {
    const boxBody = document.getElementById('boxBody')
    const container = document.createElement('tr');
    const account = document.createElement('td');
    const box_number = document.createElement('td');
    const description = document.createElement('td');
    const order = document.createElement('td');
    const total_box = document.createElement('td');
    const qty_per_box = document.createElement('td');
    const sku = document.createElement('td');
    const date = document.createElement('td');
    const status = document.createElement('td');
    container.appendChild(account);
    container.appendChild(box_number);
    container.appendChild(description);
    container.appendChild(order);
    container.appendChild(total_box);
    container.appendChild(qty_per_box)
    container.appendChild(sku);
    container.appendChild(date);
    container.appendChild(status);
    account.innerHTML = `<a href="/account/${objectMap.get(b).account_id}" >${objectMap.get(b).account.name}</a>`;
    box_number.innerHTML = b;
    description.innerHTML = objectMap.get(b).description;
    order.innerHTML = objectMap.get(b).order;
    total_box.innerHTML = objectMap.get(b).batch.total_box;
    qty_per_box.innerHTML = objectMap.get(b).qty_per_box;
    sku.innerHTML = objectMap.get(b).sku;
    date.innerHTML = convertor(objectMap.get(b));
    status.innerHTML = convertor_status(objectMap.get(b).status);
    boxBody.appendChild(container);
};


function convertor(object) {
  const received_date = object.received_date;
  const shipped_date = object.shipped_date;
  const pending_date = object.batch.pending_date;
  const requested_date =object.requested_date;
  if (shipped_date) {
    return shipped_date
  } else if (requested_date) {
    return requested_date
  } else if (received_date) {
    return received_date
  } else {
    return pending_date
  }
};

function convertor_status(s) {
  if (s == 0) {
    return '挂单'
  } else if ( s == 1) {
    return '存货'
  } else if (s == 2) {
    return '通知寄出'
  } else if (s ==3) {
    return '完成出货'
  } else if (s == 98) {
    return '档案备存'
  }
}

// console.log(window.location.href);
/////////////////////////// amazon code here //////////////////
const mode = document.getElementById('mode');
const containerInput = document.getElementById('containerInput');
const box_search_bar = document.getElementById('myBoxInput');
var containerNumberArr =[];
var itemNumberArr = [];

function modeChange() {
  if (localStorage.getItem('mode') && localStorage.getItem('mode') != 'X' && document.getElementById('account_search').checked == false || document.getElementById('box_search').checked) {
    if (mode.innerHTML == 'C') {
      localStorage.setItem('mode', 'A');
      mode.innerHTML = 'A';
      containerInput.style.display = '';
      box_search_bar.style.display = 'none';
      containerTable.style.display = '';
      boxTable.style.display = 'none';
      document.getElementById("badge").classList.add('bg-danger');
      document.getElementById("badge").classList.remove('bg-success');
      containerInput.value = null;
      box_search_bar.value = null;
      unattach();
    } else {
      localStorage.setItem('mode', 'C')
      mode.innerHTML = 'C';
      containerInput.style.display = 'none';
      box_search_bar.style.display = '';
      containerTable.style.display = 'none';
      boxTable.style.display = '';
      document.getElementById("badge").classList.add('bg-success');
      document.getElementById("badge").classList.remove('bg-danger');
      containerInput.value = null;
      box_search_bar.value = null;
      unattach()
    }
  }
};
var containerMap = new Map();
var skuMap = new Map();
const allItem = async () => {
  await fetch(`/api/item/allItem`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    //sort items by item_number
    const item_data = data.reduce((r, a) => {
      r[a.item_number] = r[a.item_number] || [];
      r[a.item_number].push(a);
      return r;
    }, Object.create(null));
    //collection all skus (item_number)
    for (let k = 0; k < data.length; k++) {
      const item = data[k].item_number;
      if (!itemNumberArr.includes(item)) {
        itemNumberArr.push(item);
      }
    };
    itemNumberArr.forEach(number => {
      skuMap.set(number, item_data[number])
    });
    // sort items by container
    const container_data = data.reduce((r, a) => {
      r[a.container.container_number] = r[a.container.container_number] || [];
      r[a.container.container_number].push(a);
      return r;
    }, Object.create(null));
    const newData = Object.values(container_data);
    for (let i = 0; i < newData.length; i++) {
      const containerNumber = newData[i][0].container.container_number;
      if (containerNumber[0] != "T") {
        containerNumberArr.push(containerNumber);
        containerMap.set(containerNumber, newData[i]);
        if (newData[i][0].container.status == '1') {
          receivedCount++
        } else if (newData[i][0].container.status == '2') {
          requestedCount++
        }
      }
    }
  })
};
const containerTable = document.getElementById("containerTable");
function container_searching() {
  unattach();
   var container_input = containerInput.value.trim();
   if (container_input) {
      containerTable.style.display = '';
   };
   if (container_input.length > 2 && !isCharacterASpeical(container_input) && container_input[0] == '.') {
    document.getElementById('containerSearchNote').innerHTML = "No information was found according to your input! Please try again";
    const containerNewInput = container_input.substring(1, container_input.length);
    container_search(containerNewInput)
   } else if (container_input == '/all') {
    for (let i = 0; i < containerNumberArr.length; i++) {
      const each_of_all = containerNumberArr[i];
      if (each_of_all) {
        buildingRow_amazon(each_of_all)
      }
    }
  } else if (container_input.length > 2 && !isCharacterASpeical(container_input)) {
    document.getElementById('containerSearchNote').innerHTML = "This SKU does not exist in the system!"
    item_search(container_input)
  }
};
function container_search(b) {
    for (i = 0; i < containerNumberArr.length; i++) {
      let txtValue = containerNumberArr[i];
      if (txtValue.toUpperCase().indexOf(b.toUpperCase()) > -1) {
        buildingRow_amazon(containerNumberArr[i]);
        document.getElementById('containerSearchNote').innerHTML = null;
      }
  };
};
function item_search(skuSearchInput) {
  var container_numberArr_sku = [];
  for (i = 0; i < itemNumberArr.length; i++) {
    let txtValue = itemNumberArr[i];
    if (txtValue.toUpperCase().indexOf(skuSearchInput.toUpperCase()) > -1) {
      const containersPerSku = skuMap.get(itemNumberArr[i]);
      containersPerSku.forEach(itemObj => {
        let singleContainerN = itemObj.container.container_number
        if (!container_numberArr_sku.includes(singleContainerN)) {
          container_numberArr_sku.push(singleContainerN);
          buildingRow_amazon(singleContainerN)
        }
      });
      document.getElementById('containerSearchNote').innerHTML = null;
    }
};
};
function buildingRow_amazon(b) {
  const containerBody = document.getElementById('containerBody')
  const container = document.createElement('tr');
  const account = document.createElement('td');
  const container_number = document.createElement('td');
  const item = document.createElement('td');
  const qty_per_sku = document.createElement('td');
  const description = document.createElement('td');
  const date = document.createElement('td');
  const status = document.createElement('td');
  container.appendChild(account);
  container.appendChild(container_number);
  container.appendChild(item);
  container.appendChild(qty_per_sku)
  container.appendChild(description);
  container.appendChild(date);
  container.appendChild(status);
  account.innerHTML = `<a href="/account/${containerMap.get(b)[0].account_id}">${containerMap.get(b)[0].account.name}</a>`;
  container_number.innerHTML = b;
  for (let i = 0; i < containerMap.get(b).length; i++) {
    const singleItem = containerMap.get(b)[i];
    const listedItem = document.createElement('div');
    const itemAmount = document.createElement('div');
    listedItem.innerHTML = singleItem.item_number;
    itemAmount.innerHTML = singleItem.qty_per_sku;
    item.appendChild(listedItem);
    qty_per_sku.appendChild(itemAmount);
  };
  description.innerHTML = containerMap.get(b)[0].container.description;
  date.innerHTML = convertor_amazon(containerMap.get(b)[0].container);
  date.setAttribute('uk-tooltip', `received date ${newDateValidate(containerMap.get(b)[0].container.received_date)} ; requested date ${newDateValidate(containerMap.get(b)[0].container.requested_date)} ; shipped date ${newDateValidate(containerMap.get(b)[0].container.shipped_date)} ; bill for receiving ${newDateValidate(new Date(containerMap.get(b)[0].container.bill_received).toLocaleDateString("en-US"))} ; bill for storage ${newDateValidate(new Date(containerMap.get(b)[0].container.bill_storage).toLocaleDateString("en-US"))} ; bill for shipping ${newDateValidate(new Date(containerMap.get(b)[0].container.bill_shipped).toLocaleDateString("en-US"))}`)
  status.innerHTML = convertor_status(containerMap.get(b)[0].container.status);
  containerBody.appendChild(container);
};
///// helper functions //////
function convertor_amazon(object) {
  const received_date = object.received_date;
  const shipped_date = object.shipped_date;
  const requested_date =object.requested_date;
  if (shipped_date) {
    return shipped_date
  } else if (requested_date) {
    return requested_date
  } else if (received_date) {
    return received_date
  } else {
    return 'N/A'
  }
};
const isCharacterALetter = (char) => {
  return (/[a-zA-Z]/).test(char)
};
const isCharacterASpeical = (char) => {
  return (/[-]/).test(char)
};
function newDateValidate(date) {
  if (date == "12/31/1969" || !date) {
    return 'N/A'
  } return date
};
/////////////////////////////////
const skuSelect = document.getElementById('skuSelect').querySelector('select');
const bulkSelect = document.getElementById('bulkSelect').querySelector('select');
const skuResult = document.getElementById("skuResult");
const bodyParent = skuResult.querySelector('tbody');
const totalAmount = document.getElementById('searchNumber');
function skuListing() {
  unattachList();
  var skuArr = [];
  fetch(`/api/item/allItem`, {
    method: 'GET'
}).then(function (response) {
    return response.json();
}).then(function (data) {
  for (let i = 0; i < data.length; i++) {
    const singleSku = data[i].item_number;
    if (!skuArr.includes(singleSku)) {
      //////single select code here//////
      const option = document.createElement('option');
      option.setAttribute('id', singleSku);
      option.innerHTML = singleSku;
      skuSelect.appendChild(option);
      //////bulk select code here//////
      const bulkOption = document.createElement('option');
      bulkOption.setAttribute('id', singleSku);
      bulkOption.innerHTML = singleSku;
      bulkSelect.appendChild(bulkOption);
      skuArr.push(singleSku);
    }

  }
})
};
function searchBySku() {
  fetch(`/api/item/allItemPerNumber/${skuSelect.value}`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
  unattachTr();
  const headerParent = skuResult.querySelector('thead tr');
  const headerChild = document.createElement('th');
  headerChild.setAttribute('class', 'shadow-sm text-center col-2')
  headerParent.appendChild(headerChild);
  headerChild.innerHTML = data[0].item_number;
  // count++
  var qtyCount = 0;
  for (let i = 0; i < data.length; i++) {
    const containerNumberPerItem = data[i].container.container_number;
    const qtyPerItem= data[i].qty_per_sku;
    const trParent = document.createElement('tr');
    const bodyChild = document.createElement('td');
    bodyChild.setAttribute('class', 'col-1')
    trParent.appendChild(bodyChild);
    // emptyTd(count, trParent);
    const bodyChild_q = document.createElement('td');
    bodyChild_q.setAttribute('class', 'shadow-sm bg-info text-center col-2');
    bodyParent.appendChild(trParent);
    trParent.appendChild(bodyChild_q);
    bodyChild.innerHTML = containerNumberPerItem;
    bodyChild_q.innerHTML = qtyPerItem;
    qtyCount = qtyCount + qtyPerItem;
  };
  totalAmount.innerHTML = qtyCount;
})
};
function unattachList() {
  skuSelect.querySelectorAll('option').forEach(i => i.remove());
  bulkSelect.querySelectorAll('option').forEach(i => i.remove());
  removeBulkHistory();
};
function unattachTr() {
  totalAmount.innerHTML = 0;
  const headerParent = skuResult.querySelector('thead tr');
  bodyParent.querySelectorAll('tr').forEach(i => i.remove());
  headerParent.querySelectorAll('th').forEach(i => i.remove());
  const defaultTh = document.createElement('th');
  headerParent.appendChild(defaultTh);
  defaultTh.innerHTML = 'container/sku'
};
///////bulk selection & collection function ///////
const bulkResult = document.getElementById("bulkResult");
const collection = document.getElementById('collection');
const bodyParent_bulk = bulkResult.querySelector('tbody');
var bulkCollectionArr = [];
function skuCollection() {
  const selectedSku = bulkSelect.value;
  if (!bulkCollectionArr.includes(selectedSku)) {
    bulkCollectionArr.push(selectedSku);
    const item = document.createElement('div');
    item.setAttribute('class', 'text-primary col-6')
    collection.prepend(item);
    item.innerHTML = selectedSku;
  } else {
    bulkCollectionArr = bulkCollectionArr.filter(i => i != selectedSku);
    const allDiv = collection.querySelectorAll('div');
    for (let i = 0; i < allDiv.length; i++) {
      const skuToRemove = allDiv[i];
      if (skuToRemove.innerText == selectedSku) {
        skuToRemove.remove()
      }
    }
  };
};
var count, containerArr, itemArr, sumMap;
function searchByBulkSku() {
  sumMap = new Map();
  count = -1;
  containerArr = [];
  itemArr = [];
  bulkCollectionArr.sort();
  const id = merger(bulkCollectionArr)
  fetch(`/api/item/allItemPerNumber/${id}`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    for (let i = 0; i < data.length; i++) {
      const itemNumberPerItem = data[i].item_number;
      if (!itemArr.includes(itemNumberPerItem)) {
        sumMap.set(itemNumberPerItem, 0);
        itemArr.push(itemNumberPerItem);
        const headerParent = bulkResult.querySelector('thead tr');
        const headerChild = document.createElement('th');
        headerChild.setAttribute('class', 'shadow-sm text-center col-2')
        headerParent.appendChild(headerChild);
        sumMap.set(itemNumberPerItem, sumMap.get(itemNumberPerItem) + data[i].qty_per_sku);
        headerChild.innerHTML = data[i].item_number + ` <span id="sum_${itemNumberPerItem}"><span>`;
        count++ // to used for calculating the amount of empty cells
      } else {
        sumMap.set(itemNumberPerItem, sumMap.get(itemNumberPerItem) + data[i].qty_per_sku);
      };
      document.getElementById(`sum_${itemNumberPerItem}`).innerHTML = `(${sumMap.get(itemNumberPerItem)})`;
     /// create rows associated with that header ////
      const containerNumberPerItem = data[i].container.container_number;
      if(!containerArr.includes(containerNumberPerItem)) {
        containerArr.push(containerNumberPerItem);
        const qtyPerItem= data[i].qty_per_sku;
        const trParent = document.createElement('tr');
        const bodyChild = document.createElement('td');
        bodyChild.setAttribute('class', 'col-1')
        trParent.appendChild(bodyChild);// first column
        emptyTd(count, trParent);// middle colume - placement
        const bodyChild_q = document.createElement('td');
        bodyChild_q.setAttribute('class', 'shadow-sm bg-info text-center col-2');
        bodyParent_bulk.appendChild(trParent);
        trParent.appendChild(bodyChild_q);//last/ actual column
        bodyChild.innerHTML = containerNumberPerItem;
        bodyChild_q.innerHTML = qtyPerItem;
      } else {
        const y = containerArr.indexOf(containerNumberPerItem);
        const x = itemArr.indexOf(itemNumberPerItem) + 1;
        const qtyPerItem= data[i].qty_per_sku;
        const bodyChild_q = document.createElement('td');
        bodyChild_q.setAttribute('class', 'shadow-sm bg-info text-center col-2');
        bodyChild_q.innerHTML = qtyPerItem;
        const difference = x - bodyParent_bulk.querySelectorAll('tr')[y].querySelectorAll('td').length;
        emptyTd(difference, bodyParent_bulk.querySelectorAll('tr')[y])
        bodyParent_bulk.querySelectorAll('tr')[y].appendChild(bodyChild_q);
        console.log(containerNumberPerItem, itemNumberPerItem, qtyPerItem)
        console.log(x, y+1);
      }
    }
  });

};
////helper functions////////
function removeBulkHistory() {
  bulkCollectionArr = [];
  const allDiv = collection.querySelectorAll('div');
  allDiv.forEach(i => i.remove());
};
function emptyTd(x, trParent) {
  for (let n = 0; n < x; n++) {
    const emptytd = document.createElement('td');
    trParent.appendChild(emptytd);
  }
};
function resetBulkResult() {
  removeBulkHistory();
 const headerArr = bulkResult.querySelectorAll('thead tr');
 headerArr.forEach(i => i.remove());
 bodyParent_bulk.querySelectorAll('tr').forEach(i => i.remove());
 const orginTr = document.createElement('tr');
 orginTr.innerHTML = `<th onclick="sortSkuTable(0)">container/sku</th>`;
 bulkResult.querySelector('thead').appendChild(orginTr);
};
function sortSkuTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("bulkResult");
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
function merger(array) {
  var key = '-';
 for (let i = 0; i < array.length; i++) {
   key = key + "-" + array[i];
 };
 return key
}
init();
