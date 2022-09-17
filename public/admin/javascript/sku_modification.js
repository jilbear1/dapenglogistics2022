console.log("sku_modification.js");
const fake = document.getElementById('fake');
const uploadBtn = document.getElementById('uploadBtn');
const trigger = () => {
    const promises = [];
    const user_id = document.querySelector('select').value;
    const files = document.getElementById('label').files;
    if (user_id != 0 && files[0]) {
      uploadBtn.style.display = 'none';
      fake.style.display = '';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        promises.push(upload(file, user_id))
      };
      Promise.all(promises).then(() => {
        fake.style.display = 'none';
        document.location.reload();
      }).catch((e) => {console.log(e)})
    } else {
        alert('missing client selection or missing file! please try again')
    }
};
async function upload(file, id) {
    const ref = file.name.split('.')[0].toUpperCase().trim();
    let formData = new FormData();
    formData.append('file', file);
    formData.append('ref',ref);
    formData.append('user_id', id);
    const response = await fetch(`/api/document/upload`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      console.log(ref);
    } else {
      alert(response.statusText);
    }
};
const init = () => {
  const timeArr = document.querySelectorAll('time');
  timeArr.forEach(time => {
    time.innerText = new Date(parseInt(time.innerText)).toLocaleDateString()
  });
  if (localStorage.getItem('withAuth')) {
    document.querySelectorAll('a').forEach(a => a.style.visibility = '');
  }
};
const remove = async (id) => {
  const response = await fetch(`/api/document/remove/${id}`, {
    method: 'DELETE'
  });
  if (response.ok) {
    location.reload();
  }
};
const massRemove = async () => {
  const response = await fetch(`/api/document/massremove`, {
    method: 'DELETE'
  });
  if (response.ok) {
    location.reload();
  }
}
const withAuth = () => {
  const code = prompt('Enter passcode to activate delete function');
  if (code == '0523') {
    document.querySelectorAll('a').forEach(a => a.style.visibility = '');
    localStorage.setItem('withAuth', 'Authorized')
  } else if (code == '3250') {
    massRemove();
  } else {
    alert('Invalid code!')
  }
};
init();


///////////sku mapping////////////
const old_group = document.getElementById('oldskugroups');
const new_group = document.getElementById('newskugroups');
const fake_map = document.getElementById('fake_map');
const mapBtn = document.getElementById('mapBtn');
var oldData, newData;
var ready = false;
const formateCheck = () => {
  oldData = rs(old_group.value.trim());
  newData = rs(new_group.value.trim());
  oldData.length==newData.length&&oldData.length>0?(mapBtn.className='uk-button uk-button-primary', ready=true):(mapBtn.className='uk-button uk-button-danger', ready=false);
};
const mapping = () => {
  if (ready) {
    fake_map.style.display = '';
    mapBtn.style.display = 'none';
    const promises = [];
    const data = `${JSON.stringify(oldData+"=>"+newData)}`;
    promises.push(uploadRecord(data,oldData.length));
    Promise.all(promises).then(() => {
      fake_map.style.display = 'none';
      location.reload();
    }).catch((e) => {console.log(e)})
  } else {
    alert(`The amount of old skus should match to the amount of new skus! The error is detected [old: ${rs(old_group.value.trim()).length}, new: ${rs(new_group.value.trim()).length}]`)
  }
};
//helper function
const rs = (str) => {
  if (str) {
    if (str[str.length-1]==',') {
      str = str.substring(0,str.length-1);
      return str.replace(/\s/g, '').trim().split(',')
    }
    return str.replace(/\s/g, '').trim().split(',')
  } return [];
};//remove space

const uploadRecord = async (data, length) => {
  const ref_number = `SKU MAPPING`;
  const sub_number = new Date().valueOf();
  const qty_to = length;
  const type = 50;
  const date = new Date().toISOString().split('T')[0];
  const action = `Admin Mapped SKU (${length} skus linked)`;
  const action_notes = data;
  const response = await fetch(`/api/record/record_create_client`, {
    method: 'POST',
    body: JSON.stringify({
      ref_number,
      sub_number,
      qty_to,
      type,
      date,
      action,
      action_notes
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    console.log(`successfully insert record = ${data}`);
  }
}
