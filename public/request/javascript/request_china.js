console.log(location.href, 'request_china.js');
var loader = document.getElementById('loader');
var table = document.getElementById("myTable");
var rows = table.rows;
// function show_all() {
//   var table, tr, td, i, txtValue, a, b, c, d;
//   a = "received".toUpperCase();
//   b = "requested".toUpperCase();
//   c = "pending".toUpperCase();
//   d = "shipped".toUpperCase();
//   table = document.getElementById("myTable");
//   tr = table.getElementsByTagName("tr");

//   for (i = 0; i < tr.length; i++) {
//     td = tr[i].getElementsByTagName("td")[10];
//     if (td) {
//       txtValue = td.textContent || td.innerText;
//       if (txtValue.toUpperCase().indexOf(a) > -1 || txtValue.toUpperCase().indexOf(b) > -1 || txtValue.toUpperCase().indexOf(c) > -1 || txtValue.toUpperCase().indexOf(d) > -1) {
//         tr[i].style.display = "";
//       } else {
//         tr[i].style.display = "none";
//       }
//     }
//   }
// };
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
  const file = document.getElementById('label').files[0];
  const file_2 = document.getElementById('label_2').files[0];
  console.log(file);
  var check_label = document.getElementById('label_not_required')
  if (!file && !file_2 && !check_label.checked) {
    alert('The shipping label is missing! Please attach a pdf file and try again! 无夹带档案！请夹带档案或者勾选无夹带档案栏，然后再试一遍。')
  } else {
    var fileName, fileName_2;
    var fba = document.getElementById('amazon_ref').value.trim()
    fba = fba.toUpperCase();
    var notes = document.getElementById('notes').value;
    var confirmationArr = [];
    var table = document.getElementById("myTable");
    var checkBoxes = table.getElementsByTagName("input");
    for (var i = 0; i < checkBoxes.length; i++) {
      if (checkBoxes[i].checked) {
      var row = checkBoxes[i].parentNode.parentNode;
      var eachBox = `<tr>
      <td class='text-primary'>${row.cells[2].innerHTML}</td>
      <td>${row.cells[3].innerHTML}</td>
      <td>${row.cells[7].innerHTML}</td>
      </tr>`;
      confirmationArr.push(eachBox)
      }
    };
    if (confirmationArr.length) {
      confirmationArr = confirmationArr.join('');
      if (file) {
        fileName = file.name
      } else {
        fileName = `no file`
      };
      if (file_2) {
        fileName_2 = file_2.name
      } else {
        fileName_2 = `no file`
      };
      UIkit.modal.confirm(`<small class='text-primary' uk-tooltip="title: This page is a pre-check step before proceeding the confirmation. Please review your request order. If there is any input error, simply click “Cancel” and correct it. Otherwise, click “OK” to continue; pos: right">此页为检查页面，若发现输入/选择错误，请按“Cancel”并更改；若所有输入皆正确，请按“OK”完成通知</small><table class="uk-table uk-table-small uk-table-divider">
      <thead>
        <tr>
        <th>箱码/ 细目/ SKU</th>
        <th></th>
        <th></th>
        </tr>
      </thead>
      <tbody>
      ${confirmationArr}
      </tbody>
      </table><hr><b>附注留言</b>: ${notes}<hr><b>FBA:</b> ${fba}<hr><b>档案:</b> <u>${fileName}</u> & <u>${fileName_2}</u>`).then(function () {
        loader.style.display = '';
        GetSelected()
    }, function () {
        console.log('Rejected.')
    });
    } else {
      alert('You need to select at least one box! 您需要选择至少一个箱货')
    }
  }
};
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
    const response = await fetch(`/api/box/upload`, {
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

    const response = await fetch(`/api/box/upload`, {
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

    const response = await fetch(`/api/box/upload_2`, {
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
function GetSelected() {
  var fba = document.getElementById('amazon_ref').value.trim()
  fba = fba.toUpperCase();
  var notes = document.getElementById('notes').value;
  var confirmationArr = [];
  var table = document.getElementById("myTable");
  var checkBoxes = table.getElementsByTagName("input");
  for (var i = 0; i < checkBoxes.length; i++) {
    var confirmation = new Object
    if (checkBoxes[i].checked) {
        var row = checkBoxes[i].parentNode.parentNode;
        confirmation.account = row.cells[1].innerHTML;
        confirmation.box_number = row.cells[2].innerHTML;
        confirmation.description = row.cells[3].innerHTML;
        confirmation.order = row.cells[4].innerHTML;
        confirmation.total_box = row.cells[5].innerHTML;
        confirmation.qty_per_box = row.cells[6].innerHTML;
        confirmation.status = row.cells[10].innerHTML;
        confirmation.fba = fba;
        confirmationArr.push(confirmation)
    }
  };
  if (confirmationArr.length) {
    editStatus(confirmationArr, notes)
  } else {
    loader.style.display = 'none';
    alert('You need to select at least one box! 您需要选择至少一个箱货')
  }
};
function editStatus(event, n) {
  const promises = [];
  const s3 = new Date().valueOf() + 1;
  var notes = n;
  for (let i = 0; i < event.length; i++) {
    const fba = event[i].fba;
    const account = event[i].account;
    const box_number = event[i].box_number
    var requested_date = new Date().toLocaleDateString("en-US");
    var status = 2;
    console.log(status);
    promises.push((statusUpdate(box_number, status, requested_date, s3, notes, fba)));
    promises.push(record(box_number, s3, account))
  };
  Promise.all(promises).then(() => {
    upload_file(s3)
  }).catch((e) => {console.log(e)})
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
// function status_trigger(n) {
//   if (n == 2) {
//     const pending = 'Pending';
//     filter_status(pending)
//   } else if (n == 3) {
//     const received = 'Received';
//     filter_status(received)
//   } else if (n == 4) {
//     const requested = 'Requested';
//     filter_status(requested)
//   } else if (n == 5) {
//     const shipped = 'Shipped';
//     filter_status(shipped)
//   } else if (n == 6) {
//     const received = 'Received';
//     const requested = 'Requested';
//     filter_status_i(received, requested)
//   } else {
//     show_all();
//   }
// };
// function filter_status(txt) {
//   var filter, table, tr, td, i, txtValue;
//   console.log(txt);
//   filter = txt.toUpperCase();
//   table = document.getElementById("myTable");
//   tr = table.getElementsByTagName("tr");
//   for (i = 0; i < tr.length; i++) {
//     td = tr[i].getElementsByTagName("td")[10];
//     if (td) {
//       txtValue = td.textContent || td.innerText;
//       if (txtValue.toUpperCase().indexOf(filter) > -1) {
//         tr[i].style.display = "";
//       } else {
//         tr[i].style.display = "none";
//       }
//     }
//   }
// };
// function filter_status_i(txt, txt_2) {
//   var filter, filter_2, table, tr, td, i, txtValue;
//   filter = txt.toUpperCase();
//   filter_2 = txt_2.toUpperCase();
//   table = document.getElementById("myTable");
//   tr = table.getElementsByTagName("tr");
//   for (i = 0; i < tr.length; i++) {
//     td = tr[i].getElementsByTagName("td")[10];
//     if (td) {
//       txtValue = td.textContent || td.innerText;
//       if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue.toUpperCase().indexOf(filter_2) > -1) {
//         tr[i].style.display = "";
//       } else {
//         tr[i].style.display = "none";
//       }
//     }
//   };
//   reset_filter();
// };
// function reset_filter() {
//  const radiolist =  document.getElementsByTagName('input');
//  for (let i = 0; i < radiolist.length; i++) {
//    if (radiolist[i].type.toLowerCase() == 'radio') {
//     radiolist[i].checked = false;
//    }
//  }
// };
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
///////create new order///////
// var map = new Map();
// function accountList() {
//     fetch(`/api/user/account`, {
//         method: 'GET'
//     }).then(function (response) {
//         return response.json();
//     }).then(function (data) {
//         for (let i = 0; i < data.length; i++) {
//             const option = document.createElement('option');
//             option.innerHTML = data[i].name + " (prefix: "+ data[i].prefix.toUpperCase() + ")";
//             document.querySelector('#accountList').appendChild(option);
//             map.set(data[i].name, data[i].id);
//         }
//     });
// };
// function saveAccount() {
//     var selectedOption = document.querySelector('#accountList').value;

//     if(selectedOption != 'Create New Account'){
//         var accountSaved = selectedOption.split(' (prefix:');
//         var prefixSaved = accountSaved[1].split(')');
//         localStorage.setItem('account', accountSaved[0]);
//         localStorage.setItem('prefix', prefixSaved[0]);
//         localStorage.setItem('account_id', map.get(accountSaved[0]));
//     } else {
//         localStorage.setItem('account', selectedOption);
//     }
// };

const record = async (box_number, s3, account) => {
  const ref_number = box_number;
  const status_from = 1;
  const status_to = 2;
  const date = new Date().toISOString().split('T')[0];
  const action = `China Box Request (Acct: ${account})`
  const sub_number = s3;
  const response = await fetch(`/api/record/request_china`, {
    method: 'POST',
    body: JSON.stringify({
        ref_number,
        status_from,
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
const statusUpdate = async (box_number, status, requested_date, s3, notes, fba) => {
  const response = await fetch(`/api/box/status_client`, {
    method: 'PUT',
    body: JSON.stringify({
        box_number,
        status,
        requested_date,
        s3,
        notes,
        fba
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    console.log(`${box_number} was updated!`);
  }
};
