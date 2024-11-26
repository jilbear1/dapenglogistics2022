//  1. client input a container number or a box number, delay function is triggered upon key up, inside the delay() the parameter is the function - inputValidation.
// 2. validate if the container/ box exists, if so, display the container/ box number. if it's a container, fetch its associated items and list items next to it
//2.5 user has choice to remove one or more listed container(s) or box(s)
// 3. after listing a list of  container/ box-to-be-empty, press confirm removing all items from each container
// 4. iterate each container's items' ids from the list, delete in bulk(DELETE)
// 5. re-validate the database (item table) to ensure the collected containers are now free
//  from any item (GET)
// 6. ready to label those empty container and china box to status of shipped (PUT)
// 7. option to clear out orphan items.(DELETE)***
// 8. option to permantly remove eligibel china and am boxes (DELETE)
console.log(".../public/javascript/container_box_management.js");

// Timer for debouncing user input
let timer = null;

// Delay function to handle input debouncing
function delay(fn) {
  clearTimeout(timer);
  timer = setTimeout(fn, 900); // Waits 100ms after the last keypress
}

// Function to remove an item from the list
function removeItem(button) {
  var box = button.closest("li"); // Find the list item (li) element
  const boxNumber = box.firstChild.textContent.trim();
  console.log(boxNumber);
  removeFromCollections(boxNumber);
  box.remove(); // Remove the item from the list
}

// Collections for containers, boxes, and items
const container_Collection = new Map();
const box_Collection = new Map();
const item_Collection = new Map();

/**
 * Validates user input for a container or box number.
 * If valid, fetches the data and updates the respective collection.
 */
const containerList = document.getElementById("containerList");
const boxList = document.getElementById("boxList");
const itemList = document.getElementById("itemList");
const inputValidation = () => {
  console.log("validating...");
  const scannedBox = scanned_item.value.trim().toUpperCase();
  // Validate container
  if (scannedBox.substring(0, 2) === "AM" && scannedBox.length === 8) {
    fetch(`/api/container/amazon_container/${scannedBox}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (data.id && !data.shipped_date) {
          if (!container_Collection.has(scannedBox)) {
            container_Collection.set(scannedBox, data.id);
            generateLiBox(scannedBox, containerList);
            findAllItemsPerContainer(scannedBox);
          } else {
            console.log(`The container "${scannedBox}" is already in the list`);
            triggerShake(scanned_item);
          }
        } else {
          alert(
            `Invalid entry: Cannot find the container "${scannedBox}" in the database, or it's already in the empty condition.`
          );
          triggerShake(scanned_item);
        }
      })
      .catch((error) => console.error("Error fetching container data:", error));

    // Validate box
  } else if (scannedBox.length > 4) {
    fetch(`/api/box/boxDataUsingNumber/${scannedBox}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (data.id && data.status < 3) {
          if (!box_Collection.has(scannedBox)) {
            box_Collection.set(scannedBox, data.id);
            generateLiBox(scannedBox, boxList);
          } else {
            console.log(`The box "${scannedBox}" is already in the list`);
            triggerShake(scanned_item);
          }
        } else {
          alert(
            `Invalid entry: Cannot find the box "${scannedBox}" in the database, or it's already in shipped status.`
          );
          triggerShake(scanned_item);
        }
      })
      .catch((error) => console.error("Error fetching box data:", error));

    // Invalid format
  } else {
    console.log("Invalid entry format. Please check your input and try again.");
    triggerShake(scanned_item);
  }
  scanned_item.value = "";
};

const triggerShake = (element) => {
  element.classList.add("shake"); // Add the shake class
  setTimeout(() => {
    element.classList.remove("shake"); // Remove the class after the animation
    element.value = ""; // Optionally clear the input field
  }, 300); // Match the duration of the animation
};

const generateLiBox = (box_number, list) => {
  const listBox = document.createElement("li");
  listBox.className =
    "list-group-item d-flex justify-content-between align-items-center"; // Add classes
  listBox.innerHTML = `
${box_number}
<button class="badge bg-danger badge-sm" onclick="removeItem(this)">x</button>
`;
  list.appendChild(listBox);
};

