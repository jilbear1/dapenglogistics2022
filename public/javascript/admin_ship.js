function pre_ship_scan(s3) {
    localStorage.setItem('pre-ship_item', s3);
    window.location.href = '/admin_pre_ship';
};
info(3);info(2);
async function info(n) {
    const response = await
    fetch(`/api/item/statusTWO/${n}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
       if (n == 3) {
        const requestsBatch = data.reduce(function (r, a) {
            r[a.container.custom_2] = r[a.container.custom_2] || [];
            r[a.container.custom_2].push(a);
            return r;
          }, Object.create(null));
          const requestQty = Object.values(requestsBatch);
        document.getElementById('aConfirm').innerHTML = requestQty.length;
       } else if (n == 2) {
        const requestsBatch = data.reduce(function (r, a) {
            r[a.container_id] = r[a.container_id] || [];
            r[a.container_id].push(a);
            return r;
          }, Object.create(null));
          const containers = Object.values(requestsBatch);
        document.getElementById('aRequest').innerHTML = containers.length
       }
    });
};
