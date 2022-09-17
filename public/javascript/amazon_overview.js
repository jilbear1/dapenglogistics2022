var totalItemArr =[];
var totalContainerArr=[];
var skuList = document.getElementById('skuList');
const init = () => {
    fetch(`/api/item/amazonInventory`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (itemArr) {
        for (let i = 0; i < itemArr.length; i++) {
            const item = itemArr[i];
            if (!totalItemArr.includes(item.item_number)) {
                totalItemArr.push(item.item_number)
                const th = document.createElement('th');
                skuList.appendChild(th);
                th.innerHTML = item.item_number
            };
        };
        for (let k = 0; k < totalItemArr.length; k++) {
            const container = document.querySelectorAll('tbody tr');
            container.forEach(c => {
            const emptytd = document.createElement('td');
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
};
init();
const itemListing = (itemArr) => {
    const yArr = document.querySelectorAll('tbody tr');
    for (let i = 0; i < itemArr.length; i++) {
        const container_id = itemArr[i].container_id;
        const item_number = itemArr[i].item_number;
        const qty = itemArr[i].qty_per_sku;
        const x = totalItemArr.indexOf(item_number)+1;
        const y = totalContainerArr.indexOf(container_id);
        const xArr = yArr[y].querySelectorAll('td');
        xArr[x].innerHTML = qty
    }
}
