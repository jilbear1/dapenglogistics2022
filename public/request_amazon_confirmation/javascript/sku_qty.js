console.log(location.href, 'req_amazon_confirmation sku_qty js');
const today = new Date().toLocaleDateString("en-US");
const locationAddress = location.href.split('/');
const account_id = locationAddress[locationAddress.length-1];
const loader = document.getElementById('loader');
const containerTable = document.getElementById('myTable');
const rows = containerTable.rows;
var containerMap = new Map();
var itemMap = new Map();
var itemRef = new Map();
var containerRef = new Map();
var locationRef = new Map();
var costCount = 0;
var masterAccountIdArr = [];
var itemCollection = 'Colletion: ';
//init
function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
};
const init = () => {
    fetch(`/api/item/allItem/${account_id}`, {
      method: 'GET'
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      for (let k = 0; k < data.length; k++) {
        const item = data[k];
        itemRef.set(item.id, item.item_number);
        containerRef.set(item.container_id, item.container.container_number);
        // locationRef.set(item.container_id, item.container.location);***************9/15/2022 dead code not using in app
      };
      const container_data = data.reduce((r, a) => {
        r[a.container.container_number] = r[a.container.container_number] || [];
        r[a.container.container_number].push(a);
        return r;
      }, Object.create(null));
      const newData = Object.values(container_data);
      for (let i = 0; i < newData.length; i++) {
        // const containerNumber = newData[i][0].container.container_number;
        // containerMap.set(containerNumber, newData[i]);
        const containerId = newData[i][0].container.id;
        containerMap.set(containerId, newData[i]);
      };
      var tr;
      tr = containerTable.getElementsByTagName('tr');
      var emptyBoxArr = [];
      for (let i = 1; i < tr.length; i++) {
        const its_container_id = parseInt(tr[i].id.split('_')[1]);
        // const container_number = tr[i].getElementsByTagName('td')[2].innerHTML;
        const status = tr[i].getElementsByTagName('td')[7];
        const sku = tr[i].getElementsByTagName('td')[3];
        const qty = tr[i].getElementsByTagName('td')[4];
        if(containerMap.get(its_container_id)){
          tr[i].getElementsByTagName("td")[6].innerHTML =  Math.ceil(parseFloat(tr[i].getElementsByTagName("td")[6].innerText)*2.2)
          var sizeData  = tr[i].getElementsByTagName("td")[5].innerText.split('x');
          sizeData = sizeData.map(n => parseFloat(n)*0.394);
          tr[i].getElementsByTagName("td")[5].innerHTML = `${(sizeData[0]).toFixed(1)} x ${(sizeData[1]).toFixed(1)} x ${(sizeData[2]).toFixed(1)}`;
          status.innerHTML = "请夹带运输标签与确认";
          containerMap.get(its_container_id).forEach(item => {
          const singleSKU = document.createElement('div');
          const singleQty = document.createElement('div');
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
var selectBoxId = [];
function siblingTracker (tracking) {
  tracking = tracking.split('_')[0];
  return $(`tr[class*=${tracking}]`);
};
const palletSwitch = (ev) => {
  ev.preventDefault();
  if (ev.target.id == 'ind') {
    UIkit.notification({message: '转换至: 全相连模式', pos: 'top-left'});
    selectIndividual = false;
    selectPerPallet = false;
    ev.target.innerHTML = '全相连模式';
    ev.target.id = 'req';
    ev.target.className = 'btn btn-white border-danger text-danger btn-sm shadow-sm'
  } else if (ev.target.id == 'req') {
    UIkit.notification({message: '转换至: 托盘模式', pos: 'top-left'});
    selectIndividual = false;
    selectPerPallet = true;
    ev.target.id = 'pal';
    ev.target.innerHTML = '托盘模式';
    ev.target.className = 'btn btn-white border-success text-success btn-sm shadow-sm'
  } else {
    UIkit.notification({message: '转换至: 自由模式', pos: 'top-left'})
    selectIndividual = true;
    ev.target.innerHTML = '自由选择模式';
    ev.target.id = 'ind';
    ev.target.className = 'btn btn-white border-primary text-primary btn-sm shadow-sm'
  }
}
var selectPerPallet = true;
var selectIndividual = true;
var accountName;
function selectBatch (tracking, ev) {
  accountName = ev.target.parentNode.parentElement.querySelectorAll('td')[1].innerText;
  if (!selectIndividual) {
    var allSiblingBoxes;
    selectPerPallet?allSiblingBoxes = document.getElementsByClassName(tracking):allSiblingBoxes=siblingTracker(tracking);
    for (let i = 0; i < allSiblingBoxes.length; i++) {
      const eachCheckBox = allSiblingBoxes[i].getElementsByTagName('input')[0];
      const eachContainerId = parseInt(eachCheckBox.parentElement.parentElement.getAttribute('id').split('_')[1]);
      !selectBoxId.includes(eachContainerId)?selectBoxId.push(eachContainerId):console.log(eachContainerId+" already in the array");
      eachCheckBox.parentElement.setAttribute('class','border border-success rounded shadow-sm')
      eachCheckBox.checked = true
    }
    console.log(selectBoxId);
    const allOtherBoxes = document.querySelectorAll('tbody input');
    for (let k = 0; k < allOtherBoxes.length; k++) {
      allOtherBoxes[k].disabled = true
    }
  } else {
    if (tracking.includes("_")) {
      if(!ev.target.checked) {
        var allSiblingBoxes=document.getElementsByClassName(tracking);
        for (let i = 0; i < allSiblingBoxes.length; i++) {
          const eachCheckBox = allSiblingBoxes[i].getElementsByTagName('input')[0];
          const eachContainerId = parseInt(eachCheckBox.parentElement.parentElement.getAttribute('id').split('_')[1]);
          selectBoxId = selectBoxId.filter(a => a != eachContainerId);
          eachCheckBox.parentElement.className = null;
          eachCheckBox.checked = false
        }
        console.log(selectBoxId);
      } else {
        var allSiblingBoxes=document.getElementsByClassName(tracking);
        for (let i = 0; i < allSiblingBoxes.length; i++) {
          const eachCheckBox = allSiblingBoxes[i].getElementsByTagName('input')[0];
          const eachContainerId = parseInt(eachCheckBox.parentElement.parentElement.getAttribute('id').split('_')[1]);
          selectBoxId.push(eachContainerId);
          eachCheckBox.parentElement.setAttribute('class','border border-success rounded shadow-sm')
          eachCheckBox.checked = true
        }
        console.log(selectBoxId);
      }
    } else {
      if(ev.target.checked) {
        const individualId = parseInt(ev.target.parentElement.parentElement.getAttribute('id').split('_')[1]);
        ev.target.parentElement.className = 'border border-success rounded shadow-sm';
        selectBoxId.push(individualId);
        console.log(selectBoxId);
      } else {
        const individualId = parseInt(ev.target.parentElement.parentElement.getAttribute('id').split('_')[1]);
        selectBoxId = selectBoxId.filter(b=>b!=individualId);
        ev.target.parentElement.className = null;
        console.log(selectBoxId);
      }
    }
  }
}
//helper function
function resetCheckBox() {
  const allOtherBoxes = document.querySelectorAll('tbody input');
  selectBoxId = [];
  for (let k = 0; k < allOtherBoxes.length; k++) {
    allOtherBoxes[k].parentElement.setAttribute('class', '')
    allOtherBoxes[k].disabled = false;
    allOtherBoxes[k].checked = false;
  }
};

//init of submission
function getRandomColor() {
  var letters = 'BCDEF'.split('');
  var color = '';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

function GetSelected(numberOfFile) {
  if (selectBoxId.length) {
    document.getElementById('js-modal-confirm').innerHTML = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>';
    document.getElementById('js-modal-confirm').onclick = null;
    var confirmationBatch = new Object()
    const s3 = new Date().valueOf();
    var fba = document.getElementById('amazon_ref').value.trim()
    fba = fba.toUpperCase();
    const notes = document.getElementById('notes').value;
    confirmationBatch.requested_date = today;
    confirmationBatch.id = selectBoxId;
    confirmationBatch.s3 = s3;
    confirmationBatch.fba = fba;
    confirmationBatch.notes = notes;
    confirmationBatch.status = 2;
    confirmationBatch.custom_2 = getRandomColor();
    ///record keeping system starts here
    const promises = [];
    for (let i = 0; i < selectBoxId.length; i++) {
      var itemCollection = 'Colletion: ';
      var total_skus = 0;
      const sku_collection = containerMap.get(selectBoxId[i]).forEach(item => {
        itemCollection += `${item.item_number}(${item.qty_per_sku}), `;
        total_skus+= item.qty_per_sku;
      })
      promises.push(record_container(total_skus, itemCollection, containerRef.get(selectBoxId[i]), s3, numberOfFile));
    }
    ///record keeping system ends here
    Promise.all(promises).then(() => {
      updateContainer(confirmationBatch, s3)
    }).catch((e) => {console.log(e)})
  } else {
    alert('no container was selected! please try again!');
    loader.style.display = 'none';
  }
};
async function updateContainer(data, s3) {
  const response = await fetch(`/api/container/amazon_label_submission`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    upload_file(s3)
  } else {
    alert('fail')
  }
};


//// file uploading function
function upload_file(e) {
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];

  if (!file_2 && file) {
    upload_framwork(file, e)
  } else if (!file && file_2) {
    upload_framwork(file_2, e)
  } else if (file && file_2) {
    upload2F_framwork(file, file_2, e)
  } else {
    loader.style.display = 'none';
    // alert('Status updated successfully! No file was attached.出货通知已传送成功，无夹带档案');
    document.location.reload();
  }
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
      loader.style.display = 'none';
      // alert('Status updated successfully! 出货通知已传送成功! 一份档案已接收');
      document.location.reload();
    } else {
      alert(response.statusText);
    }
};
async function upload2F_framwork(file, file_2, e) {
  let formData = new FormData();
    formData.append('file', file);
    formData.append('s3',e)

    const response = await fetch(`/api/container/upload`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      upload2F_framwork_file2(file_2, e)
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
      loader.style.display = 'none';
      // alert('Status updated successfully! Two files uploaded 上传成功，两份档案已接收');
      document.location.reload();
    } else {
      alert(response.statusText);
    }
};

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
function validation_request() {
  var numberOfFile = 0;
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];
  if (file) {
    numberOfFile++;
  }
  if(file_2) {
    numberOfFile++
  }
  console.log(numberOfFile);
  var check_label = document.getElementById('label_not_required')
  if (!file && !file_2 && !check_label.checked) {
    alert('The shipping label is missing! Please attach a pdf file and try again! 无夹带档案！请夹带档案或者勾选无夹带档案栏，然后再试一遍。')
  } else {
    loader.style.display = '';
    GetSelected(numberOfFile)
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
}

const pallet_info = () => {
  var non_repeatArr = [];
  const table = document.querySelector('table');
  const row = table.rows;
  for (let i = 1; i < row.length; i++) {
    const element = row[i].cells[8].innerText;
    if (element) {
      const elementArr = element.split('*');
      const pallet_index = elementArr[0];
      const pallet_length = elementArr[1];
      const pallet_width = elementArr[2];
      const pallet_height = elementArr[3];
      const pallet_weight = elementArr[4];
      const pallet_id = elementArr[5];
      const new_index = newIndex(pallet_index);
      const uuid = `${new_index}-${pallet_id}`;
      if (!non_repeatArr.includes(uuid)) {
        row[i].cells[8].innerHTML = `托盘号<b>${new_index}</b>-${pallet_id}: ${pallet_length} x ${pallet_width} x ${pallet_height}, ${pallet_weight}`;
        non_repeatArr.push(uuid);
      } else {
        row[i].cells[8].innerHTML = `托盘号<b>${new_index}</b>-${pallet_id}`;
      }
    }
  };
}

const newIndex = (string) => {
  const num = string.length;
  if (num == 2) {
    return `0${string}`
  } else if (num == 1) {
    return `00${string}`
  } return string
}


//Req = 11; SP = 12; AM = 1; China = 0
const record_container = async (count, collection, sp_box_number, file_code, numberOfFile) => {
  const ref_number = sp_box_number;
  const sub_number = file_code;
  const status_from = 1;
  const status_to = 2;
  const qty_to = count;
  const qty_from = count;
  const action = `Client Confirmed SP Boxes (Acct: ${accountName})`;
  const action_notes = `${collection}${numberOfFile} file(s)`;
  const type = 12;
  const date = new Date().toISOString().split('T')[0];
  const response = await fetch(`/api/record/record_create_client`, {
    method: 'POST',
    body: JSON.stringify({
      ref_number,
      sub_number,
      status_to,
      status_from,
      qty_from,
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



init();
pallet_info();
