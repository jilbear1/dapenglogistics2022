console.log('chinabox.js');
const table = document.getElementById('chinaTable');
const checkBoxes = table.getElementsByTagName("input");
const rows = table.rows;
///// preparing new AC box //////
const pre_digcode = parseInt(String(new Date().valueOf() + Math.floor(1000000000 + Math.random() * 9000000000)).substring(4, 11));
const charge_number = "AC" + pre_digcode;
const newACbox = new Object();
newACbox.box_number = charge_number;
////// main function /////////
function validation_request () {
    const requestArr = [];
    const promises = [];
    const accountIdArr = [];
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            const selectedbox = rows[i+1].cells[2].innerText;
            const selected_account_id = parseInt(rows[i+1].cells[1].id);
            requestArr.push(selectedbox);
            promises.push(archive(selectedbox));
            if (!accountIdArr.includes(selected_account_id)) {
                accountIdArr.push(selected_account_id)
            }
        }
    };
    if (!promises.length) {
        alert('No box is selected!')
    } else {
        newACbox.account_id = accountIdArr[0];
        newACbox.description = `${requestArr}`;
        newACbox.notes = document.getElementById('notes').value;
        promises.push(loading_xc(newACbox));
        Promise.all(promises).then(() => {
            location.reload();
        }).catch((e) => {console.log(e)})
        console.log(requestArr, accountIdArr);
    }
};
///// loading functions ///////
async function archive(box_number) {
    const response = await fetch(`/api/box/client_archive/${box_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log(`${box_number} is temporarily archived!`)
      } else {
        alert('try again')
    }
};
async function loading_xc(data) {
    const response = await fetch('/api/box/delete_request', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('delete box is placed successfully!')
      } else {
        alert('try again')
    }
};

function preCheckPage() {
    var requestArr = [];
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            const selectedItem = rows[i+1].cells[2].innerText;
            requestArr.push(`<div class="text-primary">${selectedItem}</div>`);
        }
    };
    if (!requestArr.length || requestArr.length > 15) {
        alert('删除请求限勾选量1-15之间，若超过15项，请分批请求')
    } else {
        const size = requestArr.length;
        requestArr = requestArr.join('');
        UIkit.modal.confirm(`<small class='text-primary' uk-tooltip="title: This page is a pre-check step before proceeding the confirmation. Please review your request order. If there is any input error, simply click “Cancel” and correct it. Otherwise, click “OK” to continue; pos: right">此页为检查页面，若发现输入/选择错误，请按“Cancel”并更改；若所有输入皆正确，请按“OK”完成通知</small><hr>
        <p class='mt-2'>删除物件(${size}件): ${requestArr}</p><hr><p>备注: ${document.getElementById('notes').value}</p>`).then(function () {
            validation_request ()
        }, function () {
            console.log('Rejected.')
        });
    }
};

//////welcome page//////
if (!localStorage.getItem('reminder')) {
    UIkit.modal.confirm(`
    <p class='text-primary text-center' uk-tooltip="title: The item-removal page allows clients to remove item(s)/merchandise(s) from his or her associated account. For merchandises directed came abroad, clients may choose the whole box; for Amazon/Walmart merchandises, client can choose either whole box or single sku for the removal process.; pos: right">此页为删除请求页面，使用者有三种选择模式：</p><br>
    <ol>
        <li><span class="text-primary">1. 跨海货物</span>(国内出口到美国存储的整箱货物): 勾选要移除的<span class="text-danger">整箱</span>货品，仓库管理员会即时为您销毁，若有特别需求，请留言在备注栏</li>
        <li><span class="text-primary">2. 美国转运货物</span>(美国亚马逊或其他物流公司回流的境内货物): 勾选要移除的<span class="text-danger">整箱</span>货品，仓库管理员会即时为您销毁，若有特别需求，请留言在备注栏</li>
        <li><span class="text-primary">3. 转运货品SKUs</span>(<u>美国转运货物</u>的单项物件): 勾选要移除的<span class="text-danger">单项</span>SKU，仓库管理员会把所有相关货箱中的此物件(SKU)即时销毁，若有特别需求，请留言在备注栏</li>
    </ol>
    <hr>
    <p class="text-center" uk-tooltip="title: Each request is limited for a total of 15 checked items. If your request contains more than 15 checked items, please seperate them into two or more batches.; pos: right">*一次不得勾选超过15样。若有必要，请分批请求*</p>
`).then(function () {
    localStorage.setItem('reminder', true);
});
}
