const webLocation = location.href.split('/');
var account_id = parseInt(webLocation[webLocation.length-1]);
if (account_id == NaN) {
    account_id = null;
};
var totalItemArr =[];
var totalContainerArr=[];
var skuList = document.getElementById('skuList');
const init = () => {
    fetch(`/api/item/amazonInventory`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (itemArr) {
        var count = 0;
        for (let i = 0; i < itemArr.length; i++) {
            const item = itemArr[i];
            if (!totalItemArr.includes(item.item_number) && mainOrIndividual(item.account_id)) {
                count++
                totalItemArr.push(item.item_number)
                const th = document.createElement('th');
                th.setAttribute('class','text-dark shadow-sm text-center');
                th.setAttribute('onclick', `sortTable(${count})`);
                skuList.appendChild(th);
                th.innerHTML = item.item_number
            };
        };
        for (let k = 0; k < totalItemArr.length; k++) {
            const container = document.querySelectorAll('tbody tr');
            container.forEach(c => {
            const emptytd = document.createElement('td');
            emptytd.setAttribute('class','col-1')
            c.appendChild(emptytd);
            })
        };
        const containers = document.querySelectorAll('tbody b');
        for (let j = 0; j < containers.length; j++) {
            const container_id = parseInt(containers[j].getAttribute('id'));
            totalContainerArr.push(container_id)
        };
        itemListing(itemArr)
    })
};init();
const itemListing = (itemArr) => {
    const yArr = document.querySelectorAll('tbody tr');
    for (let i = 0; i < itemArr.length; i++) {
        const container_id = itemArr[i].container_id;
        const item_number = itemArr[i].item_number;
        const qty = itemArr[i].qty_per_sku;
        const x = totalItemArr.indexOf(item_number)+1;
        const y = totalContainerArr.indexOf(container_id);
        if (yArr[y]) {
            const xArr = yArr[y].querySelectorAll('td');
            xArr[x].setAttribute('class','bg-light shadow-sm text-center')
            xArr[x].innerHTML = qty
        }
    }
};

//helper function
const mainOrIndividual = (itemAccountId) => {
    if (!account_id) {
        return true
    } else if (account_id == itemAccountId) {
        return true
    } else {
        return false
    }
};
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("myTable");
    switching = true;
    dir = "asc";
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
};
