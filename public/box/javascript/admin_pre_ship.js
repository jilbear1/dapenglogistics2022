var boxNArr = [];
const notes = document.getElementById('notes');
function boxQuery() {
    fetch(`/api/user/box`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        const s3 = localStorage.getItem('pre-ship_item');
        const boxArr = data[s3];
        notes.innerHTML = boxArr[0].file_2;
        for (let i = 0; i < boxArr.length; i++) {
        boxNArr.push(boxArr[i].box_number);
        const list = document.createElement('h3');
        list.id = boxArr[i].box_number;
        const collection = document.getElementById('inserted_item');
        list.innerHTML = `${boxArr[i].box_number} | ${boxArr[i].location}`;
        collection.appendChild(list);
        }
    });
};

boxQuery();


async function pre_check() {
    const box_number = document.getElementById('scanned_item').value;
    const status = 3;
    const shipped_date = new Date().toLocaleDateString("en-US");
    if (boxNArr.includes(box_number)) {
        const response = await fetch(`/api/box/status_admin_shipping`, {
            method: 'PUT',
            body: JSON.stringify({
                box_number,
                status,
                shipped_date
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
    } else if (box_number.length >= 12){
        document.getElementById('scanned_item').value = null;
        const wrongItem = document.createElement('h5');
        const collection = document.getElementById('inserted_item');
        wrongItem.innerHTML = `&#10060` + ` wrong box (${box_number})`;
        collection.appendChild(wrongItem);
        alert('Wrong Box!')
    }

}
