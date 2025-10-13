/**
 * @file Master admin homepage script for managing inventory, containers, and user activity.
 * @description Handles data fetching, UI rendering, search functionality, and administrative actions for both standard and Amazon inventory.
 */

// --------------------------------------------------------------------------------
// --- DOM Element Constants ---
// --------------------------------------------------------------------------------
const inventory_count = document.getElementById('inventory_c');
const pending_count = document.getElementById('pending_c');
const mode = document.getElementById('mode');
const boxInput = document.getElementById("boxInput");
const myBoxInput = document.getElementById('myBoxInput');
const containerInput = document.getElementById('containerInput');
const myContainerInput = document.getElementById('myContainerInput');
const record_dashboard = document.getElementById('record_dashboard');
const log_body = document.getElementById('log_body');
const boxTable = document.getElementById("boxTable");
const boxBody = document.getElementById('boxBody');
const containerTable = document.getElementById("containerTable");
const containerBody = document.getElementById('containerBody');

// Master function buttons
const edit_btn = document.getElementById('edit_btn');
const update_btn = document.getElementById('update_btn');
const update_select = document.getElementById('update_select');
const edit_select = document.getElementById('edit_select');
const update_date_select = document.getElementById('update_date_select');
const update_date_btn = document.getElementById('update_date_btn');
const homepage_btn = document.getElementById('homepage');

// SKU search elements
const skuSelect = document.getElementById('skuSelect').querySelector('select');
const bulkSelect = document.getElementById('bulkSelect').querySelector('select');
const userSelect = document.getElementById('userSelect').querySelector('select');
const skuResult = document.getElementById("skuResult");
const bulkResult = document.getElementById("bulkResult");
const collection = document.getElementById('collection');
const totalAmount = document.getElementById('searchNumber');
const advanceBtn = document.getElementById('advanceSearch');


// --------------------------------------------------------------------------------
// --- Global State Management ---
// --------------------------------------------------------------------------------

// ---- FIX: Counters are now global to hold the combined total ----
let receivedCount = 0;
let requestedCount = 0;
let pendingCount = 0;
let shippedCount = 0;
// -----------------------------------------------------------------

// Data maps for quick lookups
const objectMap = new Map(); // box_number -> box object
const locationMap = new Map(); // location -> [box objects]
const containerMap = new Map(); // container_number -> [item objects]
const skuMap = new Map(); // item_number -> [item objects]
const locationMap_amazon = new Map(); // location -> [item objects]
let sumMap = new Map(); // For bulk SKU search totals

// Arrays for storing and filtering data
let boxNumberArr = [];
let containerNumberArr = [];
let itemNumberArr = [];
let locationArr = [];
let locationArr_amazon = [];
let preUpdateArr = []; // C-mode items selected for update
let preUpdateContainerArr = []; // A-mode items selected for update
let xcNumberArr = []; // Cross-charge box numbers
let allXCArr = []; // All cross-charge containers
let fourXCArr = []; // Status 4 cross-charge containers
let fiveXCArr = []; // Status 5 cross-charge containers
let bulkCollectionArr = []; // SKUs selected for bulk search

// Activity log state
let pass_id;
let logChecker;


// --------------------------------------------------------------------------------
// --- Initialization ---
// --------------------------------------------------------------------------------

/**
 * @description Initializes the application by fetching all necessary data and setting up event listeners.
 */
function init() {
  fetchAllData();
  addEventListeners();
  restoreSessionState();
  startTime();
  setInterval(fetchRecords, 5000);
}

/**
 * @description Fetches all initial data required for the page to function.
 */
function fetchAllData() {
  fetchAllItems(); // This function will call fetchAllBoxes after it completes
  fetchXcContainers();
  fetchClientList();
  fetchRecords(1); // Initial fetch
}

/**
 * @description Restores UI state from localStorage (e.g., password access, mode).
 */
