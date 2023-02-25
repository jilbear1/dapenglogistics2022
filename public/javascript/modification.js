console.log("modification.js");
const tbody = document.getElementById("tbody");
const tbody2 = document.getElementById("tbody2");
var timer = null;
function delay(fn) {
  clearTimeout(timer);
  timer = setTimeout(fn, 100);
}
const search = (event) => {
  fetch(`/api/item/modification/${event.target.value}`, {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      data.forEach((skuData) => {
        makeRow(skuData);
        event.target.value = "";
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
const makeRow = (singleData) => {
  console.log(singleData);
  const tr = document.createElement("tr");
  tbody.appendChild(tr);
  const box = document.createElement("td");
  box.innerText = singleData.container.container_number;
  const item = document.createElement("td");
  item.innerText = singleData.item_number;
  const qty = document.createElement("td");
  qty.innerText = singleData.qty_per_sku;
  qty.contentEditable = true;
  const ok = document.createElement("td");
  const button = document.createElement("button");
  button.id = singleData.id;
  button.addEventListener("click", function (event) {
    const skuId = event.target.id;
    const newQty = parseInt(event.target.parentNode.previousSibling.innerText);
    if (newQty != NaN) {
      update(skuId, newQty);
      this.parentNode.innerText = "done";
      this.remove();
    }
  });
  button.innerText = "confirm";
  ok.appendChild(button);
  const array = [box, item, qty, ok];
  array.forEach((i) => tr.appendChild(i));
};
const update = async (id, qty) => {
  console.log(`SKU: ${id} has a new qty: ${qty}`);
  await fetch(`/api/item/updateQty/${id}&${qty}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
};
const activate = (event) => {
  const code = prompt("enter the access code to activate");
  if (code == "0523") {
    event.target.className = "badge badge-sm bg-success mb-2";
    event.target.innerText = "active";
    event.target.onclick = "";
    document.getElementById("switch").style.display = "";
    document.getElementById("scan_sku").disabled = false;
  }
};

const changeTable = (event) => {
  const boxTable = document.getElementById("boxTable");
  const skuTable = document.getElementById("skuTable");
  const h32 = document.getElementById("h32");
  const h31 = document.getElementById("h31");
  const skuInput = document.getElementById("scan_sku");
  const boxInput = document.getElementById("scan_box");
  const boxSearch = [boxTable, h32, boxInput];
  const skuSearch = [skuTable, h31, skuInput];
  if (boxTable.style.display == "none") {
    event.target.innerText = "Modify SP Status";
    event.target.className = "badge badge-sm bg-primary mb-2";
    boxSearch.forEach((i) => (i.style.display = ""));
    skuSearch.forEach((j) => (j.style.display = "none"));
  } else {
    event.target.className = "badge badge-sm bg-info mb-2";
    event.target.innerText = "Modify SKU Qty";
    boxSearch.forEach((i) => (i.style.display = "none"));
    skuSearch.forEach((j) => (j.style.display = ""));
  }
};

const searchAccount = (event) => {
  const existedTr = tbody2.getElementsByTagName("tr");
  if (existedTr.length > 0) {
    existedTr[0].remove();
  }
  document.getElementById("h32").innerHTML = "Account Id: ";
  const accountId = parseInt(event.target.value);
  if (!isNaN(accountId)) {
    fetch(`/api/container/modification/${accountId}`, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data != "not ok") {
          document.getElementById(
            "h32"
          ).innerHTML = `Account Id: ${accountId} <br>[${data.userData.account}], User: ${data.userData.user}`;
          for (let i = 0; i < data.array.length; i++) {
            const singleData = data.array[i];
            const tr = document.createElement("tr");
            tbody2.appendChild(tr);
            const tracking = document.createElement("td");
            tracking.innerText = singleData.tracking_info;
            const received = document.createElement("td");
            if (singleData.sealed_received > 0 || singleData.received > 0) {
              singleData.sealed_received > 0
                ? (received.className = "bg-warning")
                : null;
              received.innerHTML = `${singleData.received} / ${singleData.sealed_received}    `;
              addButtons(accountId, 1, singleData.tracking_info, received);
            }
            const requested = document.createElement("td");
            if (singleData.sealed_requested > 0 || singleData.requested > 0) {
              singleData.sealed_requested > 0
                ? (requested.className = "bg-warning")
                : null;
              requested.innerHTML = `${singleData.requested} / ${singleData.sealed_requested}    `;
              addButtons(accountId, 2, singleData.tracking_info, requested);
            }
            const array = [tracking, received, requested];
            array.forEach((i) => tr.appendChild(i));
          }
          $(document).ready(function () {
            $("#boxTable").DataTable({
              lengthMenu: [
                [25, 50, 100, -1],
                [25, 50, 100, "全部"],
              ],
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const addButtons = (accountId, status, tracking_info, parentNode) => {
  const button = document.createElement("button");
  const button2 = document.createElement("button");
  const button3 = document.createElement("button");
  button.className = "btn btn  bg-danger text-light";
  button2.className = "btn btn  bg-success text-light";
  button3.className = "btn btn  bg-info text-light";
  button.id = `${accountId}.${Math.abs(parseInt(status))}.${tracking_info}`;
  button2.id = `${accountId}.${-Math.abs(parseInt(status))}.${tracking_info}`;
  button3.id = `${accountId}.${Math.abs(parseInt(status))}.${tracking_info}`;
  button.addEventListener("click", function (event) {
    sealAndUnseal(event, "seal");
  });
  button2.addEventListener("click", function (event) {
    sealAndUnseal(event, "unseal");
  });
  button3.addEventListener("click", function (event) {
    moveStatus(event);
  });
  button.innerText = "Seal";
  button2.innerText = "Unseal";
  button3.innerText = "Move";
  parentNode.appendChild(button);
  parentNode.appendChild(button2);
  parentNode.appendChild(button3);
};

const sealAndUnseal = async (event, action) => {
  const accountId = event.target.id.split(".")[0];
  const status = event.target.id.split(".")[1];
  const tracking = event.target.id.split(".")[2];
  const res = await fetch(
    `/api/container/statusChange/${accountId}&${status}&${tracking}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (res.ok) {
    // alert("done");
    event.target.disabled = true;
    event.target.parentNode.style.textDecoration = "line-through";
  } else {
    alert("nothing to " + action);
  }
};
const moveStatus = async (event) => {
  const accountId = event.target.id.split(".")[0];
  const status = event.target.id.split(".")[1];
  const tracking = event.target.id.split(".")[2];
  const res = await fetch(
    `/api/container/statusMove/${accountId}&${status}&${tracking}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (res.ok) {
    // alert("done");
    event.target.disabled = true;
    event.target.parentNode.style.textDecoration = "line-through";
  } else {
    alert("nothing to perform");
  }
};
