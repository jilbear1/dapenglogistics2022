console.log("modification.js");
const tbody = document.getElementById("tbody");
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
    event.target.innerText = "Archive BOX";
    event.target.className = "badge badge-sm bg-primary mb-2";
    boxSearch.forEach((i) => (i.style.display = ""));
    skuSearch.forEach((j) => (j.style.display = "none"));
  } else {
    event.target.className = "badge badge-sm bg-info mb-2";
    event.target.innerText = "Modify SKU qty";
    boxSearch.forEach((i) => (i.style.display = "none"));
    skuSearch.forEach((j) => (j.style.display = ""));
  }
};

const searchUsingDescription = (event) => {};
