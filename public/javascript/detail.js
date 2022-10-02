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
                image.src = `/image/${imageURL}`;
                if(data[i].status==1){
                    image.className = "img-thumbnail rounded float-left border border-success";
                }else{
                    image.className = "img-thumbnail rounded float-left";
                }
                image.style.height = '130px'
                image.setAttribute('onclick', `bigger(event)`);
                document.getElementById(`image${id}`).appendChild(image);
            }
           }
        })
    }
};
const bigger = (event) => {
    if (event.target.style.height == '400px'){
        event.target.style.height = '130px'
    } else {
        event.target.style.height = '400px';
    }
};
