var boxNArr = [];
const boxArrMap = new Map();
const notes = document.getElementById('notes');
function boxQuery() {
    fetch(`/api/user/box`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        const s3 = localStorage.getItem('pre-ship_item');
        const fba = document.getElementById('fba');
        const boxArr = data[s3];
        if(!boxArr) {
            alert('Admin mannually changed the status! client has not requested those boxes yet')
        };
        fba.innerHTML = boxArr[0].fba;
        if (!boxArr[0].notes) {
            notes.innerHTML = "N/A";
        } else {
            notes.innerHTML = boxArr[0].notes;
        };
        for (let i = 0; i < boxArr.length; i++) {
        boxArrMap.set(boxArr[i].box_number, boxArr[i]);
        boxNArr.push(boxArr[i].box_number);
        const list = document.createElement('h3');
        list.id = boxArr[i].box_number;
        const collection = document.getElementById('inserted_item');
        list.innerHTML = `${boxArr[i].box_number} | ${boxArr[i].location}`;
        collection.appendChild(list);
        };
    });
};boxQuery();
function pre_check() {
    const box_number = document.getElementById('scanned_item').value.toUpperCase().trim();
    const status = 3;
    const location = null;
    const shipped_date = new Date().toLocaleDateString("en-US");
    const promises = [];
    if (boxNArr.includes(box_number)) {
        promises.push(record_action(box_number))
        Promise.all(promises).then(() => {
            put_action(box_number, status, location, shipped_date);
        }).catch((e) => {console.log(e)})
    } else {
        error();
        document.getElementById('scanned_item').value = null;
        const wrongItem = document.createElement('h5');
        const collection = document.getElementById('inserted_item');
        wrongItem.innerHTML = `&#10060` + ` wrong box (${box_number})`;
        collection.appendChild(wrongItem);
    }
};
const urlMessage = (key_number) => {
    var fileURL = 'File URLs: ';
    if (boxArrMap.get(key_number).file) {
        fileURL += `${boxArrMap.get(key_number).file}, `;
    }
    if (boxArrMap.get(key_number).file_2) {
        fileURL+= `${boxArrMap.get(key_number).file_2}, `;
    }
    if (!boxArrMap.get(key_number).file_2 && !boxArrMap.get(key_number).file) {
        fileURL = "No File"
    }
    return fileURL
}
const put_action = async (box_number, status, location, shipped_date) => {
    const response = await fetch(`/api/box/status_admin_shipping`, {
        method: 'PUT',
        body: JSON.stringify({
            box_number,
            status,
            shipped_date,
            location
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) {
        document.getElementById('scanned_item').value = null;
        const box_numberTag = document.getElementById(box_number);
        // box_numberTag.setAttribute('uk-icon', 'check');
        box_numberTag.style.display = 'none';
        boxNArr = boxNArr.filter(i => i != box_number);
       if (!boxNArr.length) {
            alert('complete!');
            window.location.href = '/admin_move_main';
        }
    };
}

var timer = null;
function delay(fn){
    clearTimeout(timer);
    timer = setTimeout(fn, 50)
};

function error() {
    var audio = new Audio('../media/wrong.mp3');
    audio.play();
};


/**
 * AM = 1
 * Req = 11;
 * Req reverse = 10
 * SP = 12;
 * SP create = 121
 * SP reverse
 * SP final confirm = 129;
 * China = 0 (create and request);
 * China Confirm  = -100;
 * Mapping = 50
 * */
const record_action = async (key_number) => {
    var boxesPerRequest = 'This Request Contains: ';
    for (let a = 0; a < boxNArr.length; a++) {
        boxesPerRequest += `${boxNArr[a]}, `;
    }
    const user_id = boxArrMap.get(key_number).user.id;
    const ref_number = key_number;
    const status_from = 2;
    const status_to = 3;
    const action = `Admin Confirmed China Box (for Acct: ${boxArrMap.get(key_number).account.name})`;
    const action_notes = boxesPerRequest + " :: " + urlMessage(key_number);
    const type = -100;
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/record/record_create`, {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        ref_number,
        status_to,
        status_from,
        action,
        action_notes,
        type,
        date
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    });
};
