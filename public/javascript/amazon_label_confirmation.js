const today = new Date().toLocaleDateString("en-US");
function skuseeker(id, number) {
 unattach(number);
 fetch(`/api/item/findAllPerContainer/${id}`, {
     method: 'GET'
 }).then(function (response) {
     return response.json();
 }).then(function (data) {
     data.forEach(element => {
        const childElement = document.createElement('li');
        childElement.setAttribute('class','shadow-sm bg-light mb-1 container')
        number.appendChild(childElement);
        childElement.innerHTML = `<div class='row justify-content-around'><div class='col-4'>${element.item_number}</div><div class='col-4'><b>${element.qty_per_sku}</b></div>`
     });
 })
};

function statusChange(tracking, custom_2) {
    var description, input;
    tracking?input=document.getElementById(`input${tracking}`).value:input=document.getElementById(`input${custom_2}`).value;
    if (!input) {
        description = `All tasks completed; shipped.`
    } else {
        description = input;
    };
    if(confirm(`Ready to confirm shipping? Ending Date for billing will be set as ${today}. Admin Notes: ${description}`)){
        const promises = []
        if(tracking != null) {
            prepareRecord(tracking, promises);
            Promise.all(promises).then(() => {
                pallet_action(tracking, description);
            }).catch((e) => {console.log(e)})
        } else {
            prepareRecord(custom_2, promises);
            Promise.all(promises).then(() => {
                normal_action(custom_2, description);
            }).catch((e) => {console.log(e)})
        }
    }
};

const normal_action = async (custom_2, description) => {
    const response = await fetch(`/api/container/post-label-ez`, {
        method: 'PUT',
        body: JSON.stringify({
            shipped_date: today,
            custom_2: custom_2,
            status: 3,
            type: 3,
            description: description
        }),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        alert('Success!')
        location.reload()
    }
}
const pallet_action = async (tracking, description) => {
    const response = await fetch(`/api/container/post-label`, {
        method: 'PUT',
        body: JSON.stringify({
            shipped_date: today,
            tracking: tracking,
            status: 3,
            type: 3,
            description: description
        }),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        alert('Success!')
        location.reload()
    }
}
//helper function
function unattach(number) {
    number.querySelectorAll('li').forEach(i => i.remove())
};

const pallet_info_revise = () => {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const row = table.rows;
        for (let i = 1; i < row.length; i++) {
            if (row[i].cells[0].querySelector('small')) {
            const element = row[i].cells[0].querySelector('small').innerText;
            const elementArr = element.split('*');
            const index = elementArr[0];
            const pId = elementArr[5];
            row[i].cells[0].querySelector('small').innerHTML = `P${index}-${pId}`
            }
        }
    })
};

const arr = location.href.split('_');
const index = arr.indexOf('amazon');
if (arr[index+1] && arr[index+1][0] == 'p') {
    UIkit.notification({
        message: 'Pallet-only Mode ON',
        status: 'primary',
        pos: 'top-right',
        timeout: 2000
    });
    document.getElementById('palletMode').innerHTML = "ON";
    document.getElementById('palletMode').parentElement.className = "btn btn-sm bg-info shadow-sm text-dark";
    document.getElementById('palletMode').parentElement.href = '/admin_confirm_amazon';
};


/**
 * AM = 1
 * Req = 11;
 * Req reverse = 10
 * SP = 12;
 * SP create = 121
 * SP reverse
 * SP final confirm = 129;
 * China = 0 (create and request);
 * China Confirm  = -100;
 * Mapping = 50
 * */
const prepareRecord = (info, promises) => {
    var fileURL = "File URLs: "
    const cardHeader = document.getElementById(`requested_card${info}`);
    const client_id = cardHeader.getElementsByTagName("h5")[0].id;
    const accountName = cardHeader.getElementsByTagName("h5")[0].innerText.split(" - ")[1];
    const fileArr = [];
    var aTagArr = cardHeader.getElementsByTagName("h5")[0].parentElement.getElementsByTagName('a');
    Object.values(aTagArr).forEach(i => {
        i.href && i.href.includes('pdf')?fileArr.push(i.href.split('pdf/')[1]):console.log('file checker');
    });
    if (fileArr.length>0) {
        for (let l = 0; l < fileArr.length; l++) {
            const fileurl = fileArr[l];
            fileURL += `${fileurl}, `
        }
    } else {
        fileURL = "No File"
    }
    const rows = cardHeader.getElementsByTagName('table')[0].rows;
    for (let g = 1; g < rows.length; g++) {
        var secondary_number = null;
        const tr = rows[g];
        var container_number = tr.cells[0].innerText;
        if (container_number.includes("(")) {
            secondary_number = container_number.split('(')[1].split(')')[0];
            container_number = container_number.split('(')[0];
        }
        promises.push(record_container(client_id, rows.length-1, fileURL, container_number, secondary_number, accountName))
    }

};
const record_container = async (id, count, collection, sp_box_number, secondary_number, accountName) => {
    const user_id = id;
    const ref_number = sp_box_number;
    const sub_number = secondary_number;
    const status_from = 2;
    const status_to = 3;
    const qty_to = count;
    const qty_from = count;
    const action = `Admin Confirmed SP Boxes (for Acct: ${accountName})`;
    const action_notes = collection;
    const type = 129;
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/record/record_create`, {
      method: 'POST',
      body: JSON.stringify({
        user_id,
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


pallet_info_revise();
