
const table = document.querySelector('table');
var rows = table.rows;
// var prefix_map = new Map();
// var account_map = new Map();
// var verifyAccount_map = new Map();
// var account_nameArr = [];
// var arr = [];

// function compile() {
//     fetch(`/api/user/account`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         for (let j = 0; j < data.length; j++) {
//             verifyAccount_map.set(data[j].name, data[j].id);
//         };
//         for (let i = 2; i < rows.length; i++) {
//             let box_number = rows[i].cells[1].innerHTML;
//             var account_name = rows[i].cells[4].innerHTML;
//             if (account_name.substring(0,3)== "<di") {
//                 var master = rows[i].cells[4];
//                 var master_slect = master.querySelector('div');
//                 account_name = master_slect.innerHTML;
//                 if (!account_nameArr.includes(box_number) && !verifyAccount_map.get(account_name)) {
//                     account_nameArr.push(account_name);
//                     prefix_map.set(account_name, prefixFilter(box_number));
//                 };
//             } else {
//                 if (!account_nameArr.includes(account_name) && account_name && !verifyAccount_map.get(account_name)) {
//                 account_nameArr.push(account_name);
//                 prefix_map.set(account_name, prefixFilter(box_number))
//                 };
//             };
//         };
//         console.log(account_nameArr);
//         for (let j = 0; j < account_nameArr.length; j++) {
//             loadingAccount(
//                 {
//                     user_id: 3,
//                     name: account_nameArr[j],
//                     prefix: prefix_map.get(account_nameArr[j])
//                 }
//             )
//         };
//         alert('success!')

//     });
// }

// function compile_2(s, e) {
//     findAccountId(s, e)
// }

// //helper function
// function prefixFilter(box_number) {
//     if (box_number.substring(0,2) == 'SW') {
//         return box_number.substring(2,5)
//     } else {
//         return "000"
//     }
// };

// function findAccountId(s, e) {
//     fetch(`/api/user/account`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         console.log(data.length);
//         for (let j = 0; j < data.length; j++) {
//             account_map.set(data[j].name, data[j].id);
//         };
//         loading(s, e);
//     });
// };

// async function loadingAccount(data) {
//     const response = await fetch('/api/account', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//       });

//       if (response.ok) {
//        console.log("account inserted");
//       } else {
//         alert('try again')
//    }

// }

// function filter_s(e) {
//     if (e.innerHTML.substring(0,3)== "<di") {
//         var filter_e = e.querySelector('div');
//         return filter_e.innerHTML
//     } else {
//         return e.innerHTML
//     }
// }
// function loading(start, end) {
//     if (end > rows.length) {
//         end = rows.length
//     };
//     for (var i = start; i < end; i++ ) {
//         const box_number = filter_s(rows[i].cells[1]);
//         const account_name = filter_s(rows[i].cells[4]);
//         var received_date, status, storage_date_b, received_date_b;
//         if (i < 118) {
//             received_date = null;
//             storage_date_b = null;
//             received_date_b = null;
//             status = 0;

//         } else {
//             received_date = filter_s(rows[i].cells[2]);
//             storage_date_b = new Date(document.getElementById('st_b').value.trim()).getTime();
//             received_date_b = new Date(document.getElementById('r_b').value.trim()).getTime();
//             status = 1;
//         };
//         const description = filter_s(rows[i].cells[5]);
//         const sku = filter_s(rows[i].cells[6]);
//         const length = parseInt(filter_s(rows[i].cells[11]));
//         const width = parseInt(filter_s(rows[i].cells[12]));
//         const height = parseInt(filter_s(rows[i].cells[13]));
//         var weight;
//         const volume = parseInt(length*width*height);
//         if (parseInt(filter_s(rows[i].cells[10]))) {
//             weight = parseInt(filter_s(rows[i].cells[10]));
//         } else {
//             weight = 0;
//         };
//         var qty_per_box;
//         if (parseInt(filter_s(rows[i].cells[9]))) {
//             qty_per_box = parseInt(filter_s(rows[i].cells[9]));
//         } else {
//             qty_per_box = 0;
//         }
//         const orderdata = {
//             user_id: 3,
//             account_id: account_map.get(account_name),
//             batch_id: 1,
//             received_date: received_date,
//             box_number: box_number,
//             description: description,
//             sku: sku,
//             qty_per_box: qty_per_box,
//             order: `${filter_s(rows[i].cells[7])} of ${filter_s(rows[i].cells[8])}`,
//             weight: weight,
//             length: length,
//             width: width,
//             height: height,
//             volume: volume,
//             status: status,
//             bill_storage: storage_date_b,
//             bill_received: received_date_b
//         };

