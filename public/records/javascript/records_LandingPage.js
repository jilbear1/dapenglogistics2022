console.log(location.href, 'records_LandingPage.js');
const url = location.href.split('/');
var targetedNumber = url[url.length-1].toUpperCase();
if (targetedNumber.includes("%")) {
    targetedNumber = targetedNumber.split("%")[0].toUpperCase();
};
const searchBtn = () => {
    const input = document.getElementById("keyWordSearch").value;
    input == null?alert('Cannot search with an empty input!'):location.replace(`../records/${input}`);
};
const target_data = (target_number) => {
    var isSP = false;
    var type = "container";
    if (targetedNumber.substring(0,2) == "SP") {
       isSP = true;
    } else if (targetedNumber.substring(0,2) == "RE" || targetedNumber.substring(0,2) == "TE" || targetedNumber.substring(0,2) == "AM" || targetedNumber.substring(0,2) == "AC") {} else {
       type = "box"
    }
    dataFetch(target_number, isSP, type);
};
const dataFetch = (target_number, isSP, type) => {
    fetch(`/api/${type}/boxDataUsingNumber/${target_number}`, {
        method: 'GET'
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        message(data.status, isSP);
    });
};
const message = (key, isSP) => {
    let message = null;
    switch (key) {
        case 0:
            message = "Pending"
            break;
        case 1:
            isSP?message = "Waiting for client confirmation":message ="Received"
            break;
        case 2:
            isSP?message = "Waiting for admin confirmation":message="Requested"
            break;
        case 3:
            message = "Completed"
            break;
        case 4:
            message = "Relabel Charge"
            break;
        case 5:
            message = "Charge Billed"
            break;
        case 98:
            message = "Archived"
            break;
        default:
            message = "Not Available"
            break;
    }
    UIkit.notification({
        message: `${targetedNumber}<hr>${message}`,
        status: 'primary',
        pos: 'top-right',
        timeout: 60000
    });
};
target_data(targetedNumber);
