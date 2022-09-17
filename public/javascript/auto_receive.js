function update() {
    var scan_item = document.getElementById('scanned_item').value.toUpperCase();
    if (scan_item.length > 10 && scan_item.substring(0,2) == 'SW') {
        auto_receive(scan_item);
        localStorage.setItem('scan_item',scan_item);
    } else if ((scan_item.substring(0,2) == '1Z' || scan_item.length == 22 || scan_item.length == 12) && scan_item.substring(0,2) != 'SW') {
        track_receive(scan_item);
    } else if (scan_item.length > 12 && scan_item.length < 22 || scan_item.length > 22) {
      error();
      document.getElementById('scanned_item').value = null
    }
};
async function auto_receive(event) {
  const box_number = event;
  const status = 1;
  const received_date = new Date().toLocaleDateString("en-US");

  const response = await fetch(`/api/box/status_admin_receiving`, {
    method: 'PUT',
    body: JSON.stringify({
        box_number,
        status,
        received_date
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    document.getElementById('scanned_item').value = null;
    const list = document.getElementById("inserted_item");
    var child = document.createElement('h3');
    child.innerHTML = box_number + `&#9989`;
    list.prepend(child);
   } else {
    error();
    document.getElementById('scanned_item').value = null;
    const list = document.getElementById("inserted_item");
    var child = document.createElement('h4');
    child.innerHTML = box_number + `&#10060`;
    list.prepend(child);
    localStorage.clear();
   }
};
async function track_receive(event) {
    const box_number = localStorage.getItem('scan_item');
    if (!box_number) {
      error();
      document.getElementById('scanned_item').value = null;
      const list = document.getElementById("inserted_item");
      var child = document.createElement('h3');
      child.setAttribute('class','text-danger');
      child.innerHTML = 'Need to scan box first before scanning tracking number'
      list.prepend(child);
    } else {
    const tracking = event
    const response = await fetch(`/api/box/status_admin_receiving_t`, {
      method: 'PUT',
      body: JSON.stringify({
          box_number,
          tracking
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      document.getElementById('scanned_item').value = null;
      const list = document.getElementById("inserted_item");
      var child = document.createElement('h3');
      child.innerHTML = tracking + ' attached with ' + box_number + `&#9989`;
      list.prepend(child);
      localStorage.clear();
     }
    }
};
var timer = null;
function delay(fn){
    clearTimeout(timer);
    timer = setTimeout(fn, 50)
};
function error() {
  var audio = new Audio('../media/wrong.mp3');
  audio.play();
};

// const record = async (number, user) => {
//   const user_id = user;
//   const ref_number = number;
//   const status_from = 0;
//   const status_to = 1;
//   const received_date = new Date().toISOString().split('T')[0];
//   const action = 'Receiving'
//   const response = await fetch(`/api/record/receiving_china`, {
//     method: 'POST',
//     body: JSON.stringify({
//       user_id,
//       ref_number,
//       status_from,
//       status_to,
//       received_date,
//       action
//     }),
//     headers: {
//         'Content-Type': 'application/json'
//     }
//   });
// }
