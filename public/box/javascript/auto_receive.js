function update() {
    var scan_item = document.getElementById('scanned_item').value;
    if (scan_item.length == 12 && scan_item[0] == 'S' && scan_item[1] == 'W') {
        auto_receive(scan_item);
        localStorage.setItem('scan_item',scan_item);
    } else if (scan_item.substring(0,2) == '1Z' || scan_item.length == 22 || scan_item.length == 12) {
        track_receive(scan_item);
    }
}


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
        list.appendChild(child);
       } else {
        document.getElementById('scanned_item').value = null;
        const list = document.getElementById("inserted_item");
        var child = document.createElement('h4');
        child.innerHTML = box_number + `&#10060`;
        list.appendChild(child);
        localStorage.clear();
       }

  }

  async function track_receive(event) {
    const box_number = localStorage.getItem('scan_item');
    if (!box_number) {
      document.getElementById('scanned_item').value = null;
      alert('Need to scan box first!')
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
      list.appendChild(child);
      localStorage.clear();
     }
    }
}
