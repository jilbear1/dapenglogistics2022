const { jsPDF } = window.jspdf;
var table = document.getElementById("myTable");
var rows = table.rows;
for (i = 1; i < (rows.length + 1); i++){
  var data_status = rows[i].getElementsByTagName('td');
    if (data_status[10].innerHTML == 1) {
      rows[i].getElementsByTagName("td")[10].innerHTML = "Received"
    } else if (data_status[10].innerHTML == 2) {
      rows[i].getElementsByTagName("td")[10].innerHTML = "Requested"
    } else if (data_status[10].innerHTML == 3) {
      rows[i].getElementsByTagName("td")[10].innerHTML = "Shipped"
    } else if (data_status[10].innerHTML == 4) {
      rows[i].getElementsByTagName("td")[10].innerHTML = "Archived"
    } else {
      rows[i].getElementsByTagName("td")[10].innerHTML = "Pending"
    }
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

function GetSelected() {
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
                confirmationArr.push(confirmation)
            }
      };
      editStatus(confirmationArr)
};

async function editStatus(event) {
  for (let i = 0; i < event.length; i++) {
    const box_number = event[i].box_number
    var requested_date = new Date().toLocaleDateString("en-US");
    var status = event[i].status;
    console.log(status);
    if(status == 'Pending'){
        status = 1;
      } else if (status == 'Received') {
        status = 2;
      } else if (status == 'Requested') {
        status = 3;
      } else {
        status = 4
      }
    const response = await fetch(`/api/box/status_client`, {
      method: 'PUT',
      body: JSON.stringify({
          box_number,
          status,
          requested_date
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    });
  }
  alert('Status updated successfully!')
  document.location.reload();

}


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
}

// function filter(n) {
//   var input, filter, table, tr, td, i, txtValue;
//   input = document.getElementById("myInput");
//   filter = input.value.toUpperCase();
//   table = document.getElementById("myTable");
//   tr = table.getElementsByTagName("tr");

//   for (i = 0; i < tr.length; i++) {
//     td = tr[i].getElementsByTagName("td")[n];
//     if (td) {
//       txtValue = td.textContent || td.innerText;
//       if (txtValue.toUpperCase().indexOf(filter) > -1) {
//         tr[i].style.display = "";
//       } else {
//         tr[i].style.display = "none";
//       }
//     }
//   }
// }

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

//  var logo_url = "https://upload.wikimedia.org/wikipedia/commons/e/e9/Felis_silvestris_silvestris_small_gradual_decrease_of_quality.png";
//     getImgFromUrl(logo_url, function (img) {
//     generatePDF(img);
//   });

};


// function getImgFromUrl(logo_url, callback) {
//   var img = new Image();
//   img.src = logo_url;
//   img.onload = function () {
//       callback(img);
//   };
// }
// function generatePDF(img){
//   // var options = {orientation: 'p', unit: 'mm', format: custom};
//   var doc = new jsPDF();
//   doc.addImage(img, 'JPEG', 0, 0, 100, 50);
//   doc.save('good.pdf')}



// try {
//   // The return value is the canvas element
//   let canvas = bwipjs.toCanvas('mycanvas', {
//           bcid:        'code128',       // Barcode type
//           text:        '0123456789',    // Text to encode
//           scale:       3,               // 3x scaling factor
//           height:      10,              // Bar height, in millimeters
//           includetext: true,            // Show human-readable text
//           textxalign:  'center',        // Always good to set this
//       });
// } catch (e) {
//   // `e` may be a string or Error object
// }

// const options = {
//   bcid:        'code128',       // Barcode type
//   text:        '0123456789',    // Text to encode
//   scale:       3,               // 3x scaling factor
//   height:      10,              // Bar height, in millimeters
//   includetext: true,            // Show human-readable text
//   textxalign:  'center',        // Always good to set this
// };

// let canvas = document.createElement('canvas');
// try {
//     bwipjs.toCanvas(canvas, options);
//     document.getElementById('my-img').src = canvas.toDataURL('image/png');
// } catch (e) {
//     // `e` may be a string or Error object
// }

// function barcode (txt) {
//   var url = `http://bwipjs-api.metafloor.com/?bcid=code128&text=${txt}`
// };
