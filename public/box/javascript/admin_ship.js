function pre_ship_scan(custom_1) {
    console.log(custom_1);
    localStorage.setItem('pre-ship_item', custom_1);
    window.location.href = '/admin_pre_ship';
}
