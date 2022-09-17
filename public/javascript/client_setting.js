//password update
const client_list = document.getElementById("user");//****//
const passwordTag = document.getElementById('password');
function client_data() {
    fetch(`/api/user/masterAll`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
        const user = document.createElement('option');
        user.innerHTML = data[i].name;
        user.setAttribute('value', data[i].id);
        client_list.appendChild(user)
        };
    });
};client_data();
async function proceed() {
    const password = passwordTag.querySelector('input').value.trim();
    const id = client_list.value;
    const code = prompt('Please enter the passcode to proceed the change')
    if (password && id && code == '0523') {
        const response = await fetch(`/api/user/newPassword/${id}`, {
            method: 'Post',
            body: JSON.stringify({
                password: password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert(`The password has been updated successfully to "${password}"`)
            location.reload();
        }
    } else {
        alert('Missing information or incorrect passcode!')
    }
};

//bulk archieve//
const promises = [];
const bulkSelect = document.getElementById('statusChange');
const daysPS = document.getElementById('maintenance').querySelector('input');
function proceed_archieve() {
 const statusValue = bulkSelect.value;
 const code = prompt('Please enter the passcode to proceed the change');
 const time = new Date(daysPS.value).getTime();
 const today = new Date().getTime();
 if (time && today > time && code == '0523') {
    if (statusValue == 98) {
        promises.push(chinaBoxUpdate(time))
        promises.push(amazonContainerUpdate(time))
        promises.push(emptyContainerUpdate(time))
        Promise.all(promises).then(() => {
            location.reload()
        }).catch((e) => {console.log(e)})
     } else if (statusValue == 99) {
        promises.push(chinaBoxDelete(time))
        promises.push(amazonContainerDelete(time))
        promises.push(emptyContainerDelete (time))
        Promise.all(promises).then(() => {
            location.reload()
        }).catch((e) => {console.log(e)})
    }
 } else {
     alert('The target date should not be today or future date!')
 }
};
async function chinaBoxDelete (time){
    const response = await fetch(`/api/box/remove/${time}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
       console.log('china boxes are deleted');
    }
};
async function  amazonContainerDelete (time){
    const response = await fetch(`/api/container/remove/${time}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('amazon boxes are deleted');
    }
};
async function  emptyContainerDelete (time){
    const response = await fetch(`/api/container/removeEmpty/${time}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('empty amazon boxes are deleted');
    }
};
////////update to archive////////////
async function chinaBoxUpdate (time){
    const response = await fetch(`/api/box/archieve/${time}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('china boxes are updated');
    }
};
async function  amazonContainerUpdate(time){
    const response = await fetch(`/api/container/archieve/${time}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('amazon boxes are updated');
    }
};
async function  emptyContainerUpdate(time){
    const response = await fetch(`/api/container/archieveEmpty/${time}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('empty amazon boxes are updated');
    }
};
//helper function
const bulk_box = document.getElementById('bulk_box');
const bulk_xc = document.getElementById('bulk_xc');
function switchMode () {
    if (bulk_box.style.display == '') {
        bulk_box.style.display = 'none';
        bulk_xc.style.display = '';
    } else {
        bulk_box.style.display = '';
        bulk_xc.style.display = 'none';
    }
};
//xc delete//
const xcSelect = document.getElementById('statusChange_xc');
const daysPS_xc = document.getElementById('maintenance_xc').querySelector('input');
function proceed_removal() {
    const statusValue = xcSelect.value;
    const code = prompt('Please enter the passcode to proceed the change');
    const time = new Date(daysPS_xc.value).getTime();
    const today = new Date().getTime();
    console.log(time, today);
    if (time && today > time && code == '0523') {
        if (statusValue == 99) {
           promises.push(chinaBoxDelete_xc(time));
           promises.push(amazonContainerDelete_xc(time));
           Promise.all(promises).then(() => {
                location.reload()
            }).catch((e) => {console.log(e)})
        };
    } else {
        alert('The target date should not be today or future date!')
    }
   };
   async function chinaBoxDelete_xc (time){
       const response = await fetch(`/api/box/remove_xc/${time}`, {
           method: 'DELETE',
           headers: {
               'Content-Type': 'application/json'
           }
       });
       if (response.ok) {
           console.log('XC of China boxes has beem removed!');
       }
   };
   async function  amazonContainerDelete_xc (time){
       const response = await fetch(`/api/container/remove_xc/${time}`, {
           method: 'DELETE',
           headers: {
               'Content-Type': 'application/json'
           }
       });
       if (response.ok) {
        console.log('XC of amazon boxes has beem removed!');
       }
   };
