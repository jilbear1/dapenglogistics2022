//  1. client input an am box number or china box
// 2. validate if am box exist, if so, list items next to it
//a. validate am box exits and get the container id (GET)
//b. search all items associated with that container id (GET)
// 3. after listing a list of am box-to-be-empty, press confirm removing items
// 4. iterate each am box's item id from the list, delete one after another (DELETE)
// 5. re-validate the database (item table) to ensure the collected am boxes are now free
//  from any item (GET)
// 6. ready to label those empty box to status of shipped (PUT)
// 7. option to clear out orphan items.(DELETE)
// 8. option to permantly remove eligibel china and am boxes (DELETE)

var timer = null;
function delay(fn) {
  clearTimeout(timer);
  timer = setTimeout(fn, 100);
}

const container_Collection = new Map();
const box_Collection = new Map();
const item_Collection = new Map();

const inputValidation = () => {
  const scannedBox = scanned_item.value.trim().toUpperCase();
  if (scannedBox.substring(0, 2) === "AM" && scannedBox.length === 8) {
    fetch(`/api/container/amazon_container/${scannedBox}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          container_Collection.set(scannedBox, data.id);
        } else {
          alert(
            `Invalid entry: Cannot find the container number "${scannedBox}" in the database.`
          );
        }
      })
      .catch((error) => console.error("Error fetching container data:", error));
  } else if (scannedBox.length > 4) {
    fetch(`/api/box/boxDataUsingNumber/${scannedBox}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          box_Collection.set(scannedBox, data.id);
        } else {
          alert(
            `Invalid entry: Cannot find the box number "${scannedBox}" in the database.`
          );
        }
      })
      .catch((error) => console.error("Error fetching box data:", error));
  } else {
    alert("Invalid entry format. Please check your input and try again.");
  }
};

const removeFromCollections = (number) => {
  let removed = false;
  if (box_Collection.has(number)) {
    box_Collection.delete(number);
    console.log(`Removed number "${number}" from box_Collection.`);
    removed = true;
  } else if (container_Collection.has(number)) {
    container_Collection.delete(number);
    console.log(`Removed number "${number}" from container_Collection.`);
    item_Collection.delete(number);
    removed = true;
  } else {
    console.log(`Key "${number}" was not found in either collection.`);
  }
};

const findAllItemsPerContainer = (container_number) => {
  fetch(
    `/api/item/findAllPerContainer/${container_Collection.get(
      container_number
    )}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length) {
        item_Collection.set(container_number, data)
      } else {
      }
    })
    .catch((error) => console.error("Error fetching item data:", error));
};
//-------------------------------------


const shipped_date_labeling = () => {
  var masterContainerIdArr = [...container_Collection.values()];
  const shipped_date = new Date().toLocaleDateString("en-US");
  fetch(
    `/api/item/emptyContainerSearch/${JSON.stringify(masterContainerIdArr)}`,
    {
      method: "GET",
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (let r = 0; r < data.length; r++) {
        const containerId = data[r].container_id;
        masterContainerIdArr = masterContainerIdArr.filter(
          (i) => i != containerId
        );
      }
      if (masterContainerIdArr.length) {
        const shippedPromises = [];
        shippedPromises.push(
          updateShippedDate(masterContainerIdArr, shipped_date)
        );
        Promise.all(shippedPromises)
          .then(() => {
            onsole.log("change empty box to shipped status! :)");
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        console.log("no empty box! :)");
      }
    });
};

async function removeItemsFromContainers(idArray) {
  if (!Array.isArray(idArray) || idArray.length === 0) {
    console.log("Invalid container ID array provided.");
    return;
  }

  try {
    const response = await fetch(`/api/item/removeFromContainers/`, {
      method: "DELETE",
      body: JSON.stringify({ container_id: idArray }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(`Successfully cleared all items from containers: ${idArray}`);
    } else {
      const errorMessage = await response.text();
      console.error(`Failed to update. Server responded with: ${errorMessage}`);
    }
  } catch (error) {
    console.error("An error occurred while making the request:", error);
  }
}

const updateShippedDate = async (idArray, shipped_date) => {
  const response = await fetch(`/api/container/shipped_date_labeling`, {
    method: "PUT",
    body: JSON.stringify({
      shipped_date: shipped_date,
      id: idArray,
    }),
    headers: { "Content-Type": "application/json" },
  });
  response.ok
    ? console.log(`updated the ending date to boxes: ${idArray}`)
    : console.log("failed to update");
};
