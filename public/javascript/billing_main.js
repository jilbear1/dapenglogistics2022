const client_list = document.getElementById('client_list');
const today = new Date().toLocaleDateString("en-US");
// billing units
const shipping_cost = document.getElementById('shipping_cost');
const receiving_cost = document.getElementById('receiving_cost');
const storage_cost = document.getElementById('storage_cost');
const cost_cache = ["shipping_cost", "receiving_cost", "storage_cost"];
const cost_retainer = (arr) => {
    arr.forEach(cost => {
        if (localStorage.getItem(cost)) {
            document.getElementById(cost).value = parseFloat(localStorage.getItem(cost))
        }
    })
}; cost_retainer(cost_cache);
const cost_updater = (arr) => {
    arr.forEach(cost => {
        localStorage.setItem(cost, document.getElementById(cost).value)
    })
};
// charge display
const shipping_total = document.getElementById('shipping_total');
const storage_total = document.getElementById('storage_total');
const receiving_total = document.getElementById('receiving_total');
const xcharge_total = document.getElementById('xcharge_total');
const all_total = document.getElementById('all_total');
const shipping_total_2 = document.getElementById('shipping_total_2');
const storage_total_2 = document.getElementById('storage_total_2');
const receiving_total_2 = document.getElementById('receiving_total_2');
const xcharge_total_2 = document.getElementById('xcharge_total_2');

// table
const storage_table = document.getElementById('storage_table');
const received_table = document.getElementById('received_table');
const shipped_table = document.getElementById('shipped_table');
const xcharge_table = document.getElementById('xcharge_table');

const userAndIdMap = new Map ();
document.getElementById('today').innerHTML = today;
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
        userAndIdMap.set(data[i].id, data[i].name);
        client_list.appendChild(user)
        };
    });
};
client_data();

function unlock_select() {
    document.getElementById('client_list').disabled = false;
    document.getElementById('charge_btn').style.display = 'none';
    document.getElementById('reset_btn').style.display = '';
};
//when specific user is selected
function client() {
 if (client_list.value != 0) {
    cost_updater(cost_cache);
    const user_id = client_list.value
    document.getElementById('client_list').disabled = true;
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('user_name', userAndIdMap.get(parseInt(user_id)));
    next(user_id);
 }
};

var total_charge = 0
var total_st_charge = 0;
var total_xc_charge = 0;
var receivedCount = 0;
var shippedCount = 0;

/////////////Array to store box_numbers to update their assoicated bill_shipped & bill_received
var shippedBoxArr = [];
var receivedBoxArr = [];
var storageBoxArr = [];
var xchargeBoxArr = [];

