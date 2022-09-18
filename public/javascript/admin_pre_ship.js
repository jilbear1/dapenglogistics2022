var boxNArr = [];
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
        boxNArr.push(boxArr[i].box_number);
        const list = document.createElement('h3');
        list.id = boxArr[i].box_number;
        const collection = document.getElementById('inserted_item');
        list.innerHTML = `${boxArr[i].box_number} | ${boxArr[i].location}`;
        collection.appendChild(list);
        }
    });
};boxQuery();
async function pre_check() {
    const box_number = document.getElementById('scanned_item').value.toUpperCase();
    const status = 3;
    const location = null;
    const shipped_date = new Date().toLocaleDateString("en-US");
    if (boxNArr.includes(box_number)) {
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
            alert('complete!')
            window.location.href = '/admin_move_main';
        }
        };
    } else {
        error();
        document.getElementById('scanned_item').value = null;
        const wrongItem = document.createElement('h5');
        const collection = document.getElementById('inserted_item');
        wrongItem.innerHTML = `&#10060` + ` wrong box (${box_number})`;
        collection.appendChild(wrongItem);
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
