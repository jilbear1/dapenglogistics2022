var inventoryCount = 0;
var numberOfItem = document.getElementById('numberOfInventory');
const containerTable = document.getElementById('myTable');
var containerMap = new Map();

function allItem() {
    fetch(`/api/item/allItemAdmin`, {
      method: 'GET'
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      const container_data = data.reduce((r, a) => {
        r[a.container.container_number] = r[a.container.container_number] || [];
        r[a.container.container_number].push(a);
        return r;
      }, Object.create(null));
      const newData = Object.values(container_data);
      for (let i = 0; i < newData.length; i++) {
        const containerNumber = newData[i][0].container.container_number;
        containerMap.set(containerNumber, newData[i]);
      };
      var tr;
      var emptyArr = [];
      tr = containerTable.getElementsByTagName('tr');
      for (let i = 1; i < tr.length; i++) {
        var skuCount = 0;
        const container_number = tr[i].getElementsByTagName('td')[2].innerHTML;
        const status = tr[i].getElementsByTagName('td')[7].innerText;
        const container = tr[i].getElementsByTagName('td')[2];
        const sku = tr[i].getElementsByTagName('td')[3];
        const qty = tr[i].getElementsByTagName('td')[4];
        if (status == 1) {
          tr[i].getElementsByTagName('td')[7].innerHTML = "Received";
          inventoryCount++
        } else if (status == 2) {
          tr[i].getElementsByTagName('td')[7].innerHTML = "Requested";
          inventoryCount++
        } else if (status == 3) {
          tr[i].getElementsByTagName('td')[7].innerHTML = "Shipped"
        } else if (status == 4) {
          tr[i].getElementsByTagName('td')[7].innerHTML = "XC pre-billed"
        } else {
          tr[i].getElementsByTagName('td')[7].innerHTML = "Pending"
        };
        if(containerMap.get(container_number)){
          containerMap.get(container_number).forEach(item => {
            skuCount = skuCount + item.qty_per_sku;
            const singleSKU = document.createElement('div');
            const singleQty = document.createElement('div');
            singleSKU.innerHTML = item.item_number;
            singleQty.innerHTML = item.qty_per_sku;
            sku.appendChild(singleSKU);
            qty.appendChild(singleQty)
          })
        } else {
          if (container_number.substring(0,2) != "AC") {
            emptyArr.push(tr[i]);
            inventoryCount--
            tr[i].style.display = 'none';
          }
        }
      container.innerHTML = container.innerHTML + ` <small>(${skuCount})</small>`;
      };
      emptyArr.forEach(i => i.remove())
      numberOfItem.innerHTML = inventoryCount;
      document.getElementById('loader').remove();
      status_trigger(6)
    })
};
function clear_noFile_radio() {
  const no_file = document.getElementById("label_not_required");
  if (no_file.checked) {
    document.getElementById('amazon_ref').value = null;
    no_file.checked = false;
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
function status_trigger(n) {
  if (n == 2) {
    const pending = 'Pending';
    filter_status(pending)
  } else if (n == 3) {
    const received = 'Received';
    filter_status(received)
  } else if (n == 4) {
    const requested = 'Requested';
    filter_status(requested)
  } else if (n == 5) {
    const shipped = 'Shipped';
    filter_status(shipped)
  } else if (n == 6) {
    const received = 'Received';
    const requested = 'Requested';
    filter_status_i(received, requested)
  } else {
    show_all();
  }
};
function filter_status(txt) {
  var filter, table, tr, td, i, txtValue;
  filter = txt.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[7];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
};
function filter_status_i(txt, txt_2) {
  var filter, filter_2, table, tr, td, i, txtValue;
  filter = txt.toUpperCase();
  filter_2 = txt_2.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[7];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue.toUpperCase().indexOf(filter_2) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  };
  reset_filter();
};
function show_all() {
  var table, tr, td, i, txtValue, a, b, c, d;
  a = "received".toUpperCase();
  b = "requested".toUpperCase();
  c = "pending".toUpperCase();
  d = "shipped".toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[7];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(a) > -1 || txtValue.toUpperCase().indexOf(b) > -1 || txtValue.toUpperCase().indexOf(c) > -1 || txtValue.toUpperCase().indexOf(d) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
};
function reset_filter() {
 const radiolist =  document.getElementsByTagName('input');
 for (let i = 0; i < radiolist.length; i++) {
   if (radiolist[i].type.toLowerCase() == 'radio') {
    radiolist[i].checked = false;
   }
 }
};
allItem();
