console.log(location.href, 'master create js');
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
}



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
}
const fixedInfo = document.getElementById('fixedInfo');



function precheck() {
   if (prefix.value.length > 4 || prefix.value.length < 2) {
       alert('Prefix is limited for 2-3 letters');
       return;
   } else if (prefix.value.length == 2) {
        prefix.value = prefix.value + "0"
   };
    fixedInfo.innerHTML = 'Account:' + account.value + "</br>" + 'ASN:' + asn + "</br>" + 'Pending Date: ' + pending_date;
    const desscription = document.querySelector('#new_des').value;
    const length = document.querySelector('#new_len').value;
    const width = document.querySelector('#new_wid').value;
    const height = document.querySelector('#new_hei').value;
    const weight = document.querySelector('#new_wei').value;
    const qty_per_box = document.querySelector('#new_qty').value;
    const sku = document.querySelector('#new_sku').value;
    const total_box = document.querySelector('#new_tot').value.trim();
    const pre_digcode = parseInt(String(new Date().valueOf()).substring(6, 13));
    localStorage.setItem('total_box',total_box);
    for (let i = 1; i <= total_box; i++) {
        const digcode = pre_digcode + i;
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

}

document.getElementById('order_pre-check').addEventListener('click', precheck);

function reset() {
    location.reload();
}

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
    // var arr = [];
    console.log(batch_map.get(asn));
    var dataTable = document.getElementById( "ordertable" );
    for ( var i = 1; i < dataTable.rows.length; i++ ) {
        const orderdata = {
            batch_id: batch_map.get(asn),
            account_id: savedAccount_id,
            box_number: dataTable.rows[i].cells[0].innerHTML,
            description: dataTable.rows[i].cells[1].innerHTML,
            sku: dataTable.rows[i].cells[2].innerHTML,
            qty_per_box: parseInt(dataTable.rows[i].cells[3].innerHTML),
            order: parseInt(dataTable.rows[i].cells[4].innerHTML),
            weight: parseInt(dataTable.rows[i].cells[6].innerHTML),
            length: parseInt(dataTable.rows[i].cells[7].innerHTML),
            width: parseInt(dataTable.rows[i].cells[8].innerHTML),
            height: parseInt(dataTable.rows[i].cells[9].innerHTML)
        };
        // arr.push(orderdata.box_number);
        loadingBox(orderdata)
    };
    alert('Orders Placed!');
    // barcode(arr);
    window.location.replace(`/batch/${batch_map.get(asn)}`);
};

function boxInsertNewAccount() {
    // var new_account_arr = [];
    var dataTable = document.getElementById( "ordertable" );
    for ( var i = 1; i < dataTable.rows.length; i++ ) {
       const newBox = {
            batch_id: batch_map.get(asn),
            account_id: account_map.get(account.value),
            box_number: dataTable.rows[i].cells[0].innerHTML,
            description: dataTable.rows[i].cells[1].innerHTML,
            sku: dataTable.rows[i].cells[2].innerHTML,
            qty_per_box: parseInt(dataTable.rows[i].cells[3].innerHTML),
            order: parseInt(dataTable.rows[i].cells[4].innerHTML),
            weight: parseInt(dataTable.rows[i].cells[6].innerHTML),
            length: parseInt(dataTable.rows[i].cells[7].innerHTML),
            width: parseInt(dataTable.rows[i].cells[8].innerHTML),
            height: parseInt(dataTable.rows[i].cells[9].innerHTML)
        };
        // new_account_arr.push(newBox.box_number);
        loadingBox(newBox)
    }
    alert('Orders Placed!');
    // barcode(new_account_arr);
    window.location.replace(`/batch/${batch_map.get(asn)}`)
};

function exportData() {
    const total_box = parseInt(localStorage.getItem('total_box'));
    if (savedAccount != "Create New Account") {
        loadingBatch1({asn, pending_date, total_box, savedAccount_id});
        }else {
        loadingAccount({name: account.value, prefix: prefix.value.toUpperCase()});
    }
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

}

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

 }

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

}

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

 }






 ///////////////////barcode+pdf/////////////////

// function barcode(arr) {
//     const bar = document.getElementsByClassName('barcode');
//     console.log(arr);
//     for (let i = 0; i < arr.length; i++) {
//     var url = `http://bwipjs-api.metafloor.com/?bcid=code128&text=${arr[i]}`;
//     var txt = arr[i];
//     var img = document.createElement('img');
//     img.src = url
//     var header = document.createElement('li')
//     img.setAttribute("class", 'uk-card uk-card-default uk-card-body')
//     header.innerHTML = txt;
//     bar[0].appendChild(header);
//     bar[0].appendChild(img);
//     };
// }

// function done() {
//     window.location.replace('/');
// }

// function generatePdf(imageUrls, txts) {
//   const doc = new jsPDF();
//   for (let i = 0; i < imageUrls.length; i++) {
//       doc.addImage(imageUrls[i], "JPEG", 5, 5, 0, 0);
//       doc.addPage();
//   };
//   return doc;
// }


// async function savePdf(arr) {
//   const multiPng = await generatePdf(arr);
//   const dataURLString = multiPng.output("dataurlstring", "shipping_barcode.pdf");
//   multiPng.output("save", "shipping_barcode.pdf");
// }