function restoreSessionState() {
  const pass = localStorage.getItem('pass');
  if (pass === 'status update') {
    edit_btn.style.display = 'none';
    edit_select.style.display = '';
    update_btn.style.display = 'none';
  } else if (pass === 'date update') {
    edit_btn.style.display = 'none';
    update_btn.style.display = 'none';
    update_select.style.display = '';
  }

  if (!localStorage.getItem('mode')) {
    localStorage.setItem('mode', 'C');
  } else if (localStorage.getItem('mode') === 'A') {
    modeChange();
  }
}


// --------------------------------------------------------------------------------
// --- Event Handlers & Listeners ---
// --------------------------------------------------------------------------------

/**
 * @description Attaches all event listeners to the DOM elements.
 */
function addEventListeners() {
  // Search inputs
  myBoxInput.addEventListener('keyup', box_searching);
  myContainerInput.addEventListener('keyup', container_searching);

  // Mode and master function buttons
  mode.addEventListener('click', modeChange);
  homepage_btn.addEventListener('click', reset);
  edit_btn.addEventListener('click', () => passcode('s'));
  update_btn.addEventListener('click', () => passcode('d'));
  update_select.addEventListener('change', preUpdateConfirm);
  update_date_btn.addEventListener('click', finalConfirmation);
  edit_select.addEventListener('change', preChangeConfirm);

  // Advanced SKU search
  advanceBtn.addEventListener('click', advanceSearch);
  userSelect.addEventListener('change', skuListing);
  skuSelect.addEventListener('change', searchBySku);
  bulkSelect.addEventListener('change', skuCollection);
}

// --------------------------------------------------------------------------------
// --- API / Data Fetching ---
// --------------------------------------------------------------------------------

/**
 * @description Fetches all box data from the server and adds its counts to the global totals.
 */
async function fetchAllBoxes() {
  try {
    const response = await fetch('/api/user/allBox_admin');
    const data = await response.json();

    // Group data by location
    const location_data = data.reduce((acc, item) => {
      acc[item.location] = acc[item.location] || [];
      acc[item.location].push(item);
      return acc;
    }, {});

    data.forEach(box => {
      objectMap.set(box.box_number, box);
      boxNumberArr.push(box.box_number);

      if (box.box_number.startsWith('AC') && !box.batch_id) {
        xcNumberArr.push(box.box_number);
      }
      if (!locationArr.includes(box.location)) {
        locationArr.push(box.location);
      }

      // ---- FIX: This now ADDS to the global counts from Amazon items ----
      switch (box.status) {
        case 0: pendingCount++; break; // Only C-mode has pending
        case 1: receivedCount++; break;
        case 2: requestedCount++; break;
        case 3: shippedCount++; break;
      }
    });

    locationArr.forEach(loc => {
      locationMap.set(loc, location_data[loc]);
    });

    // Update the dashboard UI with the final combined counts
    updateDashboardCounts();

  } catch (error) {
    console.error('Failed to fetch box data:', error);
  }
}

/**
 * @description Fetches all Amazon item data, calculates its counts, then calls fetchAllBoxes.
 */
async function fetchAllItems() {
  try {
    const response = await fetch('/api/item/allItemAdmin');
    const data = await response.json();

    // Group data by various keys
    const item_data = data.reduce((acc, item) => {
      acc[item.item_number] = acc[item.item_number] || [];
      acc[item.item_number].push(item);
      if (!itemNumberArr.includes(item.item_number)) {
        itemNumberArr.push(item.item_number);
      }
      return acc;
    }, {});

    const container_data = data.reduce((acc, item) => {
      const key = item.container ? item.container.container_number : 'null_container';
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});

    const location_data = data.reduce((acc, item) => {
      if (item.container) {
        const key = item.container.location;
        acc[key] = acc[key] || [];
        acc[key].push(item);
        if (!locationArr_amazon.includes(key)) {
          locationArr_amazon.push(key);
        }
      }
      return acc;
    }, {});

    // Populate maps
    itemNumberArr.forEach(sku => skuMap.set(sku, item_data[sku]));
    Object.entries(container_data).forEach(([containerNum, items]) => {
      if (containerNum !== 'null_container') {
        containerMap.set(containerNum, items);
        containerNumberArr.push(containerNum);
      }
    });
    locationArr_amazon.forEach(loc => locationMap_amazon.set(loc, location_data[loc]));

    // ---- FIX: Count Amazon inventory and add to global counters ----
    containerMap.forEach(items => {
      if (items.length > 0) {
        const status = items[0].container.status; // All items in a container share status
        if (status == '1') { // received
          receivedCount++;
        } else if (status == '2') { // requested
          requestedCount++;
        }
      }
    });
    // -------------------------------------------------------------

  } catch (error) {
    console.error('Failed to fetch item data:', error);
  } finally {
    // Fetch box data after item data is processed
    await fetchAllBoxes();
  }
}

