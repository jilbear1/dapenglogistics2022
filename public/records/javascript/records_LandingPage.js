console.log(location.href, 'records_LandingPage.js');
const url = location.href.split('/');
var targetedNumber = url[url.length-1];
if (targetedNumber.includes("%")) {
    targetedNumber = targetedNumber.split("%")[0];
}
UIkit.notification({
    message: targetedNumber,
    status: 'primary',
    pos: 'top-right',
    timeout: 60000
});

const searchBtn = () => {
    const input = document.getElementById("keyWordSearch").value;
    input == null?alert('Cannot search with an empty input!'):location.replace(`../records/${input}`);
}
