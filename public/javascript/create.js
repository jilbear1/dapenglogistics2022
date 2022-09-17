const today = new Date();
const pending_date = today.toLocaleDateString("en-US");
const asn = "ASN"+String(new Date().valueOf()).substring(3, 13);
document.querySelector('#new_asn').setAttribute("value", asn);
localStorage.setItem('asn',asn);
const savedAccount_id = parseInt(localStorage.getItem('account_id'));
const account = document.querySelector('#new_account');
const prefix = document.querySelector('#new_prefix');
const savedAccount = localStorage.getItem('account');
const savedPrefix = localStorage.getItem('prefix');
if (savedAccount != "Create New Account") {
    account.setAttribute('value', savedAccount);
    prefix.setAttribute('value', savedPrefix);
} else {
    account.disabled = false;
    prefix.disabled = false;
};
class Box{
    constructor(account, prefix, batch, desscription, length, weight, height, width, total_box, order, qty_per_box, sku){
        this.account = account;
        this.prefix = prefix;
        this.batch = batch;
        this.desscription = desscription;
        this.length = length;
        this.weight = weight;
        this.height = height;
        this.width = width;
        this.total_box = total_box;
        this.order = order;
        this.qty_per_box = qty_per_box;
        this.sku = sku;
    }
};
const fixedInfo = document.getElementById('fixedInfo');
function prefix_check() {
    if (prefix.value.length > 3) {
        alert('Prefix is limited for 2-3 letters 单位缩写限制二到三个英文字母!');
        prefix.value = null;
        masterCheck()
    } else {
        masterCheck()
    }
};
function infoAlert() {
    alert("Some of the information are missing or incorrectly input! Please complete the form prior to proceeding.")
};
function masterCheck() {
    var desscription = document.querySelector('#new_des').value.trim();
    var length = document.querySelector('#new_len').value.trim();
    var width = document.querySelector('#new_wid').value.trim();
    var height = document.querySelector('#new_hei').value.trim();
    var weight = document.querySelector('#new_wei').value.trim();
    var qty_per_box = document.querySelector('#new_qty').value.trim();
    var sku = document.querySelector('#new_sku').value.trim();
    var total_box = document.querySelector('#new_tot').value.trim()
    if (desscription && length && width && height && weight && qty_per_box && sku && total_box && prefix.value.length > 1 && account.value.trim()) {
        document.getElementById('order_pre-check').style.display = '';
        document.getElementById('fake').style.display = 'none';
    } else {
        document.getElementById('order_pre-check').style.display = 'none';
        document.getElementById('fake').style.display = '';
    }
};
function precheck() {
    const desscription = document.querySelector('#new_des').value.trim();
    const length = parseFloat(document.querySelector('#new_len').value.trim());
    const width = parseFloat(document.querySelector('#new_wid').value.trim());
    const height = parseFloat(document.querySelector('#new_hei').value.trim());
    const weight = parseFloat(document.querySelector('#new_wei').value.trim());
    const qty_per_box = document.querySelector('#new_qty').value.trim();
    const sku = document.querySelector('#new_sku').value.trim();
    const total_box = parseInt(document.querySelector('#new_tot').value.trim());
    if (prefix.value.length == 2) {
        prefix.value = prefix.value + "0"
    };
    document.getElementById("export-btn").disabled = false;
    fixedInfo.innerHTML = '子用户名: ' + account.value + "</br>" + 'ASN: ' + asn + "</br>" + '挂单日期(美): ' + pending_date;
    const pre_digcode_2 = Math.floor(1000000000 + Math.random() * 9000000000);
    const pre_digcode = parseInt(String(new Date().valueOf() + pre_digcode_2).substring(4, 11));
    localStorage.setItem('total_box',total_box);
    for (let i = 1; i <= total_box; i++) {
        var digcode = pre_digcode;
        if (pre_digcode.toString().length != 7) {
            digcode = pre_digcode + `${i}`;
        } else {
            digcode = pre_digcode + i;
        };
        const pre_number = 'SW' + prefix.value.toUpperCase() + digcode
        const box_number = pre_number.replace(/\s/g, '');
        const box = new Box(account.value, prefix.value, asn, desscription, length, weight, height, width, total_box, i, qty_per_box, sku)
        var table = document.querySelector('#ordertable');
        var tag = document.createElement('tr');
        tag.setAttribute('id',`order#${i}`);
        var cell_box_number = document.createElement('td');
        var cell_description = document.createElement('td');
        var cell_SKU = document.createElement('td');
        var cell_qty_per_box = document.createElement('td');
        var cell_box = document.createElement('td');
        var cell_of_box = document.createElement('td');
        var cell_weight = document.createElement('td');
        var cell_length = document.createElement('td');
        var cell_width = document.createElement('td');
        var cell_height = document.createElement('td');

        cell_box_number.setAttribute('id', `box_number${i}`);
        cell_description.setAttribute('id', `description${i}`);
        cell_description.setAttribute('contenteditable', `true` );
        cell_SKU.setAttribute('id', `SKU${i}`);
        cell_SKU.setAttribute('contenteditable', `true` );
        cell_qty_per_box.setAttribute('id', `qty_per_box${i}`);
        cell_qty_per_box.setAttribute('contenteditable', `true` );
        cell_box.setAttribute('id', `box${i}`);
        cell_of_box.setAttribute('id', `of_box${i}`);
        cell_weight.setAttribute('id', `weight${i}`);
        cell_weight.setAttribute('contenteditable', `true`);
        cell_length.setAttribute('id', `lengcell_length${i}`);
        cell_length.setAttribute('contenteditable', `true`);
        cell_width.setAttribute('id', `width${i}`);
        cell_width.setAttribute('contenteditable', `true`);
        cell_height.setAttribute('id', `height${i}`);
        cell_height.setAttribute('contenteditable', `true`);

        cell_box_number.innerHTML = box_number;
        cell_description.innerHTML = box.desscription;
        cell_SKU.innerHTML = box.sku;
        cell_qty_per_box.innerHTML = box.qty_per_box;
        cell_box.innerHTML = box.order;
        cell_of_box.innerHTML = box.total_box;
        cell_weight.innerHTML = box.weight;
        cell_length.innerHTML = box.length;
        cell_width.innerHTML = box.width;
        cell_height.innerHTML = box.height;

        tag.appendChild(cell_box_number);
        tag.appendChild(cell_description);
        tag.appendChild(cell_SKU);
        tag.appendChild(cell_qty_per_box);
        tag.appendChild(cell_box);
        tag.appendChild(cell_of_box);
        tag.appendChild(cell_weight);
        tag.appendChild(cell_length);
        tag.appendChild(cell_width);
        tag.appendChild(cell_height);

        table.appendChild(tag);
    };

};
document.getElementById('order_pre-check').addEventListener('click', precheck);

