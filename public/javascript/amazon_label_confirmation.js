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

async function statusChange(tracking, custom_2) {
    var description, input;
    tracking?input=document.getElementById(`input${tracking}`).value:input=document.getElementById(`input${custom_2}`).value;
    if (!input) {
        description = `All tasks completed; shipped.`
    } else {
        description = input;
    };
    if(confirm(`Ready to confirm shipping? Ending Date for billing will be set as ${today}. Admin Notes: ${description}`)){
        if(tracking != null) {
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
        } else {
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
    }
};

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
if (arr[index+1] && arr[index+1][0] == 'e') {
    UIkit.notification({
        message: 'Pallet Only Mode ON',
        status: 'primary',
        pos: 'top-right',
        timeout: 2000
    });
    document.getElementById('palletMode').innerHTML = "ON";
    document.getElementById('palletMode').parentElement.className = "btn btn-sm bg-info shadow-sm text-dark";
    document.getElementById('palletMode').parentElement.href = '/admin_confirm_amazon';
};

pallet_info_revise();
