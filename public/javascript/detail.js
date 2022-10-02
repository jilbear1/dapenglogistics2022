console.log("detail.js");
var fake, uploadBtn;
const trigger = (detail_id, user_id) => {
    fake = document.getElementById(`fake${detail_id}`);
    uploadBtn = document.getElementById(`uploadBtn${detail_id}`);
    const promises = [];
    const files = document.getElementById(`detailImages${detail_id}`).files;
    if (files[0]) {
      uploadBtn.style.display = 'none';
      fake.style.display = '';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        promises.push(upload(file, user_id, detail_id))
      };
      Promise.all(promises).then(() => {
        fake.style.display = 'none';
        document.location.reload();
      }).catch((e) => {console.log(e)})
    } else {
        alert('missing file! please try again')
    }
};
async function upload(file, id, detail_id) {
    const ref = detail_id;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('ref',ref);
    formData.append('user_id', id);
    const response = await fetch(`/api/document/uploadDetailImage`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      console.log(ref);
    } else {
      alert(response.statusText);
    }
};
const imageFetch = async (id) => {
    if (!document.getElementById(`image${id}`).querySelectorAll('img').length) {
        await fetch(`/api/document/getDetailImages/${id}`, {
            method: 'GET'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
           if(data.length>0){
            console.log('yes, there are some images');
            for (let i = 0; i < data.length; i++) {
                const imageURL = data[i].file;
                const image = document.createElement('img');
                const div = document.createElement('span');
                const span = document.createElement('a');
                image.src = `/image/${imageURL}`;
                if(data[i].status==1){
                    image.className = "img-thumbnail rounded float-left border border-success";
                }else{
                    image.className = "img-thumbnail rounded float-left";
                }
                image.style.height = '130px'
                image.setAttribute('onclick', `bigger(event)`);
                span.setAttribute('uk-icon', 'trash');
                span.className = 'text-danger rounded-circle border border-outline-danger';
                span.style.display = 'none';
                span.setAttribute('onclick', `removeImage(${data[i].id}, event)`);
                div.appendChild(image);
                div.appendChild(span)
                document.getElementById(`image${id}`).appendChild(div);
            }
           }
        })
    };
    // next(id);
};
const bigger = (event) => {
    if (event.target.style.height == '400px'){
        event.target.style.height = '130px';
        event.target.nextSibling.style.display = 'none';
    } else {
        event.target.style.height = '400px';
        event.target.nextSibling.style.display = ''
    }
};
const removeImage = async (id, evt) => {
    const response = await fetch(`/api/document/remove/${id}`, {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
        location.reload();
        // evt.target.parentElement.parentElement.querySelector('img').remove();
        // evt.target.parentElement.parentElement.querySelector('a').remove();
    } else {
        alert('您没有删除此照片的权限')
    }
}

if (location.href.split('detail_')[1] == 'dress') {
    document.getElementsByTagName('td').length<1?location.href = '/detail_return':document.getElementById('detail_dress_btn').className='border border-primary p-2'
} else if (location.href.split('detail_')[1] == 'return') {
    document.getElementsByTagName('td').length<1?location.href = '/detail_dress':document.getElementById('detail_return_btn').className='border border-primary p-2'
};
var message;
if(location.href.split('detail_')[1] == 'dress'){
    message="礼服清单页面 (Dress Page)";
} else {
    message="退货清单页面 (Return Page)"
}
UIkit.notification({
    message: message,
    status: 'primary',
    pos: 'top-right',
    timeout: 3000
});

// const group = document.querySelectorAll('.modalGroup');
// const next = (id) => {
//     for (let i = 0; i < group.length; i++) {
//         const element = group[i].id.split('_')[1];
//         if (element == id) {
//             const aTag = document.getElementById(`jumper${id}`).getElementsByTagName('a')[1];
//             const aTag_2 = document.getElementById(`jumper${id}`).getElementsByTagName('a')[0];
//             if (!group[i++]) {
//                 aTag.href = `#detail_${group[0].id.split('_')[1]}`;
//                 imageFetch(group[0].id.split('_')[1]);
//             } else {
//                 aTag.href = `#detail_${group[i++].id.split('_')[1]}`;
//                 imageFetch(group[i++].id.split('_')[1]);
//             }
//             if (!group[i--]) {
//                 aTag_2.href = `#detail_${group[group.length--].id.split('_')[1]}`;
//                 imageFetch(group[group.length--].id.split('_')[1]);
//             } else {
//                 aTag_2.href = `#detail_${group[i--].id.split('_')[1]}`;
//                 imageFetch(group[i--].id.split('_')[1]);
//             }
//             break;
//         }
//     }
// }
