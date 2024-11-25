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
  timer = setTimeout(fn, 100); // Waits 100ms after the last keypress
}

// Collections for containers, boxes, and items
const container_Collection = new Map();
const box_Collection = new Map();
const item_Collection = new Map();

/**
 * Validates user input for a container or box number.
 * If valid, fetches the data and updates the respective collection.
 */
const inputValidation = () => {
  console.log("validating...");
  const scannedBox = scanned_item.value.trim().toUpperCase();
  // Validate container
  if (scannedBox.substring(0, 2) === "AM" && scannedBox.length === 8) {
    fetch(`/api/container/amazon_container/${scannedBox}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          container_Collection.set(scannedBox, data.id);
          console.log(data);
        } else {
          console.log(
            `Invalid entry: Cannot find the container "${scannedBox}" in the database.`
          );
        }
      })
      .catch((error) => console.error("Error fetching container data:", error));

    // Validate box
  } else if (scannedBox.length > 4) {
    fetch(`/api/box/boxDataUsingNumber/${scannedBox}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          box_Collection.set(scannedBox, data.id);
        } else {
          alert(
            `Invalid entry: Cannot find the box "${scannedBox}" in the database.`
          );
        }
      })
      .catch((error) => console.error("Error fetching box data:", error));

    // Invalid format
  } else {
    alert("Invalid entry format. Please check your input and try again.");
  }
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
    const response = await fetch(`/api/item/removeFromContainers/`, {
      method: "DELETE",
      body: JSON.stringify({ container_id: idArray }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(`Successfully cleared items from containers: ${idArray}`);
      location.reload();
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
  const shipped_date = new Date().toLocaleDateString("en-US");

  try {
    const response = await fetch(
      `/api/item/emptyContainerSearch/${JSON.stringify(masterContainerIdArr)}`,
      { method: "GET" }
    );
    const data = await response.json();

    // Filter out non-empty containers
    masterContainerIdArr = masterContainerIdArr.filter(
      (id) => !data.some((container) => container.container_id === id)
    );

    if (masterContainerIdArr.length) {
      await updateShippedDate(masterContainerIdArr, shipped_date);
      console.log("Updated empty containers to shipped status.");
    } else {
      console.log("No containers are empty.");
    }
  } catch (error) {
    console.error("Error during shipped status update:", error);
  }
};

/**
 * Updates the shipped date for a list of container IDs (PUT request).
 */
const updateShippedDate = async (idArray, shipped_date) => {
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