/**
 * @description Fetches all cross-charge (XC) container data.
 */
async function fetchXcContainers() {
  try {
    const response = await fetch('/api/container/allXCAdmin');
    const data = await response.json();
    data.forEach(charge => {
      allXCArr.push(charge);
      if (charge.status === 4) fourXCArr.push(charge);
      if (charge.status === 5) fiveXCArr.push(charge);
    });
  } catch (error) {
    console.error('Failed to fetch XC containers:', error);
  }
}

/**
 * @description Fetches the list of clients for the SKU search dropdown.
 */
async function fetchClientList() {
  try {
    const response = await fetch('/api/user/');
    const data = await response.json();
    userSelect.innerHTML = '<option value="0">select client</option>'; // Reset
    data.reverse().forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to fetch client list:', error);
  }
}

/**
 * @description Fetches activity records for the dashboard log.
 * @param {number} [page=1] - The page number of logs to fetch.
 */
async function fetchRecords(page = 1) {
  const logNumber = parseInt(document.getElementById('logNumber').value) || page;
  const isNewLogRequest = logNumber !== logChecker;
  logChecker = logNumber;

  try {
    const response = await fetch(`/api/record/dashboard_admin/${logNumber}`);
    const data = await response.json();
    const topItemId = data.length > 0 ? data[0].id : null;

    if (pass_id !== topItemId || isNewLogRequest) {
      updateActivityLog(data);
    }
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
}

/**
 * @description Sends a request to update the status of multiple boxes.
 * @param {number} status - The new status code.
 * @param {number[]} box_ids - An array of box IDs to update.
 */
function updateBoxStatus(status, box_ids) {
  fetch('/api/box/master_update_status', {
    method: 'PUT',
    body: JSON.stringify({ box_id: box_ids, status }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(error => console.error('Status update failed:', error));
}

/**
 * @description Sends a request to delete multiple boxes.
 * @param {number[]} box_ids - An array of box IDs to delete.
 */
function deleteBoxes(box_ids) {
  fetch('/api/box/destroy', {
    method: 'DELETE',
    body: JSON.stringify({ box_id: box_ids }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(error => console.error('Delete failed:', error));
}

/**
 * @description Sends a request to update a specific date field for multiple boxes.
 * @param {number[]} ids - An array of box or batch IDs.
 * @param {string} date - The new date string.
 * @param {string} dateType - The type of date to update.
 */
function updateBoxDate(ids, date, dateType) {
  fetch(`/api/box/dateUpdate_${dateType}`, {
    method: 'PUT',
    body: JSON.stringify({ id: ids, date }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(error => console.error('Date update failed:', error));
}


// --------------------------------------------------------------------------------
// --- UI / DOM Manipulation ---
// --------------------------------------------------------------------------------

/**
 * @description Updates the main dashboard counts using the final global values.
 */
function updateDashboardCounts() {
  const inventoryCount = receivedCount + requestedCount;
  pending_count.innerHTML = pendingCount;
  inventory_count.innerHTML = `${inventoryCount} (${requestedCount} requested)`;
}

/**
 * @description Resets search results and hides tables.
 */
function unattach() {
  document.getElementById('searchNote').innerHTML = null;
  document.getElementById('containerSearchNote').innerHTML = null;
  preUpdateArr = [];
  preUpdateContainerArr = [];
  boxTable.style.display = 'none';
  containerTable.style.display = 'none';
  boxBody.innerHTML = '';
  containerBody.innerHTML = '';
}

/**
 * @description Builds and appends a table row for a given box number.
 * @param {string} boxNumber - The box number to build a row for.
 */
function buildBoxRow(boxNumber) {
  const box = objectMap.get(boxNumber);
  if (!box) return;

  preUpdateArr.push(box);
  const row = boxBody.insertRow();
  const isBatch = !!box.batch_id;

  const tooltip = `
        received date: ${newDateValidate(box.received_date)}
        requested date: ${newDateValidate(box.requested_date)}
        shipped date: ${newDateValidate(box.shipped_date)}
        bill received: ${newDateValidate(new Date(box.bill_received).toLocaleDateString("en-US"))}
        bill storage: ${newDateValidate(new Date(box.bill_storage).toLocaleDateString("en-US"))}
        bill shipped: ${newDateValidate(new Date(box.bill_shipped).toLocaleDateString("en-US"))}
        ${isBatch ? `pending date: ${newDateValidate(box.batch.pending_date)}` : ''}
    `;

  row.innerHTML = `
        <td>${box.user.name}</td>
        <td>${box.account.name}</td>
        <td><a href="/admin/box/${boxNumber}">${boxNumber}</a></td>
        <td>${box.description}</td>
        <td>${isBatch ? box.order : `$ ${box.order}/ qty`}</td>
        <td>${isBatch ? box.batch.total_box : ''}</td>
        <td>${box.qty_per_box}</td>
        <td>${box.location}</td>
        <td uk-tooltip="${tooltip.trim()}">${isBatch ? convertDate(box) : `total $${box.cost}`}</td>
        <td>${convertStatus(box.status)}</td>
    `;
}

/**
 * @description Builds and appends a table row for a given container number.
 * @param {string} containerNumber - The container number to build a row for.
 */
function buildContainerRow(containerNumber) {
  const items = containerMap.get(containerNumber);
  if (!items || items.length === 0) return;

  preUpdateContainerArr.push(items);
  const firstItem = items[0];
  const containerData = firstItem.container;

  let totalSkuQty = 0;
  let itemHtml = '';
  let qtyHtml = '';

  items.forEach(item => {
    totalSkuQty += item.qty_per_sku;
    itemHtml += `<div uk-tooltip="title: ${item.description}">${item.item_number}</div>`;
    qtyHtml += `<div>${item.qty_per_sku}</div>`;
  });

  const tooltip = `
        received date: ${newDateValidate(containerData.received_date)}
        requested date: ${newDateValidate(containerData.requested_date)}
        shipped date: ${newDateValidate(containerData.shipped_date)}
        bill received: ${newDateValidate(new Date(containerData.bill_received).toLocaleDateString("en-US"))}
        bill storage: ${newDateValidate(new Date(containerData.bill_storage).toLocaleDateString("en-US"))}
        bill shipped: ${newDateValidate(new Date(containerData.bill_shipped).toLocaleDateString("en-US"))}
    `;

  const row = containerBody.insertRow();
  row.innerHTML = `
        <td>${firstItem.user.name}</td>
        <td>${firstItem.account.name}</td>
        <td><a href="/admin/container/${containerNumber}">${containerNumber} <small>(${totalSkuQty})</small></a></td>
        <td>${itemHtml}</td>
        <td>${qtyHtml}</td>
        <td>${containerData.location}</td>
        <td uk-tooltip="${tooltip.trim()}">${convertAmazonDate(containerData)}</td>
        <td>${convertStatus(containerData.status)}</td>
    `;
}

/**
 * @description Builds and appends a row for a cross-charge (XC) container.
 * @param {object} xcData - The cross-charge data object.
 */
function buildXcContainerRow(xcData) {
  const row = containerBody.insertRow();
  row.innerHTML = `
        <td>${xcData.user.name}</td>
        <td>${xcData.account.name}</td>
        <td>${xcData.container_number}</td>
        <td>desc: ${xcData.description}</td>
        <td>#${xcData.qty_of_fee}</td>
        <td>$ ${xcData.unit_fee}/qty</td>
        <td>total: $${xcData.qty_of_fee * xcData.unit_fee}</td>
        <td>${convertStatus(xcData.status)}</td>
    `;
}

/**
 * @description Updates the activity log UI with new data.
 * @param {object[]} data - Array of record objects.
 */
function updateActivityLog(data) {
  record_dashboard.innerHTML = '';
  log_body.innerHTML = '';
  pass_id = data.length > 0 ? data[0].id : null;

  data.slice(0, 3).forEach(record => {
    if (record) {
      const status = `${convertStatus(record.status_from)} => ${convertStatus(record.status_to)}`;
      const row = record_dashboard.insertRow();
      row.innerHTML = `
                <td class="uk-animation-slide-right-small">${record.user.name}</td>
                <td class="uk-animation-slide-right-small">${record.ref_number}</td>
                <td class="uk-animation-slide-right-small">${record.action}</td>
                <td class="uk-animation-slide-right-small">${status}</td>
            `;
    }
  });

  data.forEach(record => {
    const status = `${convertStatus(record.status_from)} => ${convertStatus(record.status_to)}`;
    const qty = `${record.qty_from} => ${record.qty_to}`;
    const row = log_body.insertRow();
    row.innerHTML = `
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-">${record.user.name}</td>
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-primary" style="word-wrap: break-word">${record.ref_number}</td>
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-" style="word-wrap: break-word">${record.sub_number}</td>
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-" style="word-wrap: break-word">${record.action}</td>
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-" style="word-wrap: break-word">${record.action_notes}</td>
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-" style="word-wrap: break-word">${qty}</td>
            <td class="uk-animation-slide-top uk-animation-fast col-3 text-" style="word-wrap: break-word">${status}</td>
        `;
  });
}

/**
 * @description Toggles the visibility of the advanced search section.
 */
function advanceSearch() {
  const isHidden = advanceBtn.classList.contains('bg-secondary');
  advanceBtn.classList.toggle('bg-secondary', !isHidden);
  advanceBtn.classList.toggle('bg-primary', isHidden);
  document.getElementById('advanceHide').style.display = isHidden ? 'none' : '';
  document.getElementById('advanceShow').style.display = isHidden ? '' : 'none';
}


// --------------------------------------------------------------------------------
// --- Search Functionality ---
// --------------------------------------------------------------------------------

function box_searching() {
  unattach();
  const input = myBoxInput.value.trim();
  if (!input) return;

  boxTable.style.display = '';

  if (input.startsWith('/all')) {
    boxNumberArr.forEach(buildBoxRow);
  } else if (input.startsWith('/xc')) {
    handleXcSearch(input, xcNumberArr, objectMap, buildBoxRow);
  } else if (isLocationFormat(input)) {
    document.getElementById('searchNote').innerHTML = "This location is not associated with any box";
    searchByLocation(input, locationArr, 'C');
  } else if (input.length > 2 && !isSpecialChar(input)) {
    document.getElementById('searchNote').innerHTML = "No information was found according to your input! Please try again";
    searchByKeyword(input, boxNumberArr, buildBoxRow, 'searchNote');
  }
}

function container_searching() {
  unattach();
  const input = myContainerInput.value.trim().toLowerCase();
  if (!input) return;

  containerTable.style.display = '';

  if (input === '/all') {
    containerNumberArr.forEach(buildContainerRow);
  } else if (input === '/sp') {
    containerNumberArr.filter(c => c.startsWith('SP')).forEach(buildContainerRow);
  } else if (input.startsWith('/xc')) {
    handleXcSearch(input, allXCArr, null, buildXcContainerRow);
  } else if (input.startsWith('.')) {
    document.getElementById('containerSearchNote').innerHTML = "This SKU does not exist in the system!";
    searchBySku(input.substring(1));
  } else if (isLocationFormat(input)) {
    document.getElementById('containerSearchNote').innerHTML = "This location is not associated with any container";
    searchByLocation(input, locationArr_amazon, 'A');
  } else if (input.length > 2 && !isSpecialChar(input)) {
    document.getElementById('containerSearchNote').innerHTML = "No information was found according to your input! Please try again";
    searchByKeyword(input, containerNumberArr, buildContainerRow, 'containerSearchNote');
  }
}

function searchByKeyword(keyword, dataArray, buildRowFunc, noteElementId) {
  const upperKeyword = keyword.toUpperCase();
  let found = false;
  dataArray.forEach(item => {
    if (item.toUpperCase().includes(upperKeyword)) {
      buildRowFunc(item);
      found = true;
    }
  });
  if (found) {
    document.getElementById(noteElementId).innerHTML = null;
  }
}

function searchByLocation(location, locationArray, currentMode) {
  const upperLocation = location.toUpperCase();
  let found = false;

  locationArray.forEach(loc => {
    if (loc && loc.toUpperCase().includes(upperLocation)) {
      if (currentMode === 'C') {
        locationMap.get(loc)?.forEach(obj => buildBoxRow(obj.box_number));
        found = true;
      } else if (currentMode === 'A') {
        const containersInLocation = new Set();
        locationMap_amazon.get(loc)?.forEach(obj => {
          if (obj.container) {
            containersInLocation.add(obj.container.container_number);
          }
        });
        containersInLocation.forEach(buildContainerRow);
        found = true;
      }
    }
  });

  if (found) {
    const noteId = currentMode === 'C' ? 'searchNote' : 'containerSearchNote';
    document.getElementById(noteId).innerHTML = null;
  }
}

function searchBySku(sku) {
  const upperSku = sku.toUpperCase();
  const foundContainers = new Set();
  let found = false;

  itemNumberArr.forEach(itemNum => {
    if (itemNum.toUpperCase().includes(upperSku)) {
      skuMap.get(itemNum)?.forEach(itemObj => {
        if (itemObj.container) {
          foundContainers.add(itemObj.container.container_number);
        }
      });
      found = true;
    }
  });

  foundContainers.forEach(buildContainerRow);
  if (found) {
    document.getElementById('containerSearchNote').innerHTML = null;
  }
}

function handleXcSearch(command, dataArray, dataMap, buildRowFunc) {
  let itemsToShow = [];
  switch (command) {
    case '/xc':
      itemsToShow = dataArray;
      break;
    case '/xc4':
      itemsToShow = dataArray.filter(item => (dataMap ? dataMap.get(item)?.status : item.status) === 4);
      break;
    case '/xc5':
      itemsToShow = dataArray.filter(item => (dataMap ? dataMap.get(item)?.status : item.status) === 5);
      break;
  }
  itemsToShow.forEach(item => buildRowFunc(dataMap ? item : item));
}


// --------------------------------------------------------------------------------
// --- Mode & Security ---
// --------------------------------------------------------------------------------

function modeChange() {
  const isCMode = mode.innerHTML === 'C';
  const newMode = isCMode ? 'A' : 'C';
  localStorage.setItem('mode', newMode);

  mode.innerHTML = newMode;
  containerInput.style.display = isCMode ? '' : 'none';
  boxInput.style.display = isCMode ? 'none' : '';

  edit_btn.style.display = isCMode ? 'none' : '';
  update_btn.style.display = isCMode ? 'none' : '';
  edit_select.style.display = 'none';
  update_select.style.display = 'none';
  update_date_btn.style.display = 'none';

  homepage_btn.href = isCMode ? '/admin/master_page_amazon' : '/admin/master_page';
  homepage_btn.innerText = isCMode ? 'Amazon Home' : 'Home Page';

  document.getElementById("badge").classList.toggle('bg-danger', isCMode);
  document.getElementById("badge").classList.toggle('bg-success', !isCMode);

  myBoxInput.value = null;
  myContainerInput.value = null;
  unattach();
}

function passcode(type) {
  const code = prompt("Please enter the passcode");
  if (code === '0523') {
    edit_btn.style.display = 'none';
    update_btn.style.display = 'none';
    if (type === 's') {
      localStorage.setItem('pass', 'status update');
      edit_select.style.display = '';
    } else if (type === 'd') {
      localStorage.setItem('pass', 'date update');
      update_select.style.display = '';
    }
  } else {
    alert('Incorrect passcode');
  }
}

function preChangeConfirm() {
  const status = parseInt(edit_select.value);
  const ids = preUpdateArr.map(item => item.id);

  if (ids.length === 0) {
    alert('You need to select at least one box to proceed.');
    return;
  }

  const code = prompt('Please enter the passcode again to confirm the change!');
  if (code === '0523') {
    if (status === 99) { // 99 is delete
      deleteBoxes(ids);
    } else {
      updateBoxStatus(status, ids);
    }
    alert(`${ids.length} items were updated!`);
    location.reload();
  }
}

function finalConfirmation() {
  if (preUpdateArr.length === 0) {
    alert('You need to select at least one box to proceed.');
    update_date_select.value = null;
    return;
  }

  const dateType = update_select.value;
  let newDate = update_date_select.value || null;
  const confirmationMsg = `UPDATE ${dateType} of ${preUpdateArr.length} ITEMS to ${newDate || 'N/A'}?`;

  if (confirm(confirmationMsg)) {
    const password = prompt('Please enter the passcode again to confirm the change!');
    if (password === '0523') {
      const ids = preUpdateArr.map(item => (dateType === 'pending_date') ? item.batch_id : item.id);
      updateBoxDate(ids, newDate, dateType);
      alert(`${dateType} of ${ids.length} items were updated to ${newDate}!`);
      location.reload();
    } else {
      alert('Incorrect password!');
    }
  }
}

function preUpdateConfirm() {
  update_date_btn.style.display = update_select.value ? '' : 'none';
  if (!update_select.value) {
    update_date_select.value = null;
  }
}

function reset() {
  if (mode.innerHTML === 'C') {
    update_date_btn.style.display = 'none';
    update_select.style.display = 'none';
    edit_select.style.display = 'none';
    edit_btn.style.display = '';
    update_btn.style.display = '';
    localStorage.removeItem('pass');
  }
}


// --------------------------------------------------------------------------------
// --- Utility / Helper Functions ---
// --------------------------------------------------------------------------------

function convertStatus(s) {
  const statusMap = {
    0: 'pending', 1: 'received', 2: 'requested', 3: 'shipped',
    4: 'xc pre-billed', 5: 'xc billed', 98: 'archived', 99: 'deleted'
  };
  return statusMap[s] || 'null';
}

function convertDate(box) {
  return box.shipped_date || box.requested_date || box.received_date || (box.batch ? box.batch.pending_date : '');
}

function convertAmazonDate(container) {
  return container.shipped_date || container.requested_date || container.received_date || 'N/A';
}

function newDateValidate(date) {
  return (date === "12/31/1969" || !date) ? 'N/A' : date;
}

const isCharacterALetter = (char) => /[a-zA-Z]/.test(char);
const isSpecialChar = (str) => /[-]/.test(str);
const isLocationFormat = (input) => isCharacterALetter(input[0]) && !isNaN(input[1]);

function startTime() {
  const today = new Date();
  const date = today.toLocaleDateString('en-US');
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = String(m).padStart(2, '0');
  s = String(s).padStart(2, '0');
  document.getElementById('clock').innerHTML = `${date} ${h}:${m}:${s}`;
  setTimeout(startTime, 1000);
}


// --------------------------------------------------------------------------------
// --- Execution ---
// --------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', init);