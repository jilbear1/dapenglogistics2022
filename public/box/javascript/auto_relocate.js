const resetLocalStorage = () => {
    localStorage.clear();
};

const isCharacterALetter = (char) => {
    return (/[a-zA-Z]/).test(char)
};

const isCharacterASpeical = (char) => {
    return (/[-]/).test(char)
};

function location_update() {
    var scanned_obj = document.getElementById('scanned_obj').value;
    if (isCharacterALetter(scanned_obj[0]) && !isNaN(scanned_obj[1]) && isCharacterASpeical(scanned_obj)) {
        localStorage.setItem('location', scanned_obj);
        document.getElementById('scanned_obj').value = null;
    } else if (scanned_obj.length == 12 && scanned_obj[0] == 'S' && scanned_obj[1] == 'W') {
        var locatioin_barcode = localStorage.getItem('location')
        if (!locatioin_barcode) {
            document.getElementById('scanned_obj').value = null;
            alert('need to scan shelf barcode first!')
        } else {
            auto_relocate(scanned_obj, locatioin_barcode)
        }
    }
}


async function auto_relocate(box, shelf) {
    const box_number = box;
    const location_b = shelf;

    const response = await fetch(`/api/box/admin_relocating`, {
      method: 'PUT',
      body: JSON.stringify({
          box_number,
          location_b
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      document.getElementById('scanned_obj').value = null;
      const list = document.getElementById("inserted_obj");
      var child = document.createElement('h3');
      child.innerHTML = location_b + ": " + box_number + `&#9989`;
      list.appendChild(child);
     } else {
      document.getElementById('scanned_obj').value = null;
      const list = document.getElementById("inserted_obj");
      var child = document.createElement('h4');
      child.innerHTML = box_number + " does not exist!" + `&#10060`;
      list.appendChild(child);
     }

}