//         if (orderdata.account_id) {
//             arr.push(orderdata);
//             loadingBox(orderdata);
//         };
//     };
//     //  loadingBox(arr[101]);
// };

// async function loadingBox(data) {

//     const response = await fetch('/api/box/seeds', {
//         method: 'POST',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//       });
//       if (response.ok) {
//       console.log('ok');
//       } else {
//         console.log(data.box_number);
//       }

// }


// var containerArr = [];
// var userArr = [];
// var accountArr = [];
// var itemArr = [];

// var userMap = new Map();
// var accountMap = new Map();
// var containerMap = new Map();

// //create users
// function init () {
//         for (let i = 2; i < rows.length; i++) {
//             const user = rows[i].cells[3].innerText.trim().toLowerCase();
//             arrFormation(userArr, user)
//         };
//         for (let j = 0; j < userArr.length; j++) {
//             if(userArr[j] && userArr[j] != 'yiwu') {
//                 const user = new Object();
//                 const username = userArr[j].split(' ').join('').toLowerCase();
//                 user.name = username;
//                 user.username = username;
//                 user.email = null;
//                 user.password = `${username}password`;
//                 user.admin = false;
//                 userPost(user);
//             }

//         }
// }
// function arrFormation(arr, element) {
//     if (!arr.includes(element)) {
//         arr.push(element)
//     }
// }
// async function userPost(data) {
//     const response = await fetch('/api/user', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//     });
//     if (response.ok) {
//         console.log('success_client');
//     } else {
//         alert('This email is already registered with an existed account')
//     }
// }

// //create accounts
// function userGet() {
//     fetch(`/api/user/`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         for (let i = 0; i < data.length; i++) {
//             userMap.set(data[i].name.toLowerCase(), data[i].id);
//         };
//         fetch(`/api/account/`, {
//             method: 'GET'
//         }).then(function (response) {
//             return response.json();
//         }).then(function (data) {
//             for (let a = 0; a < data.length; a++) {
//                 accountMap.set(data[a].name, data[a].user_id);
//             }
//             accountFormation()
//         })
//     });
// };
// function accountFormation() {
//     for (let i = 2; i < rows.length; i++) {
//         const account = rows[i].cells[4].innerText.trim();
//         const user = rows[i].cells[3].innerText.trim().split(' ').join('').toLowerCase();
//         if(!accountMap.get(account) || accountMap.get(account) != userMap.get(user)){
//             accountMap.set(account, userMap.get(user));
//             arrFormation(accountArr, account)
//         }
//     };
//     console.log(accountArr.length);
//     for (let j = 0; j < accountArr.length; j++) {
//         if(accountArr[j]) {
//             const account = new Object();
//             const accountName = accountArr[j];
//             account.name = accountName;
//             account.prefix = accountName.substring(0,3);
//             account.user_id = accountMap.get(accountArr[j])
//             accountPost(account);
//         }
//     }
// };
// async function accountPost(data) {
//     const response = await fetch('/api/account/seeds', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//     });
//     if (response.ok) {
//         console.log('success_account');
//     } else {
//         alert('This email is already registered with an existed account')
//     }
// }

// //create Container
// function accountGet() {
//     fetch(`/api/account/`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         for (let a = 0; a < data.length; a++) {
//             containerMap.set(data[a].name, [data[a].user.name.toLowerCase(), data[a].user_id, data[a].id]);
//         };
//         containerFormation()
//     })
// };
// var masterMap = new Map();
// function containerFormation() {
//     for (let i = 2; i < rows.length; i++) {
//         if (rows[i].cells[1].innerText.trim() && containerMap.get(rows[i].cells[4].innerText.trim())) {
//             var container = new Object();
//             container.container_number = rows[i].cells[1].innerText.trim();
//             container.received_date = rows[i].cells[2].innerText.trim();
//             container.user = rows[i].cells[3].innerText.split(' ').join('').toLowerCase();
//             container.account = rows[i].cells[4].innerText.trim();
//             container.cost = 0
//             container.description = rows[i].cells[6].innerText;
//             container.length = parseFloat(rows[i].cells[7].innerText.trim())*2.54;
//             container.width = parseFloat(rows[i].cells[8].innerText.trim())*2.54;
//             container.height = parseFloat(rows[i].cells[9].innerText.trim())*2.54;
//             container.volume = container.length*container.width*container.height;
//             container.account_id = containerMap.get(container.account)[2];
//             container.user_id = containerMap.get(container.account)[1];
//             container.bill_received = new Date(rows[i].cells[2].innerText.trim()).valueOf();
//             container.bill_storage = new Date('3/31/2022').valueOf();
//             arrFormation(containerArr, container.container_number);
//             masterMap.set(container.container_number, container);
//             console.log('count');
//         }
//     };
//     console.log(containerArr.length);
// };
// function continueContainerInsert(start, end) {
//     for (let j = start; j < end; j++) {
//         if(containerArr[j]) {
//             containerPost(masterMap.get(containerArr[j]));
//         }
//     }
// };
// async function containerPost(data) {
//     const response = await fetch('/api/container/seeds', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//     });
//     if (response.ok) {
//         console.log('success_container');
//     } else {
//         alert('This email is already registered with an existed account')
//     }
// }


