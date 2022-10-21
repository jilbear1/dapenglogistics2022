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
    var scanned_obj = document.getElementById('scanned_obj').value.trim().toUpperCase();
    if (isCharacterALetter(scanned_obj[0]) && !isNaN(scanned_obj[1]) && isCharacterASpeical(scanned_obj) && scanned_obj.length > 3) {
        localStorage.setItem('location', scanned_obj);
        document.getElementById('scanned_obj').value = null;
    } else if ((scanned_obj.length > 10 && scanned_obj.substring(0,2) == 'SW' && scanned_obj.length < 16) || (scanned_obj[scanned_obj.length-1] == '*' && scanned_obj.length > 5) || (scanned_obj.length > 7 && (scanned_obj.substring(0,2) == 'AM' || scanned_obj.substring(0,2) == 'SP'))) {
        var locatioin_barcode = localStorage.getItem('location')
        if (!locatioin_barcode) {
            error();
            document.getElementById('scanned_obj').value = null;
            const list = document.getElementById("inserted_obj");
            var child = document.createElement('h4');
            child.setAttribute('class','text-danger');
            child.innerHTML = "Need to scan shelf barcode first!";
            list.prepend(child);
        } else {
            if (scanned_obj.substring(0,2) == 'AM' || scanned_obj.substring(0,2) == 'SP') {
                amazon_relocate(scanned_obj, locatioin_barcode)
            } else {
                auto_relocate(scanned_obj, locatioin_barcode)
            }
        }
    } else if (scanned_obj.length > 15) {
        error();
        document.getElementById('scanned_obj').value = null
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
      list.prepend(child);
     } else {
      error();
      document.getElementById('scanned_obj').value = null;
      const list = document.getElementById("inserted_obj");
      var child = document.createElement('h4');
      child.innerHTML = box_number + " does not exist!" + `&#10060`;
      list.prepend(child);
     }

};

async function amazon_relocate(box, shelf) {
    const container_number = box;
    const location_b = shelf;

    const response = await fetch(`/api/container/admin_relocating`, {
      method: 'PUT',
      body: JSON.stringify({
          container_number,
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
      child.innerHTML = location_b + ": " + container_number + `&#9989`;
      list.prepend(child);
     } else {
      error();
      document.getElementById('scanned_obj').value = null;
      const list = document.getElementById("inserted_obj");
      var child = document.createElement('h4');
      child.innerHTML = container_number + " does not exist!" + `&#10060`;
      list.prepend(child);
     }

};

var timer = null;
function delay(fn){
    clearTimeout(timer);
    timer = setTimeout(fn, 50)
}

function error() {
    var audio = new Audio('../media/wrong.mp3');
    audio.play();
};
