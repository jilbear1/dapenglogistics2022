console.log(location.href, 'master admin_homepage.js');
const inventory_count = document.getElementById('inventory_c');
const pending_count = document.getElementById('pending_c');
const mode = document.getElementById('mode');
const boxInput = document.getElementById("boxInput");
const containerInput = document.getElementById('containerInput');
const record_dashboard = document.getElementById('record_dashboard');
const log_body = document.getElementById('log_body');
var receivedCount = 0;
var requestedCount = 0;
var pendingCount = 0;
var shippedCount = 0;
var objectMap = new Map();
var locationMap = new Map()
var boxNumberArr = [];
var containerNumberArr =[];
var itemNumberArr = [];
var locationArr = [];
var locationArr_amazon = [];
var preUpdateArr = [];
var preUpdateContainerArr = [];
var xcNumberArr = [];

function allBox() {
    fetch(`/api/user/allBox_admin`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
          const status = data[i].status;
          const box_number = data[i].box_number;
          const location = data[i].location;
          //set up box_number-object map
          objectMap.set(box_number, data[i]);

          //collect box_number
          boxNumberArr.push(box_number);

          //collect xc box_number
          if (box_number.substring(0,2) == 'AC' && !data[i].batch_id) {
            xcNumberArr.push(box_number);
          }

            // collect location data
            if (!locationArr.includes(location)) {
                locationArr.push(location)
            };
            ///count function
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
        var inventoryCount = receivedCount + requestedCount;
        pending_count.innerHTML = pendingCount;
        inventory_count.innerHTML = `${inventoryCount} (${requestedCount} requested)`;
        // set up location - object map
        const location_data = data.reduce(function (r, a) {
          r[a.location] = r[a.location] || [];
          r[a.location].push(a);
          return r;
        }, Object.create(null));
        for (let j = 0; j < locationArr.length; j++) {
          const element = locationArr[j];
          locationMap.set(element, location_data[element])
        };
    });
};
const boxTable = document.getElementById("boxTable");
function box_searching() {
  unattach();
   var box_input = document.getElementById('myBoxInput').value.trim();
   if (box_input) {
      boxTable.style.display = '';
   };
   if (box_input.length > 2 && !isCharacterASpeical(box_input) && box_input[0] != '/') {
    document.getElementById('searchNote').innerHTML = "No information was found according to your input! Please try again"
    box_search(box_input)
   } else if (isCharacterALetter(box_input[0]) && !isNaN(box_input[1])) {
    document.getElementById('searchNote').innerHTML = "This location is not associated with any box"
    location_search(box_input, locationArr)
   } else if (box_input == '/all') {
    for (let i = 0; i < boxNumberArr.length; i++) {
      const each_of_all = boxNumberArr[i];
      if (each_of_all) {
        buildingRow(each_of_all)
      }
    }
  } else if (box_input.substring(0,3) == '/xc') {
    if (box_input == '/xc') {
      for (let i = 0; i < boxNumberArr.length; i++) {
        const eachXc = xcNumberArr[i];
          if (eachXc) {
            buildingRow(eachXc)
          }
        }
    } else if (box_input == '/xc4'){
      for (let i = 0; i < boxNumberArr.length; i++) {
        const eachXc = xcNumberArr[i];
        if (eachXc && objectMap.get(eachXc).status == 4) {
          buildingRow(eachXc)
        }
      }
    } else if (box_input == '/xc5') {
      for (let i = 0; i < boxNumberArr.length; i++) {
        const eachXc = xcNumberArr[i];
        if (eachXc && objectMap.get(eachXc).status == 5) {
          buildingRow(eachXc)
        }
      }
    }
  }
};
function box_search(b) {
    for (i = 0; i < boxNumberArr.length; i++) {
      let txtValue = boxNumberArr[i];
      if (txtValue.toUpperCase().indexOf(b.toUpperCase()) > -1) {
        buildingRow(boxNumberArr[i]);
        document.getElementById('searchNote').innerHTML = null;
      }
  };
};
function location_search(l, arr) {
  for (i = 0; i < arr.length; i++) {
    let txtValue = arr[i];
    if (txtValue && txtValue.toUpperCase().indexOf(l.toUpperCase()) > -1) {
      if (localStorage.getItem('mode') == 'C') {
        locationMap.get(arr[i]).forEach((obj)=> {buildingRow(obj.box_number)});
        document.getElementById('searchNote').innerHTML = null;
      } else if (localStorage.getItem('mode') == 'A') {
        var container_numberArr_s = [];
        locationMap_amazon.get(arr[i]).forEach((obj)=> {
          if (!container_numberArr_s.includes(obj.container.container_number)) {
            container_numberArr_s.push(obj.container.container_number);
            buildingRow_amazon(obj.container.container_number);
          }
        });
        document.getElementById('containerSearchNote').innerHTML = null;
      }
    }
  }
};
function buildingRow(b) {
    preUpdateArr.push(objectMap.get(b));
    const boxBody = document.getElementById('boxBody')
    const container = document.createElement('tr');
    const user = document.createElement('td');
    const account = document.createElement('td');
    const box_number = document.createElement('td');
    const description = document.createElement('td');
    const order = document.createElement('td');
    const total_box = document.createElement('td');
    const qty_per_box = document.createElement('td');
    const location = document.createElement('td');
    const date = document.createElement('td');
    const status = document.createElement('td');
    container.appendChild(user);
    container.appendChild(account);
    container.appendChild(box_number);
    container.appendChild(description);
    container.appendChild(order);
    container.appendChild(total_box);
    container.appendChild(qty_per_box)
    container.appendChild(location);
    container.appendChild(date);
    container.appendChild(status);
    user.innerHTML = objectMap.get(b).user.name
    account.innerHTML = objectMap.get(b).account.name;
    box_number.innerHTML = `<a href="/admin/box/${b}" >${b}</a>`;
    description.innerHTML = objectMap.get(b).description;
    if (!objectMap.get(b).batch_id) {
      order.innerHTML = `$ ${objectMap.get(b).order}/ qty`;
      date.innerHTML = `total $${objectMap.get(b).cost}`;
      date.setAttribute('uk-tooltip', `received date ${newDateValidate(objectMap.get(b).received_date)} ; requested date ${newDateValidate(objectMap.get(b).requested_date)} ; shipped date ${newDateValidate(objectMap.get(b).shipped_date)} ; bill for receiving ${newDateValidate(new Date(objectMap.get(b).bill_received).toLocaleDateString("en-US"))} ; bill for storage ${newDateValidate(new Date(objectMap.get(b).bill_storage).toLocaleDateString("en-US"))} ; bill for shipping ${newDateValidate(new Date(objectMap.get(b).bill_shipped).toLocaleDateString("en-US"))}`)

    } else {
      order.innerHTML = objectMap.get(b).order;
      total_box.innerHTML = objectMap.get(b).batch.total_box;
      date.innerHTML = convertor(objectMap.get(b));
      date.setAttribute('uk-tooltip', `pending date ${newDateValidate(objectMap.get(b).batch.pending_date)} ; received date ${newDateValidate(objectMap.get(b).received_date)} ; requested date ${newDateValidate(objectMap.get(b).requested_date)} ; shipped date ${newDateValidate(objectMap.get(b).shipped_date)} ; bill for receiving ${newDateValidate(new Date(objectMap.get(b).bill_received).toLocaleDateString("en-US"))} ; bill for storage ${newDateValidate(new Date(objectMap.get(b).bill_storage).toLocaleDateString("en-US"))} ; bill for shipping ${newDateValidate(new Date(objectMap.get(b).bill_shipped).toLocaleDateString("en-US"))}`)

    }
    qty_per_box.innerHTML = objectMap.get(b).qty_per_box;
    location.innerHTML = objectMap.get(b).location;
    status.innerHTML = convertor_status(objectMap.get(b).status);
    boxBody.appendChild(container);
};
///// helper functions //////
function unattach() {
  document.getElementById('searchNote').innerHTML = null;
  document.getElementById('containerSearchNote').innerHTML = null;
  preUpdateArr = [];
  preUpdateContainerArr = [];
  boxTable.style.display = 'none';
  containerTable.style.display = 'none';
  const tBody = document.getElementById('boxBody');
  const tCBody = document.getElementById('containerBody');
  const old_search = tBody.querySelectorAll('tr');
  const old_search_c = tCBody.querySelectorAll('tr');
  old_search.forEach(i => i.remove());
  old_search_c.forEach(i => i.remove());
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
    return 'pending'
  } else if ( s == 1) {
    return 'received'
  } else if (s == 2) {
    return 'requested'
  } else if (s ==3) {
    return 'shipped'
  } else if (s == 4) {
    return 'xc pre-billed'
  } else if (s == 5) {
    return 'xc billed'
  } else if (s == 98) {
    return 'archived'
  }
};
function newDateValidate(date) {
  if (date == "12/31/1969" || !date) {
    return 'N/A'
  } return date
};
///master functions////
const edit_btn = document.getElementById('edit_btn');
const update_btn = document.getElementById('update_btn');
const update_select = document.getElementById('update_select');
const edit_select = document.getElementById('edit_select');
const update_date_select = document.getElementById('update_date_select');
const update_date_btn = document.getElementById('update_date_btn');
const homepage_btn = document.getElementById('homepage');
///security////
function passcode(w) {
  let code = prompt("Please enter the passcode");
  if (code == '0523' && w == 's') {
    localStorage.setItem('pass', 'status update')
    edit_btn.style.display = 'none';
    update_btn.style.display = 'none';
    edit_select.style.display = '';
  } else if (code == '0523' && w == 'd') {
    localStorage.setItem('pass', 'date update')
    update_btn.style.display = 'none';
    edit_btn.style.display = 'none';
    update_select.style.display = '';
  } else {
    alert('Incorrect passcode')
  }
};
function preChangeConfirm() {
  let code_2 = prompt('Please enter the passcode again to confirm the change!');
  if (code_2 == '0523') {
    const status = parseInt(edit_select.value);
    let idArr = [];
    for (let i = 0; i < preUpdateArr.length; i++) {
      const box_id = preUpdateArr[i].id;
      idArr.push(box_id)
    };
    if (status == 99) {
      mannual_delete(idArr)
    } else {
      mannual_update(status, idArr)
    };
    alert(`${preUpdateArr.length} items were updated to status ${status}!`)
    location.reload();
  }
};
////fetch function for status update, delete, and date update//////
function mannual_update(status, box_id) {
  fetch(`/api/box/master_update_status`, {
    method: 'PUT',
    body: JSON.stringify({
        box_id,
        status
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
};
function mannual_delete(box_id) {
 fetch(`/api/box/destroy`, {
    method: 'DELETE',
    body: JSON.stringify({
      box_id
  }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
};
function mannual_date_update(id, date, s) {
  fetch(`/api/box/dateUpdate_${s}`, {
    method: 'PUT',
    body: JSON.stringify({
        id,
        date
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
};
//helper functions//
const isCharacterALetter = (char) => {
  return (/[a-zA-Z]/).test(char)
};
const isCharacterASpeical = (char) => {
  return (/[-]/).test(char)
};
//reload without reset
if (localStorage.getItem('pass') == 'status update') {
  edit_btn.style.display = 'none';
  edit_select.style.display = '';
  update_btn.style.display = 'none';
} else if (localStorage.getItem('pass') == 'date update') {
  edit_btn.style.display = 'none';
  update_btn.style.display = 'none';
  update_select.style.display =''
};
function preUpdateConfirm() {
  if (update_select.value) {
    update_date_btn.style.display ='';
  } else {
    update_date_btn.style.display ='none';
    update_date_select.value = null;
  }
};
function finalConfirmation() {
  if (!preUpdateArr.length) {
    update_date_select.value = null;
    alert('You need to select at least one box to procced the update function');
  } else {
    if (confirm(`UPDATE ${update_select.value} of ${preUpdateArr.length} ITEMS to ${update_date_select.value}?`)) {
      let password = prompt('Please enter the passcode again to confirm the change!');
      if (password == '0523') {
        const chosenStatus = update_select.value;
        var newDate = update_date_select.value;
        let idArr = [];
        if (!newDate) {
          newDate = null;
        };
        for (let i = 0; i < preUpdateArr.length; i++) {
          var box_id = preUpdateArr[i].id;
          if (chosenStatus == 'pending_date') {
            box_id = preUpdateArr[i].batch_id
          };
          idArr.push(box_id)
        };
        mannual_date_update(idArr, newDate, chosenStatus);
        alert(`${chosenStatus} of ${preUpdateArr.length} items were updated to ${newDate}!`)
        location.reload();
      } else {
        alert('incorrect password!');
        finalConfirmation()
      }
    }
  }
};
// rest after clicking master functions
function reset() {
  if (mode.innerHTML == 'C') {
    update_date_btn.style.display = 'none';
    update_select.style.display = 'none';
    edit_select.style.display = 'none'
    edit_btn.style.display = '';
    update_btn.style.display = ''
    localStorage.clear();
  }
};
//--------------------------------------------------------------------//
function modeChange() {
  if (mode.innerHTML == 'C') {
    localStorage.setItem('mode', 'A');
    mode.innerHTML = 'A';
    containerInput.style.display = '';
    boxInput.style.display = 'none';
    edit_btn.style.display = 'none';
    update_btn.style.display = 'none';
    edit_select.style.display = 'none';
    update_select.style.display = 'none';
    update_date_btn.style.display = 'none';
    homepage_btn.href = '/admin/master_page_amazon';
    homepage_btn.innerText ='Amazon Home';
    document.getElementById("badge").classList.add('bg-danger');
    document.getElementById("badge").classList.remove('bg-success');
    document.getElementById('myBoxInput').value = null;
    unattach();
  } else {
    localStorage.setItem('mode', 'C')
    mode.innerHTML = 'C';
    containerInput.style.display = 'none';
    boxInput.style.display = '';
    edit_btn.style.display = '';
    update_btn.style.display = '';
    homepage_btn.href = '/admin/master_page';
    homepage_btn.innerText = 'Home Page';
    document.getElementById("badge").classList.add('bg-success');
    document.getElementById("badge").classList.remove('bg-danger');
    myContainerInput.value = null;
    unattach()
  }
};
// document.getElementById('numberOfItems').innerHTML = `${preUpdateArr.length} items; may take up to ${preUpdateArr.length/100} seconds`;
// document.getElementById('loader').style.display = '';

///////////////////////////////AMAZON ITEMS ARE HERE///////////////////////////////
const myContainerInput = document.getElementById('myContainerInput');
var containerMap = new Map();
var skuMap = new Map();
var locationMap_amazon = new Map();
function allItem() {
  fetch(`/api/item/allItemAdmin`, {
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
      const location = newData[i][0].container.location;
      const containerNumber = newData[i][0].container.container_number;
      containerNumberArr.push(containerNumber);
      containerMap.set(containerNumber, newData[i]);
      if (newData[i][0].container.status == '1') {
        receivedCount++
      } else if (newData[i][0].container.status == '2') {
        requestedCount++
      };
      if (!locationArr_amazon.includes(location)) {
        locationArr_amazon.push(location)
      };
      const location_data = data.reduce(function (r, a) {
        r[a.container.location] = r[a.container.location] || [];
        r[a.container.location].push(a);
        return r;
      }, Object.create(null));
      for (let j = 0; j < locationArr_amazon.length; j++) {
        const element = locationArr_amazon[j];
        locationMap_amazon.set(element, location_data[element])
      };
    };
    allBox();
  })
};

var allXCArr = [];
var fourXCArr = [];
var fiveXCArr = [];
function xcContainer() {
  fetch(`/api/container/allXCAdmin`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    for (let i = 0; i < data.length; i++) {
      const aCharge = data[i];
      if (!allXCArr.includes(aCharge)) {
        allXCArr.push(aCharge);
        if (!fourXCArr.includes(aCharge) && aCharge.status == 4) {
          fourXCArr.push(aCharge)
        };
        if (!fiveXCArr.includes(aCharge) && aCharge.status == 5) {
          fiveXCArr.push(aCharge)
        }
      }
    }
  })
}
const containerTable = document.getElementById("containerTable");
function container_searching() {
  unattach();
   var container_input = document.getElementById('myContainerInput').value.trim();
   if (container_input) {
      containerTable.style.display = '';
   };
   if (container_input.length > 2 && !isCharacterASpeical(container_input) && container_input[0] != '/' && container_input[0] != '.') {
    document.getElementById('containerSearchNote').innerHTML = "No information was found according to your input! Please try again"
    container_search(container_input)
   } else if (isCharacterALetter(container_input[0]) && !isNaN(container_input[1])) {
    document.getElementById('containerSearchNote').innerHTML = "This location is not associated with any container"
    location_search(container_input, locationArr_amazon)
   } else if (container_input.toLowerCase() == '/all') {
    for (let i = 0; i < containerNumberArr.length; i++) {
      const each_of_all = containerNumberArr[i];
      if (each_of_all) {
        buildingRow_amazon(each_of_all)
      }
    }
  } else if (container_input[0] == '.' && container_input.length > 2) {
    document.getElementById('containerSearchNote').innerHTML = "This SKU does not exist in the system!"
    const skuSearchInput = container_input.substring(1,container_input.length);
    item_search(skuSearchInput);
  } else if (container_input.substring(0,3) == '/xc') {
    if (container_input == '/xc4') {
      for (let i = 0; i < fourXCArr.length; i++) {
        const each_of_xc = fourXCArr [i];
        if (each_of_xc) {
          buildingRow_amazon_xc(each_of_xc)
        }
      }
    } else if (container_input == '/xc5') {
      for (let i = 0; i < fiveXCArr.length; i++) {
        const each_of_xc = fiveXCArr [i];
        if (each_of_xc) {
          buildingRow_amazon_xc(each_of_xc)
        }
      }
    } else if (container_input == '/xc')
    for (let i = 0; i < allXCArr.length; i++) {
      const each_of_xc = allXCArr [i];
      if (each_of_xc) {
        buildingRow_amazon_xc(each_of_xc)
      }
    }
  } else if (container_input.toLowerCase() == '/sp') {
    for (let i = 0; i < containerNumberArr.length; i++) {
      const each_of_all = containerNumberArr[i];
      if (each_of_all && each_of_all.substring(0,2) == 'SP') {
        buildingRow_amazon(each_of_all)
      }
    }
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
  preUpdateContainerArr.push(containerMap.get(b));
  var skuCount = 0;
  const containerBody = document.getElementById('containerBody')
  const container = document.createElement('tr');
  const user = document.createElement('td');
  const account = document.createElement('td');
  const container_number = document.createElement('td');
  const item = document.createElement('td');
  const qty_per_sku = document.createElement('td');
  const location = document.createElement('td');
  const date = document.createElement('td');
  const status = document.createElement('td');
  container.appendChild(user);
  container.appendChild(account);
  container.appendChild(container_number);
  container.appendChild(item);
  container.appendChild(qty_per_sku)
  container.appendChild(location);
  container.appendChild(date);
  container.appendChild(status);
  user.innerHTML = containerMap.get(b)[0].user.name
  account.innerHTML = containerMap.get(b)[0].account.name;
  for (let i = 0; i < containerMap.get(b).length; i++) {
    const singleItem = containerMap.get(b)[i];
    skuCount = skuCount + singleItem.qty_per_sku;
    const listedItem = document.createElement('div');
    listedItem.setAttribute('uk-tooltip',`title: ${singleItem.description}`)
    const itemAmount = document.createElement('div');
    listedItem.innerHTML = singleItem.item_number;
    itemAmount.innerHTML = singleItem.qty_per_sku;
    item.appendChild(listedItem);
    qty_per_sku.appendChild(itemAmount);
  };
  container_number.innerHTML = `<a href="/admin/container/${b}" >${b} <small>(${skuCount})</small></a>`;
  location.innerHTML = containerMap.get(b)[0].container.location;
  date.innerHTML = convertor_amazon(containerMap.get(b)[0].container);
  date.setAttribute('uk-tooltip', `received date ${newDateValidate(containerMap.get(b)[0].container.received_date)} ; requested date ${newDateValidate(containerMap.get(b)[0].container.requested_date)} ; shipped date ${newDateValidate(containerMap.get(b)[0].container.shipped_date)} ; bill for receiving ${newDateValidate(new Date(containerMap.get(b)[0].container.bill_received).toLocaleDateString("en-US"))} ; bill for storage ${newDateValidate(new Date(containerMap.get(b)[0].container.bill_storage).toLocaleDateString("en-US"))} ; bill for shipping ${newDateValidate(new Date(containerMap.get(b)[0].container.bill_shipped).toLocaleDateString("en-US"))}`)
  status.innerHTML = convertor_status(containerMap.get(b)[0].container.status);
  containerBody.appendChild(container);
};

function buildingRow_amazon_xc(d) {
  const containerBody = document.getElementById('containerBody')
  const container = document.createElement('tr');
  const user = document.createElement('td');
  const account = document.createElement('td');
  const container_number = document.createElement('td');
  const item = document.createElement('td');
  const qty_per_sku = document.createElement('td');
  const location = document.createElement('td');
  const date = document.createElement('td');
  const status = document.createElement('td');
  container.appendChild(user);
  container.appendChild(account);
  container.appendChild(container_number);
  container.appendChild(item);
  container.appendChild(qty_per_sku)
  container.appendChild(location);
  container.appendChild(date);
  container.appendChild(status);
  user.innerHTML = d.user.name;
  account.innerHTML = d.account.name;
  container_number.innerHTML = d.container_number;
  item.innerHTML = `desc: ${d.description}`;
  qty_per_sku.innerHTML = `#${d.qty_of_fee}`
  location.innerHTML = `$ ${d.unit_fee}/qty`
  date.innerHTML = `total: $${d.qty_of_fee*d.unit_fee}`;
  status.innerHTML = convertor_status(d.status);
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
if (!localStorage.getItem('mode')) {
  localStorage.setItem('mode', 'C');
} else if (localStorage.getItem('mode') == 'A') {
  modeChange();
}
/////// filter sku function /////////
const skuSelect = document.getElementById('skuSelect').querySelector('select');
const bulkSelect = document.getElementById('bulkSelect').querySelector('select');
const skuResult = document.getElementById("skuResult");
const bodyParent = skuResult.querySelector('tbody');
const totalAmount = document.getElementById('searchNumber');
function skuListing() {
  unattachList();
  var skuArr = [];
  const selectedClientId = document.getElementById('userSelect').querySelector('select').value;
  document.getElementById('masterSkuOverview').href = `/amazon_overview_admin/${selectedClientId}`
  // localStorage.setItem('selectedClient', selectedClientId);
  fetch(`/api/item/allItemPerClient/${selectedClientId}`, {
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
  fetch(`/api/item/allItemPerNumberAdmin/${skuSelect.value}&${document.getElementById('userSelect').querySelector('select').value}`, {
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
  fetch(`/api/item/allItemPerNumberAdmin/${id}&${document.getElementById('userSelect').querySelector('select').value}`, {
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
  if (document.getElementById('userSelect').querySelector('select').value == 0) {
    alert('You need to select a client first!');
  }
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
};
function clientListing() {
  document.getElementById('userSelect').querySelectorAll('option').forEach(i => i.remove());
  document.getElementById('userSelect').querySelector('select').innerHTML = `<option value="0">select client</option>`
  fetch(`/api/user/`, {
    method: 'GET'
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    for (let i = data.length-1 ; i >= 0; i--) {
    const user = document.createElement('option');
    user.innerHTML = data[i].name;
    user.setAttribute('value', data[i].id);
    document.getElementById('userSelect').querySelector('select').appendChild(user)
    };
  });
};
const advanceBtn = document.getElementById('advanceSearch');
function advanceSearch() {
  if (advanceBtn.getAttribute('class') == 'badge bg-secondary shadow-sm') {
    advanceBtn.setAttribute('class', 'badge bg-primary shadow-sm');
    document.getElementById('advanceHide').style.display = 'none';
    document.getElementById('advanceShow').style.display = '';
  } else {
    advanceBtn.setAttribute('class','badge bg-secondary shadow-sm');
    document.getElementById('advanceHide').style.display = '';
    document.getElementById('advanceShow').style.display = 'none';
  }
};


var pass_id,logChecker;
const record_fetch = async (n) => {
  var logPass = true;
  const log = parseInt(document.getElementById('logNumber').value);
  log==logChecker?logPass=true:logPass=false;
  logChecker=log;
  log<1||!log?n=1:n=log;
  await fetch(`/api/record/dashboard_admin/${n}`, {
    method: 'GET'
  }).then((r) => {
    return r.json();
  }).then((d) => {
    const topItemId = d[0].id;
    pass_id==topItemId&&logPass?console.log('no new feed'):execution(d);
  })
};
const execution = (data) => {
  component_reset();
  pass_id = data[0].id;
  [data[0], data[1], data[2]].forEach(i => {
    i?component(i):console.log('no 3 datas');
  });
  data.forEach(i =>component_log(i));
}
const component = (data) => {
  const tr = document.createElement('tr');
  record_dashboard.appendChild(tr);
  const status = `${status_converter(data.status_from)} => ${status_converter(data.status_to)}`;
  tr.innerHTML = sub_component(data.user.name) + sub_component(data.ref_number) + sub_component(data.action) + sub_component(status);
};
const component_log = (i) => {
  const tr = document.createElement('tr');
  log_body.appendChild(tr);
  const status = `${status_converter(i.status_from)} => ${status_converter(i.status_to)}`;
  const qty = `${i.qty_from} => ${i.qty_to}`;
  tr.innerHTML = sub_component_full(i.user.name) + sub_component_full(i.ref_number, 'primary') + sub_component_full(i.sub_number) + sub_component_full(i.action) + sub_component_full(i.action_notes) + sub_component_full(qty) + sub_component_full(status);
}
const component_reset = () => {
  const all_tr = record_dashboard.querySelectorAll('tr');
  all_tr.length ? all_tr.forEach(i => i.remove()): null;
  const log_tr = log_body.querySelectorAll('tr');
  log_tr.length ? log_tr.forEach(i => i.remove()): null;
}
const sub_component = (sub_data) => {
  return `<td class="uk-animation-slide-right-small">${sub_data}</td>`
};
const status_converter = (i) => {
  return ( i == 0 ? 'pending'
  : i == 1 ? 'received'
  : i == 2 ? 'requested'
  : i == 3 ? 'shipped'
  : i == 99 ? 'deleted'
  : 'null')
}
////// init ////////
const init = () => {
  record_fetch(100);
  allItem();
  xcContainer();
  startTime();
};

const sub_component_full = (sub_data, color) => {
  return `<td class="uk-animation-slide-top uk-animation-fast col-3 text-${color}" style="word-wrap: break-word">${sub_data}</td>`
};
function startTime() {
  const today = new Date();
  const date = today.toLocaleDateString('en-US');
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('clock').innerHTML =  date + " " + h + ":" + m + ":" + s;
  setTimeout(startTime, 1000);
};
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
};

init();
setInterval(record_fetch, 5000);
