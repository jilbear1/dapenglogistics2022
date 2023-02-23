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
  const code = prompt("enrer access code to activate");
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
    event.target.innerText = "Seal AM box";
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
  const accountId = parseInt(event.target.value);
  if (accountId != NaN) {
    fetch(`/api/container/modification/${accountId}`, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((singleData) => {
        const existedTr = tbody2.getElementsByTagName("tr");
        if (existedTr.length > 0) {
          existedTr[0].remove();
        }
        console.log(singleData);
        const tr = document.createElement("tr");
        tbody2.appendChild(tr);
        const total = document.createElement("td");
        total.innerText = singleData.total;
        const postive = document.createElement("td");
        postive.innerText = singleData.postive;
        const negative = document.createElement("td");
        negative.innerText = singleData.negative;
        const ok = document.createElement("td");
        const button = document.createElement("button");
        const button2 = document.createElement("button");
        button.className = "btn btn-sm rounded bg-danger text-light";
        button2.className = "btn btn-sm rounded bg-success text-light";
        button.id = accountId;
        button2.id = accountId;
        button.addEventListener("click", function (event) {
          sealAndUnseal(event, "seal");
        });
        button2.addEventListener("click", function (event) {
          sealAndUnseal(event, "unseal");
        });
        button.innerText = "Seal";
        button2.innerText = "Unseal";
        ok.appendChild(button);
        ok.append(button2);
        const array = [total, postive, negative, ok];
        array.forEach((i) => tr.appendChild(i));
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const sealAndUnseal = async (event, action) => {
  const accountId = event.target.id;
  event.target.value = accountId;
  const res = await fetch(`/api/container/${action}/${accountId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (res.ok) {
    alert("done");
    searchAccount(event)
  } else {
    alert("nothing to " + action)
  }
};
