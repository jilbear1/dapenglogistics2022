console.log(location.href, 'master table.js');
const table = document.getElementById("myTable");
const numberOfItem = document.getElementById('numberOfInventory');
const rows = table.rows;
var inventoryCount = 0;

const init = () => {
  for (i = 1; i < rows.length; i++){
    var data_status = parseInt(rows[i].cells[10].innerText);
      if (data_status == 1) {
        inventoryCount++;
        rows[i].cells[10].innerHTML = "存货"
      } else if (data_status == 2) {
        inventoryCount++;
        rows[i].cells[10].innerHTML = "通知寄出"
      } else if (data_status == 3) {
        rows[i].cells[10].innerHTML = "完成出货"
      } else if (data_status == 98) {
        rows[i].cells[10].innerHTML = "汇整"
      } else {
        rows[i].cells[10].innerHTML = "挂单"
      }
  };
  numberOfItem.innerHTML = inventoryCount;
  document.getElementById('loader').remove();
  status_trigger(6);
}

//////sort by column
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
//////sort by status
function status_trigger(n) {
  if (n == 2) {
    const pending = '挂单';
    filter_status(pending)
  } else if (n == 3) {
    const received = '存货';
    filter_status(received)
  } else if (n == 4) {
    const requested = '通知寄出';
    filter_status(requested)
  } else if (n == 5) {
    const shipped = '完成出货';
    filter_status(shipped)
  } else if (n == 6) {
    const received = '存货';
    const requested = '通知寄出';
    filter_status_i(received, requested)
  } else {
    show_all();
  }
};
function show_all() {
  var table, tr, td, i, txtValue, a, b, c, d;
  a = "存货".toUpperCase();
  b = "通知寄出".toUpperCase();
  c = "挂单".toUpperCase();
  d = "完成出货".toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[10];
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
function filter_status(txt) {
  var filter, table, tr, td, i, txtValue;
  console.log(txt);
  filter = txt.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[10];
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
    td = tr[i].getElementsByTagName("td")[10];
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
function reset_filter() {
 const radiolist =  document.getElementsByTagName('input');
 for (let i = 0; i < radiolist.length; i++) {
   if (radiolist[i].type.toLowerCase() == 'radio') {
    radiolist[i].checked = false;
   }
 }
};

init();
