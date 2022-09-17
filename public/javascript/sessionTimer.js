// {{!-- <script>
//     console.log('The timer is initiated for 30 minutes.');
//     $(document).ready(function() {
//         checkActivity(1800000, 60000, 0); // timeout = 30 minutes, interval = 1 minute.
//     });

//     function checkActivity(timeout, interval, elapsed) {
//         if (elapsed < timeout) {
//             const lastMinute = (timeout - elapsed);
//             elapsed += interval;
//             setTimeout(function() {
//                 checkActivity(timeout, interval, elapsed);
//             }, interval);
//             console.log(lastMinute/interval);
//             if(lastMinute == interval) {
//                 if(confirm('页面将在50秒后自动跳转，如果仍在使用此页面，请按ok。Still using the page? If so, please press OK. Otherwise, the session will expire in 50 seconds.')) {
//                     const promisesForAction = [];
//                     promisesForAction.push(serverGoAround());
//                     Promise.all(promisesForAction).then(() => {
//                         timeout = 1800000 - interval;
//                         elapsed = 0;
//                         console.log('The timer is reset back to 30 minutes.');
//                         console.log((timeout + interval)/interval);
//                     }).catch((e) => {console.log(e)})
//                 } else {
//                     document.getElementById('session_timer').innerHTML = `<div class='text-danger text-center'>页面将在50秒之后跳转。<br>The session expires in 50 seconds.</div>`
//                 }
//             }
//         } else {
//         // Redirect to "session expired" page. --}}
//            window.location.reload();
//         }
//     };
//     async function serverGoAround() {
//         const response = await fetch(`/api/user/serverGoAround`, {
//         method: 'GET'
//         }).then(function (response) {
//         return response.json();
//         })
//     };
// </script> --}}