function reset() {
    location.reload();
};
var batch_map = new Map();
var account_map = new Map();
function findBatchId1() {
    fetch(`/api/user/batch`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
            batch_map.set(data[i].asn, data[i].id);
        };
        console.log(batch_map.get(asn));
        boxInsertExistedAccount()
    });
};
function findBatchId() {
    fetch(`/api/user/batch`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
            batch_map.set(data[i].asn, data[i].id);
        };
        console.log(batch_map.get(asn));
        boxInsertNewAccount()
    });
};
function findAccountId() {
    fetch(`/api/user/account`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let j = 0; j < data.length; j++) {
            account_map.set(data[j].name, data[j].id);
        }
        const account_id = account_map.get(account.value);
        const total_box = parseInt(localStorage.getItem('total_box'));
        loadingBatch({asn, pending_date, total_box, account_id})
    });
};
function boxInsertExistedAccount() {
    const promises = [];
    console.log(batch_map.get(asn));
    var dataTable = document.getElementById( "ordertable" );
    for ( var i = 1; i < dataTable.rows.length; i++ ) {
        const length = parseInt(dataTable.rows[i].cells[7].innerHTML);
        const width = parseInt(dataTable.rows[i].cells[8].innerHTML);
        const height = parseInt(dataTable.rows[i].cells[9].innerHTML);
        const volume = length*width*height
        const orderdata = {
            batch_id: batch_map.get(asn),
            account_id: savedAccount_id,
            box_number: dataTable.rows[i].cells[0].innerHTML,
            description: dataTable.rows[i].cells[1].innerHTML,
            sku: dataTable.rows[i].cells[2].innerHTML,
            qty_per_box: parseInt(dataTable.rows[i].cells[3].innerHTML),
            order: parseInt(dataTable.rows[i].cells[4].innerHTML),
            weight: parseInt(dataTable.rows[i].cells[6].innerHTML),
            length: length,
            width: width,
            height: height,
            volume: volume
        };
        promises.push(loadingBox(orderdata));
        promises.push(record(orderdata));
    };
    Promise.all(promises).then(() => {
        // alert('Orders Placed!');
        window.location.replace(`/batch/${batch_map.get(asn)}`)
    }).catch((e) => {console.log(e)})
};
function boxInsertNewAccount() {
    const promises = [];
    var dataTable = document.getElementById( "ordertable" );
    for ( var i = 1; i < dataTable.rows.length; i++ ) {
        const length = parseInt(dataTable.rows[i].cells[7].innerHTML);
        const width = parseInt(dataTable.rows[i].cells[8].innerHTML);
        const height = parseInt(dataTable.rows[i].cells[9].innerHTML);
        const volume = length*width*height
        const newBox = {
            batch_id: batch_map.get(asn),
            account_id: account_map.get(account.value),
            box_number: dataTable.rows[i].cells[0].innerHTML,
            description: dataTable.rows[i].cells[1].innerHTML,
            sku: dataTable.rows[i].cells[2].innerHTML,
            qty_per_box: parseInt(dataTable.rows[i].cells[3].innerHTML),
            order: parseInt(dataTable.rows[i].cells[4].innerHTML),
            weight: parseInt(dataTable.rows[i].cells[6].innerHTML),
            length: length,
            width: width,
            height: height,
            volume: volume
        };
        promises.push(loadingBox(newBox));
        promises.push(record(newBox));
    };
    Promise.all(promises).then(() => {
        // alert('Orders Placed!');
        window.location.replace(`/batch/${batch_map.get(asn)}`)
    }).catch((e) => {console.log(e)})
};
function exportData() {
    if (dimensionChecker()) {
        document.getElementById('export-btn').style.display = 'none';
        document.getElementById('spinner').style.display = '';
        const total_box = parseInt(localStorage.getItem('total_box'));
        if (savedAccount != "Create New Account") {
            loadingBatch1({asn, pending_date, total_box, savedAccount_id});
        }else {
            loadingAccount({name: account.value.trim(), prefix: prefix.value.toUpperCase()});
        }
    } else {
        alert('尺寸只限数字输入，请更正后重试! The dimension values (hiegh, weight, width, and length) should only be integers and not 0! Please fix and try again')
    }
};
const dimensionChecker = () => {
    var checker = true;
    const dataTable = document.getElementById( "ordertable" );
    for ( var i = 1; i < dataTable.rows.length; i++ ) {
        const dimension = [parseInt(dataTable.rows[i].cells[6].innerText), parseInt(dataTable.rows[i].cells[3].innerText), parseInt(dataTable.rows[i].cells[9].innerText), parseInt(dataTable.rows[i].cells[8].innerText), parseInt(dataTable.rows[i].cells[7].innerText)]
        if (dimension.includes(NaN) || dimension.includes(0)) {
            console.log(`The first error: the row #${i} need to get fixed!`);
            checker = false;
            break
        };
    };
    return checker
}
async function loadingBox(data) {
    const response = await fetch('/api/box', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('order placed successfully!')
      } else {
        alert('try again')
    }
};///////loading box
async function loadingBatch1(data) {
     const response = await fetch('/api/batch', {
         method: 'post',
         body: JSON.stringify(data),
         headers: { 'Content-Type': 'application/json' }
       });

       if (response.ok) {
        console.log("batch inserted");
        findBatchId1()
       } else {
         alert('try again')
       }

};
async function loadingBatch(data) {
    const response = await fetch('/api/batch/new', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
       console.log("batch inserted");
       findBatchId()
      } else {
        alert('try again')
      }

};
async function loadingAccount(data) {
     const response = await fetch('/api/account', {
         method: 'post',
         body: JSON.stringify(data),
         headers: { 'Content-Type': 'application/json' }
       });

       if (response.ok) {
        console.log("account inserted");
        findAccountId()
       } else {
         alert('try again')
    }

};

const record = async (data) => {
    var accountInfo = savedAccount
    if (savedAccount == 'Create New Account') {
       accountInfo =  account.value.trim()
    };
    const ref_number = data.box_number;
    const status_to = 0;
    const date = new Date().toISOString().split('T')[0];
    const action = `Client Creating (Acct: ${accountInfo})`
    const sub_number = asn;
    const response = await fetch(`/api/record/neworder_china`, {
      method: 'POST',
      body: JSON.stringify({
          ref_number,
          status_to,
          date,
          action,
          sub_number
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
        console.log('record fetched!');
    }
};
