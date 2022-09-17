console.log(location.href, 'main js');
var map = new Map();
function accountList() {
    document.querySelector('#accountList').querySelectorAll('option').forEach(i => i.remove())
    const newAcc = document.createElement('option');
    newAcc.innerHTML = 'Create New Account';
    document.querySelector('#accountList').appendChild(newAcc);
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

if (document.querySelector("#account_selection")) {
    document.querySelector("#account_selection").addEventListener("click", saveAccount);
};