/// trigger fetch for additional charge data
function xc_next(user_id) {
    fetch('/api/user/xc_per_user', {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (xcData) {
        const selectedData = xcData[user_id];
        if (selectedData) {
            for (let b = 0; b < selectedData.length; b++) {
                xc_billing(selectedData, b);
            };
            xcharge_total_2.innerHTML = total_xc_charge.toFixed(2);
            xcharge_total.innerHTML = total_xc_charge.toFixed(2);
            const subtotal = parseFloat(all_total.innerHTML) + total_xc_charge;
            all_total.innerHTML = subtotal.toFixed(2);
        };
    })
}
//////////// trigger fetch function to grab data
function next(user_id) {
    document.getElementById('storageTable').style.display = '';
    document.getElementById('receivedTable').style.display = '';
    document.getElementById('shippedTable').style.display = '';
    document.getElementById('xchargeTable').style.display = '';
    document.getElementById('x_only').disabled = false;
    document.getElementById('r_only').disabled = false;
    document.getElementById('s_only').disabled = false;
    document.getElementById('st_only').disabled = false;
    document.getElementById('all').disabled = false;
    fetch(`/api/user/billing_per_user/${user_id}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        const pageData = data;
        //RECEIVED FOR LOOP
        for (let j = 0; j < pageData.length; j++) {
           if(!pageData[j].bill_received) {
            received_billing(pageData, j);
            receivedCount++;
            receivedBoxArr.push(pageData[j].box_number)
           }
        };
        var received_charge = receivedCount*receiving_cost.value;
        receiving_total.innerHTML = received_charge;
        receiving_total_2.innerHTML = received_charge;

        //STORAGE FOR LOOP
        for (let i = 0; i < pageData.length; i++) {
            if (!pageData[i].shipped_date || validate(pageData[i].shipped_date, pageData[i].bill_storage)) {
                // if(!(pageData[i].status == 3 && monthValidate(pageData[i].bill_storage))) {
                storage_billing_1stStep(pageData, i);
                // }
            };
        };
        // var storage_charge = total_billable_day*total_volume*storage_cost.value;
        storage_total.innerHTML = total_st_charge.toFixed(5);
        storage_total_2.innerHTML = total_st_charge.toFixed(5)

        //SHIPPED FOR LOOP
        for (let k = 0; k < pageData.length; k++) {
            if(!pageData[k].bill_shipped && pageData[k].status == 3) {
                shipped_billing(pageData, k);
                shippedCount++;
                shippedBoxArr.push(pageData[k].box_number)
            }
        };
        var shipped_charge = shippedCount*shipping_cost.value;
        shipping_total.innerHTML = shipped_charge;
        shipping_total_2.innerHTML = shipped_charge;

        //total charge
        total_charge = shipped_charge + received_charge + total_st_charge;
        all_total.innerHTML = total_charge.toFixed(2);
        xc_next(user_id);
        return shippedBoxArr, receivedBoxArr, storageBoxArr;
    });
};
////////////////////////////// STORAGE FOR LOOP
//function to build the stroage table if pass validation
function storage_billing_1stStep(pageData, i) {
    if (!pageData[i].bill_storage) {
        storage_billing(pageData, i, pageData[i].received_date)
    } else {
        const oldDate = new Date(pageData[i].bill_storage).toLocaleDateString("en-US");
        storage_billing(pageData, i, oldDate);
    }
};
function storage_billing(pageData, i, lastBillDate) {
    const container = document.createElement('tr');
    const user = document.createElement('td');
    const account = document.createElement('td');
    const box_number = document.createElement('td');
    const description = document.createElement('td');
    const received_date = document.createElement('td');
    const lbd = document.createElement('td');
    const ending_date = document.createElement('td');
    const volume = document.createElement('td');
    const billable = document.createElement('td');
    const cost = document.createElement('td');
    container.appendChild(user);
    container.appendChild(account);
    container.appendChild(box_number);
    container.appendChild(description);
    container.appendChild(received_date);
    container.appendChild(lbd);
    container.appendChild(ending_date);
    container.appendChild(volume);
    container.appendChild(billable);
    container.appendChild(cost);
    user.innerHTML = pageData[i].user.name;
    account.innerHTML = pageData[i].account.name;
    box_number.innerHTML = pageData[i].box_number;
    description.innerHTML = pageData[i].description;
    const volumeNew = pageData[i].volume/764555;
    volume.innerHTML = volumeNew.toFixed(10);
    if (lastBillDate == pageData[i].received_date) {
        storageBoxArr.push(pageData[i].box_number);
        received_date.innerHTML =  pageData[i].received_date;
        const dayCalInit = dayCalculatorInit(pageData[i].received_date, pageData[i].shipped_date);
        billable.innerHTML =  dayCalInit;
        lbd.innerHTML = ' ';
        storage_table.appendChild(container);
        const pre_cost = storage_cost.value*volumeNew*dayCalInit;
        total_st_charge = total_st_charge+pre_cost
        cost.innerHTML = `$${pre_cost.toFixed(5)}`
    } else {
        const dayCalConti = dayCalculatorConti(pageData[i].received_date, lastBillDate, pageData[i].shipped_date);
        storageBoxArr.push(pageData[i].box_number);
        received_date.innerHTML = pageData[i].received_date;
        lbd.innerHTML = lastBillDate;
        billable.innerHTML = dayCalConti;
        const pre_cost = storage_cost.value*volumeNew*dayCalConti;
        cost.innerHTML = `$${pre_cost.toFixed(5)}`;
        total_st_charge = total_st_charge+pre_cost;
        storage_table.appendChild(container);
    };
    if (pageData[i].shipped_date) {
        ending_date.innerHTML = `${pageData[i].shipped_date}**`;
    } else {ending_date.innerHTML = new Date().toLocaleDateString("en-US");};
};
//month validation: only bill the box not shipped or shipped this month
// function monthValidate(s) {
//     const ending_year = new Date(s).getFullYear();
//     const this_year = new Date(today).getFullYear();
//     const ending_month= new Date(s).getMonth();
//     const thisMonth = new Date(today).getMonth();
//     if (ending_month == thisMonth && ending_year == this_year) {
//         return true
//     } return false
// };
function validate(s, bs) {
    const shippedDate = new Date(s).getTime();
    if (!bs) {
        return true
    } else if ( shippedDate >= bs ) {
        return true
    } else {
        return false
    }
};
//billable day function: r = received_date; s = shipped_date if any
function dayCalculatorInit(r,s) {
    var diff = main_calculator(r,s)
    if (diff > 30) {
    return diff-30
    } else {
    return 0
    }
};
function main_calculator(start, end) {
    var start_date = new Date(start);
    if (end) {
        var ending_date = new Date(end);
    } else {
        var ending_date = new Date(today);
    };
    var Difference_In_Time = ending_date.getTime() - start_date.getTime();
    return Math.ceil(Difference_In_Time / (1000 * 3600 * 24)) + 1;
};
function dayCalculatorConti(r,b,s) {
    var discount;
    if (30 - main_calculator(r,b) < 0) {
        discount = 0;
    } else {
        discount = 30 - main_calculator(r,b);
    };
    const result = main_calculator(b,s)-1-discount;
    if (result < 0) {
        return 0;
    } else {
        return result;
    }
};
/////////////////////////////////////////////////

////////////////////////////// RECEIVED FOR LOOP
function received_billing(pageData, i) {
    const container = document.createElement('tr');
    received_table.appendChild(container);
    const user = document.createElement('td');
    const account = document.createElement('td');
    const box_number = document.createElement('td');
    const description = document.createElement('td');
    const received_date = document.createElement('td');
    const cost = document.createElement('td');
    container.appendChild(user);
    container.appendChild(account);
    container.appendChild(box_number);
    container.appendChild(description);
    container.appendChild(received_date);
    container.appendChild(cost);
    user.innerHTML = pageData[i].user.name;
    account.innerHTML = pageData[i].account.name;
    box_number.innerHTML = pageData[i].box_number;
    description.innerHTML = pageData[i].description;
    received_date.innerHTML = pageData[i].received_date;
    cost.innerHTML = `$${receiving_cost.value}`
};

////////////////////////////// SHIPPED FOR LOOP
function shipped_billing(pageData, i) {
    const container = document.createElement('tr');
    shipped_table.appendChild(container);
    const user = document.createElement('td');
    const account = document.createElement('td');
    const box_number = document.createElement('td');
    const fba = document.createElement('td');
    const description = document.createElement('td');
    const shipped_date = document.createElement('td');
    const cost = document.createElement('td');
    container.appendChild(user);
    container.appendChild(account);
    container.appendChild(box_number);
    container.appendChild(fba);
    container.appendChild(description);
    container.appendChild(shipped_date);
    container.appendChild(cost);
    user.innerHTML = pageData[i].user.name;
    account.innerHTML = pageData[i].account.name;
    box_number.innerHTML = pageData[i].box_number;
    fba.innerHTML = pageData[i].fba;
    description.innerHTML = pageData[i].description;
    shipped_date.innerHTML = pageData[i].shipped_date;
    cost.innerHTML = `$${shipping_cost.value}`;
};

////////////////////////////// XC FOR LOOP
function xc_billing(data, i) {
    if (data[i].cost > 0) {
        xchargeBoxArr.push(data[i].box_number)
    };
    const container = document.createElement('tr');
    xcharge_table.appendChild(container);
    const date = document.createElement('td');
    const user = document.createElement('td');
    const account = document.createElement('td');
    const box_number = document.createElement('td');
    const fba = document.createElement('td');
    const description = document.createElement('td');
    const qty_per_box = document.createElement('td');
    const order = document.createElement('td');
    const cost = document.createElement('td');
    container.appendChild(date);
    container.appendChild(user);
    container.appendChild(account);
    container.appendChild(box_number);
    container.appendChild(fba);
    container.appendChild(description);
    container.appendChild(qty_per_box);
    container.appendChild(order);
    container.appendChild(cost);
    date.innerHTML = data[i].requested_date;
    user.innerHTML = data[i].user.name;
    account.innerHTML = data[i].account.name;
    box_number.innerHTML = data[i].box_number;
    box_number.style.display = 'none';
    fba.innerHTML = data[i].fba;
    description.innerHTML = data[i].description;
    order.innerHTML = data[i].order;
    qty_per_box.innerHTML = data[i].qty_per_box;
    cost.innerHTML = `$${data[i].cost}`;
    total_xc_charge = total_xc_charge + parseFloat(data[i].cost);
}

//sorting
function sortStTable(n) {
    const table = document.getElementById("stTable");
    sortTable(table, n)
};
function sortRTable(n) {
    const table = document.getElementById("rTable");
    sortTable(table, n)
};
function sortSTable(n) {
    const table = document.getElementById("sTable");
    sortTable(table, n)
};
function sortXTable(n) {
    const table = document.getElementById("xTable");
    sortTable(table, n)
};
function sortTable(table,n) {
    var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
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


//display one table only
function show_all() {
    document.getElementById('storageTable').style.display ='';
    document.getElementById('receivedTable').style.display ='';
    document.getElementById('shippedTable').style.display ='';
    document.getElementById('xchargeTable').style.display = '';
    document.getElementById('x_onlyConfrim').style.display = 'none';
    document.getElementById('s_onlyConfrim').style.display = 'none';
    document.getElementById('r_onlyConfrim').style.display = 'none';
    document.getElementById('st_onlyConfrim').style.display = 'none';
    document.getElementById('x_onlySave').style.display = 'none';
};
function st_only() {
    document.getElementById('storageTable').style.display = '';
    document.getElementById('st_onlyConfrim').style.display = '';
    document.getElementById('receivedTable').style.display = 'none';
    document.getElementById('shippedTable').style.display = 'none';
    document.getElementById('xchargeTable').style.display = 'none';
};
function r_only() {
    document.getElementById('storageTable').style.display = 'none';
    document.getElementById('xchargeTable').style.display = 'none';
    document.getElementById('receivedTable').style.display = '';
    document.getElementById('shippedTable').style.display = 'none';
    document.getElementById('r_onlyConfrim').style.display = '';
};
function s_only() {
    document.getElementById('storageTable').style.display = 'none';
    document.getElementById('receivedTable').style.display = 'none';
    document.getElementById('xchargeTable').style.display = 'none';
    document.getElementById('shippedTable').style.display = '';
    document.getElementById('s_onlyConfrim').style.display = '';
};
function x_only() {
    document.getElementById('storageTable').style.display = 'none';
    document.getElementById('receivedTable').style.display = 'none';
    document.getElementById('shippedTable').style.display = 'none';
    document.getElementById('x_onlySave').style.display = '';
    document.getElementById('xchargeTable').style.display = '';
    document.getElementById('x_onlyConfrim').style.display = '';

}

// rest page
function reset() {
    localStorage.clear();
    location.reload()
};

// add new ediable row for extra charge
function addRow(t, n) {
    const target_table = document.getElementById(`${t}`);
    const pre_digcode = parseInt(String(new Date().valueOf() + Math.floor(1000000000 + Math.random() * 9000000000)).substring(4, 11));
    const charge_number = "AC" + pre_digcode;
    var row = target_table.insertRow(0);
    row.setAttribute('class','text-danger');
    for (let i = 0; i < n; i++) {
        var cell = row.insertCell(i);
        if (i == 3) {
            cell.innerHTML = charge_number;
            cell.style.display = 'none'
        } else if (i == 1) {
            cell.innerHTML = localStorage.getItem('user_name')
        } else if (i == 0) {
            cell.innerHTML = today;
        } else if (i == 2) {
            cell.innerHTML = `<select class="uk-select" id="account_list">
            <option value='0'>select account</option>
         </select>`
        } else if (i == 5) {
            cell.setAttribute('contenteditable', true)
        } else if (i == 4) {
            cell.setAttribute('contenteditable', true);
            cell.innerHTML = 'FBA'
        } else if (i == 6 || i == 7) {
            cell.setAttribute('onkeyup', 'xc_cost_calculator()');
            cell.setAttribute('contenteditable', true);
        }
    };
    getAccounts(localStorage.getItem('user_id'));
};

//get account selection for additional charge
function getAccounts(user_id) {
    const account_list = document.getElementById('account_list');
    fetch(`/api/user/account_per_user`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        const accountData = data[user_id];
        for (let i = 0; i < accountData.length; i++) {
        const account = document.createElement('option');
        account.innerHTML = accountData[i].name;
        account.setAttribute('value', accountData[i].id);
        account_list.appendChild(account);
        };
    });
};

//fetch to put the change: status updated
function bill_confirm(arr, e) {
    const today = new Date().getTime();
    if (e == 's') {
        fetch_update(arr, today, 'bill_shipped')
    } else if (e == 'r') {
        fetch_update(arr, today, 'bill_received')
    } else if (e == 'st'){
        fetch_update(arr, today, 'bill_storage')
    } else if (e == 'x') {
        if (confirm('Friendly reminder: to SAVE all new inputs first before confirming the charge!')) {
            fetch_update(arr, today, 'xcharge')
        }
    }
};
async function fetch_update(arr, bill, type) {
    document.getElementById('loader').style.display = '';
    document.getElementById('numberOfItems').innerHTML = `${arr.length} items`;
    document.getElementById('all_tables').style.display='none';
    const response = await fetch(`/api/box/${type}_update`, {
        method: 'PUT',
        body: JSON.stringify({
            arr,
            bill
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    alert('database updated successfully!');
    location.reload();
};

//TOOL: calculate qty * unit charge
function xc_cost_calculator () {
    var dataTable = document.getElementById( "xTable");
    for (let i = 1; i < dataTable.rows.length; i++ ) {
        const total_cost = dataTable.rows[i].cells[8];
        const qty = dataTable.rows[i].cells[6].innerHTML;
        const unit_charge = dataTable.rows[i].cells[7].innerHTML;
        total_cost.innerHTML = (qty*unit_charge).toFixed(2)
    }
};
var true_false_arr = [];
//to construct data object before fetching
function xcharge_create() {
    var dataTable = document.getElementById( "xTable");
    for (let i = 1; i < dataTable.rows.length; i++ ) {
     const account_td = dataTable.rows[i].cells[2];
     const account_select = account_td.querySelector('select');
     if (account_select) {
        true_false_arr.push(1);
            if (dataTable.rows[i].cells[8].innerHTML != 'NaN' && dataTable.rows[i].cells[8].innerHTML && dataTable.rows[i].cells[5].innerHTML && dataTable.rows[i].cells[5].innerHTML != '<br>' && account_select.value != 0) {
                const xc_account_id = account_select.value;
                const user_id = parseInt(localStorage.getItem('user_id'));
                const single_XC_data = {
                    user_id: user_id,
                    account_id: xc_account_id,
                    box_number: dataTable.rows[i].cells[3].innerHTML,
                    fba: dataTable.rows[i].cells[4].innerHTML,
                    description: dataTable.rows[i].cells[5].innerHTML,
                    qty_per_box: dataTable.rows[i].cells[6].innerHTML,
                    order: dataTable.rows[i].cells[7].innerHTML,
                    cost: dataTable.rows[i].cells[8].innerHTML
                };
                loading_xc_data(single_XC_data)
            } else {
                alert(`Incomplete data input on row #${i}. Unable to save this row.`);
                true_false_arr.push(0);
            };
        }
    };

    if(!true_false_arr.includes(0) && true_false_arr.includes(1)){
        alert(`Additional charges are inserted successfully!`);
        location.reload();
    } else {
        location.reload();
    }
};
//fetch function for xc data
const loading_xc_data = async(data) => {
    document.getElementById('loader').style.display = '';
    const response = await fetch('/api/box/additional_charge', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
        console.log(`charge id: ${data.box_number} is inserted successfully!`);
    } else {
        alert('try again')
    }
};


// reload and auto fetch the previous data
if (localStorage.getItem('user_id')) {
    window.onload = next(localStorage.getItem('user_id'));
    document.getElementById('charge_btn').style.display = 'none';
    document.getElementById('reset_btn').style.display = '';
    document.getElementById("pass").style.display = 'none';
}

//access code to initiate billing process
function done() {
    var password = document.getElementById("pass").value;
    if (password == '0523') {
        document.getElementById('charge_btn').style.display ='';
        document.getElementById("popup").style.display = "none";
    }
};
///tool
const test = new Date('4/20/2022').getTime()
console.log(test.toString());