const generateLiItems = (itemDataset, container_number) => {
  var itemArry = `<h5>${container_number}</h5><br>`;
  const listItem = document.createElement("li");
  listItem.className = `list-group-item ${container_number}`;
  itemDataset.forEach((item) => {
    itemArry += `${item.item_number} (#${item.qty_per_sku}), `; // Add classes
  });
  listItem.innerHTML = itemArry;
  itemList.appendChild(listItem);
};

/**
 * Removes an entry from container or box collections.
 */
const removeFromCollections = (number) => {
  if (box_Collection.delete(number)) {
    console.log(`Removed number "${number}" from box_Collection.`);
  } else if (container_Collection.delete(number)) {
    console.log(`Removed number "${number}" from container_Collection.`);
    item_Collection.delete(number); // Clear associated items
    document.querySelectorAll(`.${number}`).forEach((element) => {
      element.remove(); // Remove each element
    });
  } else {
    console.log(`Key "${number}" was not found in either collection.`);
  }
};

/**
 * Fetches all items for a given container and updates the item collection.
 */
const findAllItemsPerContainer = (container_number) => {
  const containerId = container_Collection.get(container_number);
  if (!containerId) return;

  fetch(`/api/item/findAllPerContainer/${containerId}`, { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      if (data.length) {
        item_Collection.set(container_number, data);
        generateLiItems(data, container_number);
      }
    })
    .catch((error) => console.error("Error fetching item data:", error));
};

/**
 * Removes all items from the listed containers in bulk (DELETE request).
 */
const removeItemsFromContainers = async () => {
  const idArray = [...item_Collection.values()].flat().map((item) => item.id);
  if (idArray.length === 0) {
    console.log("No items to remove.");
    return;
  }

  try {
    const response = await fetch(`/api/item/bulkDestroy/`, {
      method: "DELETE",
      body: JSON.stringify({ id: idArray }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(`Successfully cleared items from item lists: ${idArray}`);
      itemList.innerHTML = "";
      item_Collection.clear();
    } else {
      const errorMessage = await response.text();
      console.error(
        `Failed to remove items. Server responded with: ${errorMessage}`
      );
    }
  } catch (error) {
    console.error("Error during bulk delete:", error);
  }
};

/**
 * Verifies if containers are empty and updates their status to 'shipped'.
 */
const shipped_date_labeling = async () => {
  let masterContainerIdArr = [...container_Collection.values()];
  let masterBoxIdArr = [...box_Collection.values()];
  const shipped_date = new Date().toLocaleDateString("en-US");
  if (masterContainerIdArr.length) {
    await removeItemsFromContainers();
    try {
      const response = await fetch(
        `/api/item/emptyContainerSearch/${JSON.stringify(
          masterContainerIdArr
        )}`,
        { method: "GET" }
      );
      const data = await response.json();

      // Filter out non-empty containers
      masterContainerIdArr = masterContainerIdArr.filter(
        (id) => !data.some((container) => container.container_id === id)
      );

      if (masterContainerIdArr.length) {
        await updateShippedDateForContainer(masterContainerIdArr, shipped_date);
        console.log("Updated empty containers to shipped status.");
        container_Collection.clear();
        containerList.innerHTML = "";
      } else {
        console.log("No containers are empty.");
      }
    } catch (error) {
      console.error("Error during shipped status update:", error);
    }
  }

  if (masterBoxIdArr.length) {
    await updateShippedDateForBox(masterBoxIdArr, shipped_date);
    box_Collection.clear();
    boxList.innerHTML = "";
  }
};

/**
 * Updates the shipped date for a list of container IDs (PUT request).
 */
const updateShippedDateForContainer = async (idArray, shipped_date) => {
  try {
    const response = await fetch(`/api/container/shipped_date_labeling`, {
      method: "PUT",
      body: JSON.stringify({ shipped_date, id: idArray }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(
        `Successfully updated shipped status for containers: ${idArray}`
      );
    } else {
      console.error("Failed to update shipped status.");
    }
  } catch (error) {
    console.error("Error updating shipped status:", error);
  }
};

const updateShippedDateForBox = async (idArray, shipped_date) => {
  try {
    const response = await fetch(`/api/box/toStatusShippedById`, {
      method: "PUT",
      body: JSON.stringify({ shipped_date: shipped_date, id: idArray }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(`Successfully updated shipped status for boxes: ${idArray}`);
    } else {
      console.error("Failed to update shipped status.");
    }
  } catch (error) {
    console.error("Error updating shipped status:", error);
  }
};
