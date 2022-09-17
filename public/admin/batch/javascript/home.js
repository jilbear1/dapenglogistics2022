var map = new Map();
function accountList() {
    fetch(`/api/user/account`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
            const option = document.createElement('option');
            option.innerHTML = data[i].name + " (prefix: "+ data[i].prefix.toUpperCase() + ")";
            document.querySelector('#accountList').appendChild(option);
            map.set(data[i].name, data[i].id);
        }
    });
};

function saveAccount() {
    var selectedOption = document.querySelector('#accountList').value;

    if(selectedOption != 'Create New Account'){
        var accountSaved = selectedOption.split(' (prefix:');
        var prefixSaved = accountSaved[1].split(')');
        localStorage.setItem('account', accountSaved[0]);
        localStorage.setItem('prefix', prefixSaved[0]);
        localStorage.setItem('account_id', map.get(accountSaved[0]));
    } else {
        localStorage.setItem('account', selectedOption);
    }
}

document.querySelector("#account_selection").addEventListener("click", saveAccount);

function number_item () {
    var numberOfItem = document.getElementById('numberOfInventory');
    var arr =[]
    var table, tr, td, txtValue;
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[10];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue == 'Received' || txtValue == 'Requested') {
          arr.push(td)
        }
      }
    };
    numberOfItem.innerHTML = arr.length

  }
setInterval (number_item(), 1000);

document.getElementById('inventory_btn').click();