// //create Items
// var itemMap = new Map();
// function containerGet() {
//     fetch(`/api/container/`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         for (let a = 0; a < data.length; a++) {
//             itemMap.set(data[a].container_number, [data[a].id, data[a].account_id, data[a].user_id]);
//         };
//         itemFormation()
//     })
// };
// var itemQtyMap = new Map();
// var itemMasterMap = new Map();
// function itemFormation() {
//     for (let i = 2; i < rows.length; i++) {
//         if (rows[i].cells[1].innerText.trim() && itemMap.get(rows[i].cells[1].innerText.trim())) {
//             if (!itemQtyMap.get(`${rows[i].cells[5].innerText.trim()}-${rows[i].cells[1].innerText.trim()}`)) {
//                 itemQtyMap.set(`${rows[i].cells[5].innerText.trim()}-${rows[i].cells[1].innerText.trim()}`, 1)
//             } else {
//                 itemQtyMap.set(`${rows[i].cells[5].innerText.trim()}-${rows[i].cells[1].innerText.trim()}`, itemQtyMap.get(`${rows[i].cells[5].innerText.trim()}-${rows[i].cells[1].innerText.trim()}`)+1)
//             }
//             var item = new Object();
//             item.item_number = `${rows[i].cells[5].innerText.trim()}-${rows[i].cells[1].innerText.trim()}`
//             item.container_id = itemMap.get(rows[i].cells[1].innerText.trim())[0];
//             item.user_id = itemMap.get(rows[i].cells[1].innerText.trim())[2];
//             item.account_id = itemMap.get(rows[i].cells[1].innerText.trim())[1];
//             itemMasterMap.set(item.item_number, item)
//             arrFormation(itemArr, item.item_number);
//             console.log('count');
//         }
//     };
//     console.log(itemArr.length);
// };
// function continueItemInsert(start, end) {
//     for (let j = start; j < end; j++) {
//         if(itemArr[j]) {
//             itemPost({
//                 item_number: itemMasterMap.get(itemArr[j]).item_number.split('-')[0],
//                 user_id: itemMasterMap.get(itemArr[j]).user_id,
//                 account_id: itemMasterMap.get(itemArr[j]).account_id,
//                 container_id: itemMasterMap.get(itemArr[j]).container_id,
//                 qty_per_sku: itemQtyMap.get(itemArr[j])
//             });
//         }
//     }
// };
// async function itemPost(data) {
//     const response = await fetch('/api/item/seeds', {
//         method: 'post',
//         body: JSON.stringify(data),
//         headers: { 'Content-Type': 'application/json' }
//     });
//     if (response.ok) {
//         console.log('success_item');
//     } else {
//         alert('This email is already registered with an existed account')
//     }
// };

var boxArr = [];
var unmatchedArr = [];
var non_repeat = [];
var repeated = [];
function locationInit () {
    console.log(`location sheet: ${rows.length-1} boxes`);
    for (let i = 1; i < rows.length; i++) {
        const box_number = rows[i].cells[1].innerText.trim();
        const location = rows[i].cells[2].innerText.trim();
        if (validation(boxArr, box_number)) {
            arrFormation(non_repeat, box_number)
            boxArr = boxArr.filter(i => i != box_number)
        } else {
            unmatchedArr.push(box_number);
            console.log('boxes present on location sheet but not in the database');
        }
    };
    console.log(unmatchedArr);
    console.log(`${boxArr.length} boxes not assigned location`);
    console.log(boxArr);
    console.log(`${non_repeat.length} non-repeated box numbers`);
    console.log(`${repeated.length} repeated box numbers`);
    console.log(repeated);
}

function validation(arr, number) {
    if (arr.includes(number)) {
        return true
    } else {
        return false
    }
}

function boxInit() {
    fetch(`/api/container/`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
            const container_number = data[i].container_number;
            if (!boxArr.includes(container_number)) {
                boxArr.push(container_number)
            }

        }
        console.log(`database: ${boxArr.length} amazon boxes`);
    })
};boxInit();

async function locationPost(number, location) {
    const response = await fetch(`/api/container/number/${number}`, {
        method: 'PUT',
        body: JSON.stringify({location: location}),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
        console.log('success_location');
    }
};

function arrFormation(arr, element) {
    if (!arr.includes(element)) {
        arr.push(element)
    }
}
