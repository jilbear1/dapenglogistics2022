console.log('delete_queue_admin.js');
const aTagArr = document.querySelectorAll('tbody a');
const table = document.querySelector('table');
const rows = table.rows;
for (let i = 1; i < rows.length; i++) {
    const china_or_amazon = rows[i].cells[0].getAttribute('class');
    const box_number = rows[i].cells[1].innerText;
    const requested_items = aTagArr[i-1].innerText;
    const amazon_or_sku = requested_items.substring(0,2);
    if (china_or_amazon == 'text-danger') {
      const chinaAPI = `chinabox&${box_number}&${requested_items.split(',').join('-x-')}`;
      aTagArr[i-1].href = `/dq_handle_admin/${chinaAPI}`;
      rows[i].querySelector('button').setAttribute('onclick',`reversal('c','${requested_items}','${box_number}')`);
    } else if (amazon_or_sku == 'AM' && !alphaChecker(requested_items)) {
      const amazonAPI = `container&${box_number}&${requested_items.split(',').join('-x-')}`;
      aTagArr[i-1].href = `/dq_handle_admin/${amazonAPI}`;
      rows[i].querySelector('button').setAttribute('onclick',`reversal('a','${requested_items}','${box_number}')`);
    } else {
      if (requested_items.substring(0,19) == 'AM Relabel Services') {
        const relabelAPI = `container&${box_number}&${requested_items.split(',').join('-x-')}`;
        aTagArr[i-1].href = `/dq_handle_admin/${relabelAPI}`;
        rows[i].querySelector('button').setAttribute('onclick',`reversal('l', null,'${box_number}')`);
      } else {
        const skuAPI = `sku&${box_number}&${requested_items.split(',').join('-x-')}`;
        aTagArr[i-1].href = `/dq_handle_admin/${skuAPI}`;
        rows[i].querySelector('button').setAttribute('onclick',`reversal('s','${requested_items}','${box_number}')`);
      }
    }
};
function alphaChecker(string) {
    string = string.split(',');
    return (/[a-zA-Z]/).test(string[0].substring(2,string[0].length))
};

///reversal function///
function reversal(code, string, ref_number) {
  const promises = [];
  if(code != "l") {
    const arr = string.split(',');
    arr.forEach(i => promises.push(reverseReq(code,i)))
  }
  promises.push(removeXC(code, ref_number))
  Promise.all(promises).then(() => {
      location.reload();
  }).catch((e) => {console.log(e)})
};
const removeXC = async (code, ref_number) => {
    if (code == 'c') {
        const response = await fetch(`/api/box/removebynumber/${ref_number}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            console.log(`boxes associated with ${ref_number} is reversed back to status 1!`)
          } else {
            alert('try again')
        }
    } else {
        const response = await fetch(`/api/container/removebynumber/${ref_number}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            console.log(`items associated with ${ref_number} is reversed back to status 1!`)
          } else {
            alert('try again')
        }
    }
};
const reverseReq = async (code, eachNumber) => {
    if (code == 'c') {
        const response = await fetch(`/api/box/reversal_archive/${eachNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            console.log(`${eachNumber} is reversed back to status 1!`)
          } else {
            alert(`fail to reverse ${eachNumber}`)
        }
    } else if (code == 'a') {
        const response = await fetch(`/api/container/reversal_archive/${eachNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            console.log(`${eachNumber} is reversed back to status 1!`)
          } else {
            alert(`fail to reverse ${eachNumber}`)
        }
    } else if (code == 's') {
        const response = await fetch(`/api/item/reversal_archive/${eachNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            console.log(`${eachNumber} is reversed back to status 1!`)
          } else {
            alert(`fail to reverse ${eachNumber}`)
        }
    }
};
