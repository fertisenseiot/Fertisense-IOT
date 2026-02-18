
/* ============================================================
   🌍 BASE CONFIGURATION
   - API Base URL
   - All API endpoint mappings
   ============================================================ */

// const BASE_URL = "http://127.0.0.1:8000"; // direct IP
  const BASE_URL = "https://fertisense-iot-production.up.railway.app";


const API = {
  masterorganizations: BASE_URL + "/api/masterorganization/",
  mastercentre:        BASE_URL + "/api/mastercentre/",
  devicescategory:     BASE_URL + "/api/devicecategory/",
  masterdevices:       BASE_URL + "/api/masterdevice/",
  mastersensor:        BASE_URL + "/api/mastersensor/",
  masterparameter:     BASE_URL + "/api/masterparameter/",
  masteruom:           BASE_URL + "/api/masteruom/",
  createuser:          BASE_URL + "/api/masteruser/",
  masterrole:          BASE_URL + "/api/masterrole/",  
  // seuser:              BASE_URL + "/api/seuser/",
  devicereadinglog:    BASE_URL + "/api/devicereadinglog/",
  devicealarmlog:      BASE_URL + "/api/devicealarmlog/",
  devicealarmcalllog:  BASE_URL + "/api/devicealarmcalllog/",
  sensorparameterlink: BASE_URL + "/api/sensorparameterlink/",
  devicesensorlink:    BASE_URL + "/api/devicesensorlink/",
  compassdates:        BASE_URL + "/api/compassdates/",
  // centreorganizationlink: BASE_URL + "centreorganizationlink/",
  userorganizationcentrelink: BASE_URL + "/api/userorganizationcentrelink/",
  masternotificationtime: BASE_URL + "/api/masternotificationtime/",
  mastersubscriptioninfo: BASE_URL +"/api/mastersubscriptioninfo/",
  masterplantype: BASE_URL +"/api/masterplantype/",
  mastersubscriptionhistory: BASE_URL +"/api/subscriptionhistory/",
  
};

API.devicesensorparameterlink = "virtual";

/* ============================================================
   🏷 HEADER LABEL MAPPING
   - Table column display names
   - DB fields → User friendly labels
   ============================================================ */


// ===== Custom header labels =====
const HEADER_LABELS = {
  ORGANIZATION_ID: "ORGANIZATION NAME",
  DEVICE_ID: "DEVICE NAME",
  Device_ID: "DEVICE NAME",
  CENTRE_ID: "CENTRE NAME",
  SENSOR_ID: "SENSOR NAME",
  PARAMETER_ID: "PARAMETER NAME",
  ROLE_ID: "ROLE NAME",
  UOM_ID: "UNIT",
  USER_ID: "USER NAME",
  CATEGORY_ID: "CATEGORY NAME",
  Subscription_ID:"Subscription_Name",
  Plan_ID:"Plan_Name",
};


/* ============================================================
   🔑 PRIMARY KEY CONFIGURATION
   - Each table ka primary key define karta hai
   ============================================================ */


// ===== Primary keys per table =====
const PRIMARY_KEYS = {
  masterorganizations: "ORGANIZATION_ID",
  mastercentre: "CENTRE_ID",
  masterdevices: "DEVICE_ID",
  mastersensor: "SENSOR_ID",
  masterparameter: "PARAMETER_ID",
  masteruom: "UOM_ID",
  createuser: "USER_ID",
  masterrole: "ROLE_ID",
  seuser: "USER_ID",
  devicereadinglog: "ID",
  devicealarmlog: "id",
  devicealarmcalllog: "ID",
  sensorparameterlink: "id",
  devicesensorlink: "id",
  compassdates: "ID",
  centreorganizationlink: "id",
  userorganizationcentrelink: "id",
  masternotificationtime: "id",
  devicescategory: "CATEGORY_ID",
  mastersubscriptioninfo: "Subscription_ID",
  masterplantype: "Plan_ID",
  mastersubscriptionhistory: "id"
};

/* ============================================================
   📋 FIELD SCHEMA DEFINITIONS
   - Empty table case me fallback headers
   ============================================================ */

// ===== Field schema for empty tables =====
const FIELD_SCHEMAS = {
  masterorganizations: ["ORGANIZATION_ID","ORGANIZATION_NAME",],
  mastercentre: ["CENTRE_ID","ORGANIZATION_ID","CENTRE_NAME"],
  masterdevices: ["DEVICE_ID","DEVICE_NAME","DEVICE_IP","ORGANIZATION_ID","CENTRE_ID","DEVICE_STATUS"],
  mastersensor: ["SENSOR_ID","SENSOR_NAME","SENSOR_TYPE","UOM_ID"],
  masterparameter: ["PARAMETER_ID","PARAMETER_NAME","UOM_ID","LOWER_THRESHOLD","UPPER_THRESHOLD","THRESHOLD"],
  masteruom: ["UOM_ID","UOM_NAME","SYMBOL"],
  createuser: ["USER_ID","ACTUAL_NAME","USERNAME","ROLE_ID","PHONE","SEND_SMS","EMAIL","SEND_EMAIL","PASSWORD","confirm_password","VALIDITY_START","VALIDITY_END"],
  masterrole: ["ROLE_ID","ROLE_NAME"],
  seuser: ["USER_ID","USERNAME","EMAIL","PASSWORD","ROLE","ORGANIZATION_ID"],
  devicereadinglog: ["ID","DEVICE_ID","SENSOR_ID","PARAMETER_ID","READING","RAISED_TIME"],
  devicealarmlog: ["ID","DEVICE_ID","SENSOR_ID","PARAMETER_ID","MESSAGE","RAISED_TIME"],
  devicealarmcalllog: ["ID","ALARM_ID","CALLED_AT","STATUS"],
  sensorparameterlink: ["ID","SENSOR_ID","PARAMETER_ID"],
  devicesensorlink: ["ID","DEVICE_ID","SENSOR_ID"],
  compassdates: ["ID","ORGANIZATION_ID","BRANCH_ID","CMPS_DT"],
  // centreorganizationlink: ["ID", "ORGANIZATION_ID","CENTRE_ID"],
  userorganizationcentrelink: ["USER_ID","ORGANIZATION_ID","CENTRE_ID"],
  masternotificationtime: ["NOTIFICATION_TIME","ORGANIZATION_ID"],
  devicescategory:["CATEGORY_ID","CATEGORY_NAME"],
  mastersubscriptioninfo:["Subscription_ID","Package_Name",],
  masterplantype:["Plan_ID","Plan_Name"],
  mastersubscriptionhistory:["id","Device_ID","Subscription_Start_date"	,"Subcription_End_date"	,"Subscription_ID","Plan_ID","Payment_Date","Status"]
};


/* ============================================================
   🛠 UTILITY FUNCTIONS
   - normalizeKey
   - fetchJSON
   - logout
   - formatTitle
   ============================================================ */

// helpers
function normalizeKey(name){ return name.replace(/\s+/g,"").toLowerCase(); }
async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok){ throw new Error(`${res.status} ${res.statusText} -> ${url}`); }
  return res.json();
}
function logout(){ fetch('/logout/').then(()=>window.location='/login/'); }
function formatTitle(table) {

  function calculateSubscriptionStatus(row) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const start = new Date(row.Subscription_Start_date);
  start.setHours(0,0,0,0);

  const end = new Date(row.Subcription_End_date);
  end.setHours(0,0,0,0);

  if (today < start) return "Future";
  if (today > end) return "Expired";
  return "Active";
}

  if (!table) return "";

  let t = table;

  // 1️⃣ Check if starts with 'master'
  if (/^master/i.test(t)) {
    t = t.replace(/^master/i, "Master ");
  }

    if (/^devicescategory/i.test(t)) {
    t = t.replace(/^devicescategory/i, "Device Category ");
  }

  if (/^devicesensorlink/i.test(t)) {
    t = t.replace(/^devicesensorlink/i, "Device Senor Link");
  }
  
  if (/^sensorparameterlink/i.test(t)) {
    t = t.replace(/^sensorparameterlink/i, "Sensor Parameter Link");
  }

  if (/^userorganizationcentrelink/i.test(t)) {
    t = t.replace(/^userorganizationcentrelink/i, "User Organization Centre Link");
  }

  // 2️⃣ Replace underscores or hyphens with spaces
  t = t.replace(/[_-]+/g, " ");

  // 3️⃣ Add space before uppercase letters (camelCase split)
  t = t.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 4️⃣ Handle long mixed words like “Userorganizationcentrelink”
  t = t.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  // 5️⃣ Capitalize every word nicely
  t = t.replace(/\b\w+/g, word => {
    // If full word is uppercase (like API, ID), leave it
    return word.toUpperCase() === word
      ? word
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // 6️⃣ Clean up extra spaces
  return t.trim().replace(/\s+/g, " ");
}


let currentTable="", currentData=[], dropdownData={};const rowStatus = {};// Current active status map for rows

const activeStatusMap = {}; // key = row id, value = true/false
let dropdownLoaded = false;   // 🔥 ADD THIS LINE
 // tableName_rowId = true/false


// ===== preload dropdown datasets =====
// async function loadDropdowns(){
//   try{
//     dropdownData.orgs    = await fetchJSON(API.masterorganizations);
//     dropdownData.centres = await fetchJSON(API.mastercentre);
//     dropdownData.uoms    = await fetchJSON(API.masteruom);
//     dropdownData.devices = await fetchJSON(API.masterdevices);
//     dropdownData.sensors = await fetchJSON(API.mastersensor);
//     dropdownData.parameters = await fetchJSON(API.masterparameter);
//     dropdownData.roles   = await fetchJSON(API.masterrole);
//     dropdownData.user   = await fetchJSON(API.createuser);
//     dropdownData.devicescategory = await fetchJSON(API.devicescategory);
//     dropdownData.mastersubscriptioninfo = await fetchJSON(API.mastersubscriptioninfo)
//     dropdownData.masterplantype = await fetchJSON(API.masterplantype)
//     dropdownData.mastersubscriptionhistory = await fetchJSON(API.mastersubscriptionhistory)
//     dropdownData.devicereadinglog = await fetchJSON(API.devicereadinglog);
//     dropdownData.devicesensorlink = await fetchJSON(API.devicesensorlink);
//     dropdownData.sensorparameterlink = await fetchJSON(API.sensorparameterlink);


//   }catch(err){
//     console.error("Dropdown preload failed:", err);
//   }
// }

/* ============================================================
   🔄 DROPDOWN DATA LOADER
   - Preload all master data
   - Prevent duplicate loading
   ============================================================ */

async function loadDropdowns(){

  if (dropdownLoaded) return;   // ✅ Prevent reload

  try{

    const [
      orgs,
      centres,
      uoms,
      devices,
      sensors,
      parameters,
      roles,
      users,
      categories,
      subsInfo,
      planType,
      subsHistory,
      readings,
      deviceSensor,
      sensorParam
    ] = await Promise.all([
      fetchJSON(API.masterorganizations),
      fetchJSON(API.mastercentre),
      fetchJSON(API.masteruom),
      fetchJSON(API.masterdevices),
      fetchJSON(API.mastersensor),
      fetchJSON(API.masterparameter),
      fetchJSON(API.masterrole),
      fetchJSON(API.createuser),
      fetchJSON(API.devicescategory),
      fetchJSON(API.mastersubscriptioninfo),
      fetchJSON(API.masterplantype),
      fetchJSON(API.mastersubscriptionhistory),
      fetchJSON(API.devicereadinglog),
      fetchJSON(API.devicesensorlink),
      fetchJSON(API.sensorparameterlink)
    ]);

    dropdownData.orgs = orgs;
    dropdownData.centres = centres;
    dropdownData.uoms = uoms;
    dropdownData.devices = devices;
    dropdownData.sensors = sensors;
    dropdownData.parameters = parameters;
    dropdownData.roles = roles;
    dropdownData.user = users;
    dropdownData.devicescategory = categories;
    dropdownData.mastersubscriptioninfo = subsInfo;
    dropdownData.masterplantype = planType;
    dropdownData.mastersubscriptionhistory = subsHistory;
    dropdownData.devicereadinglog = readings;
    dropdownData.devicesensorlink = deviceSensor;
    dropdownData.sensorparameterlink = sensorParam;

    dropdownLoaded = true;  // ✅ Mark loaded

  }catch(err){
    console.error("Dropdown preload failed:", err);
  }
}

/* ============================================================
   🔽 GENERIC SORTING ENGINE
   - Date based sorting
   - Numeric sorting
   - Custom table logic
   ============================================================ */

function sortDescending(table, data) {
  if (!data || data.length === 0) return data;

  const sample = data[0];

  // Date/Time fields check
  const dateKeys = Object.keys(sample).filter(k => k.toLowerCase().includes("date") || k.toLowerCase().includes("time"));
  if (dateKeys.length) {
    // Sort by first date/time field
    const key = dateKeys[0];
    return data.sort((a, b) => new Date(b[key]) - new Date(a[key]));
  }

  // Numeric fields check (ID, reading, etc.)
  const numberKeys = Object.keys(sample).filter(k => typeof sample[k] === "number" || !isNaN(Number(sample[k])));
  if (numberKeys.length) {
    const key = numberKeys[0];
    return data.sort((a, b) => Number(b[key]) - Number(a[key]));
  }

  return data; // fallback: as is
}

function calculateSubscriptionStatus(row) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(row.Subscription_Start_date);
  start.setHours(0, 0, 0, 0);

  const end = row.Subcription_End_date
    ? new Date(row.Subcription_End_date)
    : null;

  if (end) end.setHours(0, 0, 0, 0);

  if (today < start) return "Future";
  if (end && today > end) return "Expired";
  return "Active";
}

function calculateSubscriptionStatus(row) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const start = new Date(row.Subscription_Start_date);
  start.setHours(0,0,0,0);

  const end = row.Subcription_End_date
    ? new Date(row.Subcription_End_date)
    : null;

  if (end) end.setHours(0,0,0,0);

  // 🔥 CORE LOGIC
  if (end && end < today) {
    return "Expired";
  }

  if (start > today) {
    return "Future";
  }

  return "Active";
}


/* ============================================================
   📊 MAIN TABLE LOADER
   - Fetch API data
   - Apply sorting
   - Render headers
   - Render rows
   - Attach action buttons
   ============================================================ */

// ===== load & draw table =====
async function loadTable(table) {

  if (normalizeKey(table) === "devicesensorparameterlink") {
  loadDeviceSensorParameterMaster();
  return;
}


  localStorage.setItem("lastOpenedTable", table);

  currentTable = normalizeKey(table);
  if (!API[currentTable]) {
    console.error("No API for:", table, currentTable);
    return;
  }

  document.getElementById('tableTitle').innerText = formatTitle(table);

  try {
    currentData = await fetchJSON(API[currentTable]);

    // ✅ Apply generic descending sort for all tables
    currentData = sortDescending(currentTable, currentData);

    // ✅ Sorting for readings & alarms
    if (currentTable === "devicereadinglog") {
      if (currentData.length > 0 && currentData[0].READING_DATE && currentData[0].READING_TIME) {
        currentData.sort((a, b) => new Date(b.READING_DATE + " " + b.READING_TIME) - new Date(a.READING_DATE + " " + a.READING_TIME));
      } else if (currentData.length > 0 && currentData[0].READING !== undefined) {
        currentData.sort((a, b) => b.READING - a.READING);
      }
    }

if (currentTable === "devicealarmlog") {
  currentData.sort((a, b) => {
    const aDateTime = new Date(
      (a.ALARM_DATE || a.CREATED_DATE || a.DATE || '') + " " + (a.ALARM_TIME || a.CREATED_TIME || '')
    );
    const bDateTime = new Date(
      (b.ALARM_DATE || b.CREATED_DATE || b.DATE || '') + " " + (b.ALARM_TIME || b.CREATED_TIME || '')
    );
    
    // If both valid dates, compare normally
    if (!isNaN(aDateTime) && !isNaN(bDateTime)) {
      return bDateTime - aDateTime; // latest first
    }

    // fallback: compare ID or reading if dates invalid
    if (a.S_NO && b.S_NO) return b.S_NO - a.S_NO;
    if (a.READING && b.READING) return b.READING - a.READING;
    return 0;
  });
}


  } catch (err) {
    console.error("Fetch table failed:", err);
    currentData = [];
  }

  function sortDescending(table, data) {
  if (!data || data.length === 0) return data;

  // ✅ mastersubscriptionhistory: latest entry first
  if (table === "mastersubscriptionhistory") {
    // Prefer ID-based DESC (most reliable)
    if (data[0].id) {
      return data.sort((a, b) => b.id - a.id);
    }
    // Fallback to date if ID not found
    return data.sort((a, b) => new Date(b.Subscription_Start_date) - new Date(a.Subscription_Start_date));
  }

  // ✅ Default sort logic for others
  const sample = data[0];
  const dateKeys = Object.keys(sample).filter(k =>
    k.toLowerCase().includes("date") || k.toLowerCase().includes("time")
  );
  if (dateKeys.length) {
    const key = dateKeys[0];
    return data.sort((a, b) => new Date(b[key]) - new Date(a[key]));
  }

  const numberKeys = Object.keys(sample).filter(
    k => typeof sample[k] === "number" || !isNaN(Number(sample[k]))
  );
  if (numberKeys.length) {
    const key = numberKeys[0];
    return data.sort((a, b) => Number(b[key]) - Number(a[key]));
  }

  return data;
}

  const tableEl = document.getElementById('mainTable');
  const thead = tableEl.querySelector('thead');
  const tbody = tableEl.querySelector('tbody');
  thead.innerHTML = tbody.innerHTML = "";

  let headers = currentData.length ? Object.keys(currentData[0]) : (FIELD_SCHEMAS[currentTable] || []);
  const pk = PRIMARY_KEYS[currentTable] || headers[0];

  // ✅ Add extra ID field for master tables
  if (currentTable === "masterdevices" && !headers.includes("DEVICE_ID")) headers.push("DEVICE_ID");
  if (currentTable === "mastersensor" && !headers.includes("SENSOR_ID")) headers.push("SENSOR_ID");
  if (currentTable === "masterparameter" && !headers.includes("PARAMETER_ID")) headers.push("PARAMETER_ID");

  // ✅ Render table headers with friendly names
  const displayHeaders = headers.map(h => {
    if (["masterorganizations","mastercentre","masterdevices","mastersensor","masterparameter","masteruom","createuser","masterrole","sensorparameterlink","devicesensorlink","userorganizationcentrelink","masternotificationtime","devicescategory","devicealarmlog","devicereadinglog","mastersubscriptioninfo","masterplantype","mastersubscriptionhistory",].includes(currentTable) && h === pk) {
      return "S_NO";
    }
    return HEADER_LABELS[h] || h;
  });

  // ✅ Add extra header for master IDs
if (currentTable === "masterdevices") displayHeaders.push("DEVICE_ID");
if (currentTable === "mastersensor") displayHeaders.push("SENSOR_ID");
if (currentTable === "masterparameter") displayHeaders.push("PARAMETER_ID");


  thead.innerHTML = `<tr>${
    displayHeaders.filter((h,i) => headers[i] !== "PASSWORD").map(h => `<th>${h}</th>`).join("")
  }${ (currentTable === "devicealarmlog" || currentTable === "devicereadinglog") ? "" : "<th>Actions</th>" }
   </tr>`;

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  }

  // ----- Render table body -----
if (currentData.length) {
  tbody.innerHTML = currentData.map((row, rowIdx) => {
    
let computedStatus = null;

if (currentTable === "mastersubscriptionhistory") {
  const today = new Date();

  const start = new Date(row.Subscription_Start_date);
  const end   = row.Subcription_End_date
    ? new Date(row.Subcription_End_date)
    : null;

  if (end && end < today) {
    computedStatus = "Expired";
  } else if (start > today) {
    computedStatus = "Future";
  } else {
    computedStatus = "Active";
  }
}



    let rowCells = headers.filter(h => h !== "PASSWORD").map(h => {
     
      
    // ✅ STATUS: plain text only
    if (currentTable === "mastersubscriptionhistory" && h === "Status") {
      const computedStatus = calculateSubscriptionStatus(row);
      return `<td>${computedStatus}</td>`;
    }

      let cellVal = row[h] ?? "";

      // ✅ Convert boolean true/false to Yes/No for SEND_SMS & SEND_EMAIL
if (h === "SEND_SMS" || h === "SEND_EMAIL") {
  cellVal = (row[h] === true || row[h] === 1 || row[h] === "true") ? "Yes" : "No";
}


      // PK → S_NO numbering
      if (h === pk && ["masterorganizations","mastercentre","masterdevices","mastersensor","masterparameter","masteruom","createuser","masterrole","sensorparameterlink","devicesensorlink","userorganizationcentrelink","masternotificationtime","devicescategory","devicereadinglog","devicealarmlog","mastersubscriptioninfo","masterplantype","mastersubscriptionhistory",].includes(currentTable)) {
        return `<td>${rowIdx + 1}</td>`;
      }

      // Map IDs → Names
      if (h === "ORG_ID" || h === "ORGANIZATION_ID") {
        const org = (dropdownData.orgs || []).find(o => o.ORGANIZATION_ID == row[h]);
        cellVal = org ? `${org.ORGANIZATION_NAME} (${org.ORGANIZATION_ID})` : row[h];
      }
      if (h === "CENTRE_ID") {
        const centre = (dropdownData.centres || []).find(c => c.CENTRE_ID == row[h]);
        cellVal = centre ? `${centre.CENTRE_NAME} (${centre.CENTRE_ID})` : row[h];
      }
      if (h === "CATEGORY_ID") {
        const cat = (dropdownData.devicescategory || []).find(dc => dc.CATEGORY_ID == row[h]);
        cellVal = cat ? cat.CATEGORY_NAME : row[h];
      }
      if (h === "DEVICE_ID" && currentTable !== "masterdevices") {
        const device = (dropdownData.devices || []).find(d => d.DEVICE_ID == row[h]);
        cellVal = device ? `${device.DEVICE_NAME} (${device.DEVICE_ID})` : row[h];
      }
      if (h === "Device_ID") {
        const device = (dropdownData.devices || []).find(d => d.DEVICE_ID == row[h]);
        cellVal = device ? device.DEVICE_NAME : row[h];
      }
      
      if (h === "SENSOR_ID" && currentTable !== "mastersensor") {
        const sensor = (dropdownData.sensors || []).find(s => s.SENSOR_ID == row[h]);
        cellVal = sensor ? `${sensor.SENSOR_NAME} (${sensor.SENSOR_ID})` : row[h];
      }
      if (h === "PARAMETER_ID" && currentTable !== "masterparameter") {
        const param = (dropdownData.parameters || []).find(p => p.PARAMETER_ID == row[h]);
        cellVal = param ? `${param.PARAMETER_NAME} (${param.PARAMETER_ID})` : row[h];
      }
      if (h === "USER_ID") {
        const user = (dropdownData.user || []).find(u => u.USER_ID == row[h]);
        cellVal = user ? user.USERNAME : row[h];
      }
      if (h === "ROLE_ID") {
        const role = (dropdownData.roles || []).find(r => r.ROLE_ID == row[h]);
        cellVal = role ? role.ROLE_NAME : row[h];
      }
      if (h === "UOM_ID") {
        const uom = (dropdownData.uoms || []).find(u => u.UOM_ID == row[h]);
        cellVal = uom ? uom.UOM_NAME : row[h];
      }

      if (h === "Subscription_ID") {
        const pkg = (dropdownData.mastersubscriptioninfo || []).find(p => p.Subscription_ID == row[h]);
        cellVal = pkg ? pkg.Package_Name : row[h];
      }

      if (h === "Plan_ID") {
        const plan = (dropdownData.masterplantype || []).find(p => p.Plan_ID == row[h]);
        cellVal = plan ? plan.Plan_Name : row[h];
}


      // Format date
      // if (/^\d{4}-\d{2}-\d{2}$/.test(cellVal)) {
      //   const options = { year: "numeric", month: "short", day: "2-digit" };
      //   cellVal = new Date(cellVal).toLocaleDateString("en-GB", options);
      // }

      // return `<td>${cellVal}</td>`;


// sirf display formatting
if (/^\d{4}-\d{2}-\d{2}$/.test(cellVal)) {
  cellVal = new Date(cellVal).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

return `<td>${cellVal}</td>`;

    }).join("");

    // ✅ Manually append ID column for master tables
    if (currentTable === "masterdevices") rowCells += `<td>${row.DEVICE_ID || ""}</td>`;
    if (currentTable === "mastersensor") rowCells += `<td>${row.SENSOR_ID || ""}</td>`;
    if (currentTable === "masterparameter") rowCells += `<td>${row.PARAMETER_ID || ""}</td>`;

    const addBtn = document.getElementById("addBtn");
    if (currentTable === "devicereadinglog" || currentTable === "devicealarmlog") {
      addBtn.style.display = "none";
    } else {
      addBtn.style.display = "inline-block";
    }

    const idVal = row[pk];
    const noActions = (currentTable === "devicealarmlog" || currentTable === "devicereadinglog");

if (currentTable === "mastersubscriptionhistory") {

  const computedStatus = calculateSubscriptionStatus(row);
  const pk = PRIMARY_KEYS[currentTable];
  const rowId = row[pk];

  return `<tr class="${computedStatus === 'Expired' ? 'expired-row' : ''}">
    ${rowCells}



    <!-- ACTIONS COLUMN -->
    <td>
      <button class="btn btn-sm btn-warning"
        onclick='editRow(${JSON.stringify(row)})'>
        <i class="bi bi-pencil"></i>
      </button>

      <button class="btn btn-sm btn-success"
        onclick='renew(${rowId})'>
        Renew
      </button>
    </td>
  </tr>`;
}




if (currentTable === "masterdevices") {
  return `<tr class="${row.DEVICE_STATUS === 1 ? '' : 'inactive-row'}">
    ${rowCells}${noActions ? "" : `
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick='editRow(${JSON.stringify(row)})'>
          <i class="bi bi-pencil"></i>
        </button>
        <label class="switch">
          <input type="checkbox" ${row.DEVICE_STATUS === 1 ? "checked" : ""} 
            onchange="toggleActiveStatus(${row.DEVICE_ID}, this)">
          <span class="slider round">
            <span class="status-text">${row.DEVICE_STATUS === 1 ? "Active" : "Inactive"}</span>
          </span>
        </label>
      </td>`}
  </tr>`;
}

if (currentTable === "mastersensor") {
  return `<tr class="${row.SENSOR_STATUS === 1 ? '' : 'inactive-row'}">
    ${rowCells}${noActions ? "" : `
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick='editRow(${JSON.stringify(row)})'>
          <i class="bi bi-pencil"></i>
        </button>
        <label class="switch">
          <input type="checkbox" ${row.SENSOR_STATUS === 1 ? "checked" : ""} 
            onchange="toggleSensorStatus(${row.SENSOR_ID}, this)">
          <span class="slider round">
            <span class="status-text">${row.SENSOR_STATUS === 1 ? "Active" : "Inactive"}</span>
          </span>
        </label>
      </td>`}
  </tr>`;
}
    return `<tr>${rowCells}${noActions ? "" : `
      <td>
        <button class="btn btn-sm btn-warning" onclick='editRow(${JSON.stringify(row)})'><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick='deleteRow(${JSON.stringify(idVal)})'><i class="bi bi-trash"></i></button>
      </td>`}
    </tr>`;
  }).join("");
} else {
  if (headers.length) {
    tbody.innerHTML = `<tr><td colspan="${headers.length + 1}" class="text-center text-muted">No records found</td></tr>`;
  }
}


  const section = document.getElementById("tableSection");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

/* ============================================================
   🧾 MODAL MANAGEMENT
   - addRow
   - editRow
   - openModal
   - closeModal
   ============================================================ */

// ===== Modal =====
function addRow(){

  openModal({});
}

function editRow(row){ openModal(row); }

function formatFirstWord(str){
  str = str.trimStart();
  if(!str) return "";
  let parts = str.split(" ");
  parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  return parts.join(" ");
}

function openModal(row){
}

async function openModal(row ={}){

  const modalEl = document.getElementById('crudModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();

  const isEdit = Object.keys(row).length > 0;
  document.getElementById('modalTitle').innerText = (isEdit?"Edit ":"Add ") + formatTitle(currentTable);

  const submitBtn = document.querySelector('#crudForm button[type="submit"]');
  submitBtn.innerHTML = isEdit ? `<i class="bi bi-check2"></i> Update` : `<i class="bi bi-check2"></i> Save`;

  const fieldsDiv = document.getElementById('modalFields');
  fieldsDiv.innerHTML = "";

if (currentTable === "devicesensorparameterlink") {

  fieldsDiv.innerHTML = `
    <input type="hidden" name="id" value="${row?.id ?? ''}">

    <div class="mb-3">
      <label class="form-label">DEVICE</label>
      <select class="form-select" name="DEVICE_ID" id="deviceSelect">
        <option value="">-- Choose Device --</option>
        ${(dropdownData.devices || [])
          .sort((a,b)=>b.DEVICE_ID-a.DEVICE_ID)
          .map(d=>`
            <option value="${d.DEVICE_ID}" ${row.DEVICE_ID==d.DEVICE_ID?'selected':''}>
              ${d.DEVICE_NAME}
            </option>`).join("")}
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">SENSOR</label>
      <select class="form-select" name="SENSOR_ID" id="sensorSelect">
        <option value="">-- Choose Sensor --</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">PARAMETER</label>
      <select class="form-select" name="PARAMETER_ID" id="parameterSelect">
        <option value="">-- Choose Parameter --</option>
      </select>
    </div>
  `;

  const deviceSelect = document.getElementById("deviceSelect");
  const sensorSelect = document.getElementById("sensorSelect");
  const parameterSelect = document.getElementById("parameterSelect");

  function loadSensors(deviceId){
    sensorSelect.innerHTML =
      `<option value="">-- Choose Sensor --</option>` +
      (dropdownData.devicesensorlink || [])
        .filter(l => l.DEVICE_ID == deviceId)
        .map(l=>{
          const s = dropdownData.sensors.find(ss=>ss.SENSOR_ID==l.SENSOR_ID);
          return s ? `<option value="${s.SENSOR_ID}">${s.SENSOR_NAME}</option>` : "";
        }).join("");
  }

  function loadParameters(sensorId){
    const relatedParams = (dropdownData.sensorparameterlink || [])
      .filter(sp => sp.SENSOR_ID == sensorId);

    parameterSelect.innerHTML =
      `<option value="">-- Choose Parameter --</option>` +
      relatedParams.map(sp=>{
        const p = dropdownData.parameters.find(pp=>pp.PARAMETER_ID==sp.PARAMETER_ID);
        return p ? `<option value="${p.PARAMETER_ID}">${p.PARAMETER_NAME}</option>` : "";
      }).join("");
  }

  deviceSelect.addEventListener("change", function(){
    loadSensors(this.value);
    parameterSelect.innerHTML = `<option value="">-- Choose Parameter --</option>`;
  });

  sensorSelect.addEventListener("change", function(){
    loadParameters(this.value);
  });

  // EDIT MODE PREFILL
  if(row.DEVICE_ID){
    loadSensors(row.DEVICE_ID);
    sensorSelect.value = row.SENSOR_ID;

    loadParameters(row.SENSOR_ID);
    parameterSelect.value = row.PARAMETER_ID || "";
  }

  return;
}



if (currentTable === "createuser") {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedToday = `${yyyy}-${mm}-${dd}`; // ✅ yyyy-mm-dd for input[type=date]

  // ✅ default validity end = +1 saal
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const yyyyEnd = nextYear.getFullYear();
  const mmEnd = String(nextYear.getMonth() + 1).padStart(2, "0");
  const ddEnd = String(nextYear.getDate()).padStart(2, "0");
  const formattedEnd = `${yyyyEnd}-${mmEnd}-${ddEnd}`;

  fieldsDiv.innerHTML = `
    <input type="hidden" name="USER_ID" value="${row.USER_ID ?? ''}">
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Actual Name</label>
        <input type="text" class="form-control" name="ACTUAL_NAME" value="${row.ACTUAL_NAME ?? ''}">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Username</label>
        <input type="text" class="form-control" name="USERNAME" value="${row.USERNAME ?? ''}">
      </div>
<div class="col-md-6 mb-3">
  <label class="form-label">Role</label>
  <select class="form-select" name="ROLE_ID">
    <option value="">-- Choose Role --</option>
    ${(dropdownData.roles || []).map(r => `
      <option value="${r.ROLE_ID}" ${(String(r.ROLE_ID) === String(row.ROLE_ID ?? row.ROLE ?? "")) ? "selected" : ""}>
        ${r.ROLE_NAME}
      </option>
    `).join("")}
  </select>
</div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Phone</label>
        <input type="text" class="form-control" name="PHONE" value="${row.PHONE ?? ''}">
        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox" name="SEND_SMS" ${row.SEND_SMS ? "checked" : ""}>
          <label class="form-check-label">Send SMS</label>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Email</label>
        <input type="text"
       class="form-control"
       name="EMAIL"
       value="${row.EMAIL ?? ''}"
       placeholder="Enter one or more emails separated by comma">

        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox" name="SEND_EMAIL" ${row.SEND_EMAIL ? "checked" : ""}>
          <label class="form-check-label">Send Email</label>
        </div>
      </div>

   <div class="col-md-6 mb-3">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" id="PASSWORD" name="PASSWORD" value="${row.PASSWORD ?? ''}">
        <div id="PASSWORD-error" class="text-danger mt-1"></div>
        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox"  id="showPassword">
          <label class="form-check-label" for="showPassword">Show Password</label>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <label class="form-label">Confirm Password</label>
        <input type="password" class="form-control" id="confirm_password" name="confirm_password" value="${row.PASSWORD ?? ''}">
        <div id="confirm_password-error" class="text-danger mt-1"></div>
        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox" id="showConfirmPassword">
          <label class="form-check-label" for="showConfirmPassword">Show Confirm Password</label>
        </div>
      </div>

      <!-- Validity fields -->
      <div class="col-md-6 mb-3">
        <label class="form-label">Validity Start</label>
        <input type="date" class="form-control" name="VALIDITY_START" value="${row.VALIDITY_START ?? formattedToday}">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Validity End</label>
        <input type="date" class="form-control" name="VALIDITY_END" value="${row.VALIDITY_END ?? formattedEnd}">
      </div>
    </div>
  `;

  // 🔥 Fresh users load (important)
dropdownData.user = await fetchJSON(API.createuser);

// 🔥 USERNAME duplicate check (NO setTimeout)
const usernameInput = fieldsDiv.querySelector('input[name="USERNAME"]');

if (usernameInput) {

  let warning = document.createElement("small");
  warning.style.color = "red";
  warning.classList.add("d-block", "mt-1");
  usernameInput.parentNode.appendChild(warning);

  usernameInput.addEventListener("input", function () {

    const value = this.value.trim().toLowerCase();

    const exists = (dropdownData.user || []).some(u =>
      u.USERNAME.toLowerCase() === value &&
      u.USER_ID != (row.USER_ID ?? "")
    );

    if (exists) {
      warning.innerText = "Username already taken";
    } else {
      warning.innerText = "";
    }

  });
}



  // Show/Hide password logic
  setTimeout(() => {
    document.getElementById("showPassword")?.addEventListener("change", function() {
      document.getElementById("PASSWORD").type = this.checked ? "text" : "password";
    });
    document.getElementById("showConfirmPassword")?.addEventListener("change", function() {
      document.getElementById("confirm_password").type = this.checked ? "text" : "password";
    });

    // Password validation on input
    const passwordInput = document.getElementById("PASSWORD");
    const confirmInput = document.getElementById("confirm_password");

    function validatePassword() {
      const value = passwordInput.value;
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      const errorEl = document.getElementById("PASSWORD-error");

      if (!regex.test(value)) {
        errorEl.textContent = "Password must be min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.";
      } else {
        errorEl.textContent = "";
      }

      // Confirm password match
      const confirmEl = document.getElementById("confirm_password-error");
      if (confirmInput.value && value !== confirmInput.value) {
        confirmEl.textContent = "Passwords do not match.";
      } else {
        confirmEl.textContent = "";
      }
    }

    passwordInput.addEventListener("input", validatePassword);
    confirmInput.addEventListener("input", validatePassword);
  }, 100);

  return;
}




  const schema = currentData.length ? Object.keys(currentData[0]) : (FIELD_SCHEMAS[currentTable] || []);
  const pk = PRIMARY_KEYS[currentTable];

  schema.forEach(key => {
      // ❌ created_by skip
  if (key === "CREATED_BY" || key === "created_by") return;
      // mastersensor ka SENSOR_STATUS add/edit form me skip
  if (currentTable === "mastersensor" && key === "SENSOR_STATUS") return;
  if (currentTable === "masterdevices" && key === "DEVICE_STATUS") return;
  if (currentTable === "mastersubscriptionhistory" && key === "Status") return;

  let fieldHtml = "";
    // PK handling
 if(key === pk){
  // if(currentTable === "userorganizationcentrelink"){
  //   return;  // add + edit dono me skip
  // }
  fieldsDiv.innerHTML += `<input name="${key}" value="${row[key]??''}" hidden>`;
  return;
}



    

// Organization dropdown
if (key === "ORG_ID" || key === "ORGANIZATION_ID") {
  const options = (dropdownData.orgs || []).sort((a, b) => b.ORGANIZATION_ID - a.ORGANIZATION_ID);
  fieldsDiv.innerHTML += `<div class="mb-3">
    <label class="form-label">ORGANIZATION</label>
    <select class="form-select" name="${key}">
      <option value="">-- Choose Organization --</option>
      ${options.map(o => `<option value="${o.ORGANIZATION_ID}" ${o.ORGANIZATION_ID == (row[key] ?? "") ? 'selected' : ''}>${o.ORGANIZATION_NAME}</option>`).join("")}
    </select>
  </div>`;
  return;
}

// Centre dropdown
if (key === "CENTRE_ID") {
  const options = (dropdownData.centres || []).sort((a, b) => b.CENTRE_ID - a.CENTRE_ID);
  fieldsDiv.innerHTML += `<div class="mb-3">
    <label class="form-label">CENTRE</label>
    <select class="form-select" name="CENTRE_ID">
      <option value="">-- Choose Centre --</option>
      ${options.map(c => `<option value="${c.CENTRE_ID}" ${c.CENTRE_ID == (row["CENTRE_ID"] || "") ? 'selected' : ''}>${c.CENTRE_NAME}</option>`).join('')}
    </select>
  </div>`;
  return;
}

// UOM dropdown
if (key === "UOM_ID") {
  const options = (dropdownData.uoms || []).sort((a, b) => b.UOM_ID - a.UOM_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">UNIT</label>
      <select class="form-select" name="UOM_ID">
        <option value="">-- Choose UOM --</option>
        ${options.map(o => `<option value="${o.UOM_ID}" ${(o.UOM_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.UOM_NAME}</option>`).join("")}
      </select>
    </div>`;
  return;
}

// Device dropdown
if (key === "DEVICE_ID") {
  const options = (dropdownData.devices || []).sort((a, b) => b.DEVICE_ID - a.DEVICE_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">DEVICE</label>
      <select class="form-select" name="DEVICE_ID">
        <option value="">-- Choose Device --</option>
        ${options.map(o => `<option value="${o.DEVICE_ID}" ${(o.DEVICE_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.DEVICE_NAME}</option>`).join("")}
      </select>
    </div>`;
  return;
}

if (key === "Device_ID") {
  const options = (dropdownData.devices || []).sort((a, b) => b.DEVICE_ID - a.DEVICE_ID); // ascending
  const selectOptions = options.map(o => `
    <option value="${o.DEVICE_ID}" ${o.DEVICE_ID == (row[key] ?? "") ? 'selected' : ''}>${o.DEVICE_NAME}</option>
  `).join("");

  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">DEVICE</label>
      <select class="form-select" name="Device_ID">
        <option value="">-- Choose Device --</option>
        ${selectOptions}
      </select>
    </div>`;
  return;
}


if (key === "Subscription_ID") {
  const options = (dropdownData.mastersubscriptioninfo || []).sort((a, b) => b.Subscription_ID - a.Subscription_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">Package Name</label>
      <select class="form-select" name="Subscription_ID">
        <option value="">-- Choose Package --</option>
        ${options.map(o => `<option value="${o.Subscription_ID}" ${(o.Subscription_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.Package_Name}</option>`).join("")}
      </select>
    </div>`;
  return;
}
if (key === "Plan_ID") {
  const options = (dropdownData.masterplantype || []).sort((a, b) => b.Plan_ID - a.Plan_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">Plan Type</label>
      <select class="form-select" name="Plan_ID">
        <option value="">-- Choose Plan --</option>
        ${options.map(o => `<option value="${o.Plan_ID}" ${(o.Plan_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.Plan_Name}</option>`).join("")}
      </select>
    </div>`;
  return;
}

// Sensor dropdown
if (key === "SENSOR_ID") {
  const options = (dropdownData.sensors || []).sort((a, b) => b.SENSOR_ID - a.SENSOR_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">SENSOR</label>
      <select class="form-select" name="SENSOR_ID">
        <option value="">-- Choose Sensor --</option>
        ${options.map(o => `<option value="${o.SENSOR_ID}" ${(o.SENSOR_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.SENSOR_NAME}</option>`).join("")}
      </select>
    </div>`;
  return;
}

// Parameter dropdown
if (key === "PARAMETER_ID") {
  const options = (dropdownData.parameters || []).sort((a, b) => b.PARAMETER_ID - a.PARAMETER_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">PARAMETER</label>
      <select class="form-select" name="PARAMETER_ID">
        <option value="">-- Choose Parameter --</option>
        ${options.map(o => `<option value="${o.PARAMETER_ID}" ${(o.PARAMETER_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.PARAMETER_NAME}</option>`).join("")}
      </select>
    </div>`;
  return;
}

// Role dropdown
if (key === "ROLE_ID") {
  const options = (dropdownData.roles || []).sort((a, b) => b.ROLE_ID - a.ROLE_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">ROLE</label>
      <select class="form-select" name="ROLE_ID">
        <option value="">-- Choose Role --</option>
        ${options.map(r => `<option value="${r.ROLE_ID}" ${(String(r.ROLE_ID) === String(row.ROLE_ID ?? "")) ? "selected" : ""}>${r.ROLE_NAME}</option>`).join("")}
      </select>
    </div>`;
  return;
}

// User dropdown
if (key === "USER_ID") {
  const options = (dropdownData.user || []).sort((a, b) => b.USER_ID - a.USER_ID);
  fieldsDiv.innerHTML += `<div class="mb-3">
    <label class="form-label">USER</label>
    <select class="form-select" name="USER_ID">
      <option value="">-- Choose User --</option>
      ${options.map(u => `<option value="${u.USER_ID}" ${(u.USER_ID == (row[key] ?? "")) ? 'selected' : ''}>${u.USERNAME}</option>`).join("")}
    </select>
  </div>`;
  return;
}

// Category dropdown
if (key === "CATEGORY_ID") {
  const options = (dropdownData.devicescategory || []).sort((a, b) => b.CATEGORY_ID - a.CATEGORY_ID);
  fieldsDiv.innerHTML += `
    <div class="mb-3">
      <label class="form-label">CATEGORY</label>
      <select class="form-select" name="CATEGORY_ID">
        <option value="">-- Choose Category --</option>
        ${options.map(dc => `<option value="${dc.CATEGORY_ID}" ${(dc.CATEGORY_ID == (row[key] ?? "")) ? 'selected' : ''}>${dc.CATEGORY_NAME}</option>`).join("")}
      </select>
    </div>`;
  return;
}

    //  if(key==="ROLE_ID"){
    //   const options = dropdownData.roles || [];
    //   fieldsDiv.innerHTML += `
    //     <div class="mb-3">
    //       <label class="form-label">ROLE</label>
    //       <select class="form-select" name="ROLE_ID">
    //         <option value="">-- Choose Role  --</option>
    //         ${options.map(r=>`<option value="${r.ROLE_ID}" ${(r.ROLE_ID==(row[key]??""))?'selected':''}>${r.ROLE_NAME}</option>`).join("")}
    //       </select>
    //     </div>`;
    //   return;
    // }

// SEND_SMS / SEND_EMAIL checkbox
    if(key === "SEND_SMS" || key === "SEND_EMAIL") {
      const checked = row[key] === true || row[key] === "true" || row[key] === 1 ? "checked" : "";
      fieldsDiv.innerHTML += `
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" name="${key}" id="${key}" ${checked}>
          <label class="form-check-label" for="${key}">${key.replace("_"," ")}</label>
        </div>
      `;
      return;
    }

        if (key === "NOTIFICATION_TIME") {
  fieldsDiv.innerHTML += `<div class="mb-3">
    <label class="form-label">Notification Time (in seconds)</label>
    <input type="number" class="form-control" name="NOTIFICATION_TIME" 
      value="${row[key] ?? ""}" placeholder="Enter time in seconds" required>
  </div>`;
  return;
}



    // Default input field
    let type="text";
    const k = key.toLowerCase();
    if(k.includes("email")) type="email";
    else if(k.includes("password")) type="password";
    else if(k.includes("validity_start") || k.includes("validity_end")) type="date";
    else if(k.includes("date"))
  type = "date";
else if(k.endsWith("_at") || k.endsWith("_time"))
  type = "datetime-local";

    else if(k.includes("upper")||k.includes("lower")||k.includes("value")||k.includes("threshold")||k.endsWith("_id")) type="number";
    let stepAttr = "";
if (type === "number") {
    stepAttr = `step="any"`;   // allow decimals like 4.5, 8.75, etc.
}
  const isTextType = type === "text";

    fieldsDiv.innerHTML += `
      <div class="mb-3">
        <label class="form-label">${key}</label>
        <input class="form-control" name="${key}" value="${row[key]??''}" type="${type}" ${isTextType ? 'oninput="this.value = formatFirstWord(this.value)"':''}>
      </div>`;
  });

  // ===== Dependent dropdown logic (ONLY if NOT userorganizationcentrelink) =====
if (currentTable === "userorganizationcentrelink" || currentTable === "masterdevices") {
  const orgDropdown = fieldsDiv.querySelector(
    'select[name="ORG_ID"], select[name="ORGANIZATION_ID"]'
  );
  const centreDropdown = fieldsDiv.querySelector(
    'select[name="CENTRE_ID"]'
  );

  if (orgDropdown && centreDropdown) {

    function updateCentres() {
      const orgId = orgDropdown.value;

      const filteredCentres = (dropdownData.centres || [])
        .filter(c => String(c.ORGANIZATION_ID) === String(orgId));

      centreDropdown.innerHTML =
        `<option value="">-- Choose Centre --</option>` +
        filteredCentres.map(c =>
          `<option value="${c.CENTRE_ID}">
            ${c.CENTRE_NAME}
          </option>`
        ).join("");
    }

    // 🔁 On organization change
    orgDropdown.addEventListener("change", () => {
      updateCentres();
    });

    // 🔁 Initial load (edit mode)
    if (row.ORGANIZATION_ID) {
      updateCentres();
      centreDropdown.value = row.CENTRE_ID || "";
    }
  }
}

}

function closeModal(){
  const modalEl = document.getElementById('crudModal');
  const instance = bootstrap.Modal.getInstance(modalEl);
  if(instance) instance.hide();
}


/* ============================================================
   💾 FORM SUBMISSION HANDLER
   - Add / Edit logic
   - Checkbox handling
   - Special table handling
   ============================================================ */

// ===== submit (add / edit) =====
document.getElementById('crudForm').addEventListener('submit', async function(e){

  e.preventDefault();

  const form = new FormData(this); 
  let payload = {};
  form.forEach((v,k)=>payload[k]=v);


 // 🔥 Mandatory fields check
if (currentTable === "userorganizationcentrelink") {
  if (!payload.USER_ID || !payload.ORGANIZATION_ID || !payload.CENTRE_ID) {
    alert("USER, ORGANIZATION aur CENTRE select karna mandatory hai");
    return;
  }
}



    // ❌ undefined / empty values backend ko mat bhejo
Object.keys(payload).forEach(k => {
  if (payload[k] === "" || payload[k] === undefined) {
    delete payload[k];
  }
});


  // Convert checkboxes to boolean
  ["SEND_SMS","SEND_EMAIL"].forEach(f => {
    if(payload[f] === "on") payload[f] = true;
    else payload[f] = false;
  });
  
  // 👉 Special case: Device-Sensor Link me Org & Centre auto-attach
if(currentTable === "devicesensorparameterlink"){

  const selectedDevice = payload.DEVICE_ID;
  const selectedSensor = payload.SENSOR_ID;
  const selectedParameter = payload.PARAMETER_ID;

  if(!selectedDevice || !selectedSensor || !selectedParameter){
    alert("All fields required");
    return;
  }

  const device = dropdownData.devices.find(d=>d.DEVICE_ID==selectedDevice);

  // 1️⃣ Save Device-Sensor
  await fetch(API.devicesensorlink,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      DEVICE_ID: selectedDevice,
      SENSOR_ID: selectedSensor,
      ORGANIZATION_ID: device?.ORGANIZATION_ID,
      CENTRE_ID: device?.CENTRE_ID
    })
  });

  // 2️⃣ Save Sensor-Parameter
  await fetch(API.sensorparameterlink,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      SENSOR_ID: selectedSensor,
      PARAMETER_ID: selectedParameter
    })
  });

  closeModal();
  loadDeviceSensorParameterMaster();
  await loadDropdowns();
  updateSummary();
  return;
}

  // primary key detect
  const pk = PRIMARY_KEYS[currentTable];
  const id = payload[pk];
  const isEdit = id && id.trim() !== "" ? true : false;

  if (currentTable === "createuser" && isEdit) {
    delete payload.confirm_password;

    if (!payload.PASSWORD) {
        delete payload.PASSWORD;
    }
}


  if(!isEdit){
    delete payload[pk];  // add me PK hata do
  }

  const url = isEdit ? API[currentTable] + id + "/" : API[currentTable];
  const method = isEdit ? 'PATCH' : 'POST';

  let res = await fetch(url,{
    method: method,
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });

const messageDiv = document.getElementById("crudMessage");

if(isEdit){
  closeModal();
} else {
  // Reset form for next add
  this.reset();
  this.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  const firstField = this.querySelector('input, select, textarea');
  if(firstField) firstField.focus();

  // ✅ Show message inside modal
  messageDiv.innerText = "Saved! Ready for next entry.";
  messageDiv.classList.remove("d-none");
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageDiv.classList.add("d-none");
  }, 3000);
}
// 🔥 Step 1: Force reload dropdown data first
dropdownLoaded = false;
await loadDropdowns();

// 🔥 Step 2: Reload table with fresh data
await loadTable(currentTable);

// 🔥 Step 3: Update summary cards
await updateSummary();

});

/* ============================================================
   🔁 ACTIVE / INACTIVE TOGGLE
   - Device status update
   - Sensor status update
   ============================================================ */


function toggleActiveStatus(deviceId, checkbox) {
  const isActive = checkbox.checked;
  const tr = checkbox.closest("tr");

  // Update UI
  tr.classList.toggle("inactive-row", !isActive);
  checkbox.nextElementSibling.querySelector(".status-text").textContent = isActive ? "Active" : "Inactive";

  // Update backend
  fetch(`${API.masterdevices}${deviceId}/`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ DEVICE_STATUS: isActive ? 1 : 0 })
  })
  .then(res => {
    if (!res.ok) return res.text().then(txt => { throw new Error(txt); });
    console.log(`✅ DEVICE_STATUS updated`, { DEVICE_ID: deviceId, DEVICE_STATUS: isActive ? 1 : 0 });
  })
  .catch(err => console.error("Failed to update DEVICE_STATUS:", err));
}

function toggleSensorStatus(sensorId, checkbox) {
  const isActive = checkbox.checked;
  const tr = checkbox.closest("tr");

  // Update UI
  tr.classList.toggle("inactive-row", !isActive);
  checkbox.nextElementSibling.querySelector(".status-text").textContent = isActive ? "Active" : "Inactive";

  // Update backend
  fetch(`${API.mastersensor}${sensorId}/`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ SENSOR_STATUS: isActive ? 1 : 0 })
  })
  .then(res => {
    if (!res.ok) return res.text().then(txt => { throw new Error(txt); });
    console.log(`✅ SENSOR_STATUS updated`, { SENSOR_ID: sensorId, SENSOR_STATUS: isActive ? 1 : 0 });
  })
  .catch(err => console.error("Failed to update SENSOR_STATUS:", err));
}

/* ============================================================
   🗑 DELETE HANDLER
   - Delete row API call
   ============================================================ */

   // ===== Delete =====
async function deleteRow(id){
  if(id==null || id===""){ alert("Invalid ID"); return; }
  if(!confirm("Delete this row?")) return;

  const pk = PRIMARY_KEYS[currentTable];  // use correct PK
  try{
    const res = await fetch(API[currentTable] + id + "/", { method:'DELETE' });
    if(!res.ok){
      const txt = await res.text();
      console.error("Delete Error", res.status, txt);
      alert(`Delete failed ${res.status}: ${txt}`);
      return;
    }
  }catch(err){
    console.error("Delete failed:", err);
    alert("Delete request failed.");
    return;
  }
  await loadTable(currentTable);
  updateSummary();
}

/* ============================================================
   📦 SUBSCRIPTION MANAGEMENT MODULE
   ------------------------------------------------------------
   - showPopupMessage() → Generic Bootstrap popup
   - renew() → Validate & trigger subscription scheduling
   - openScheduleForm() → Future subscription scheduling modal
   - openRenewForm() → Immediate renewal modal
   - Handles:
        • Date validation
        • Future start restriction
        • Subscription status logic
        • API POST request for new record
        • Table refresh after success
   ------------------------------------------------------------
   This module does NOT update old record.
   It always creates a NEW subscription entry.
   ============================================================ */

// Function to show a dynamic Bootstrap popup message
function showPopupMessage(title, message) {
  // Remove existing popup if any
  const existingPopup = document.getElementById('dynamicPopupModal');
  if (existingPopup) existingPopup.remove();

  const popupHtml = `
    <div class="modal fade" id="dynamicPopupModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', popupHtml);
  const modalEl = document.getElementById('dynamicPopupModal');
  const bootstrapModal = new bootstrap.Modal(modalEl);
  bootstrapModal.show();

  // Remove modal from DOM after hiding
  modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}
// Updated renew function using popup instead of alert — new record insert karega
async function renew(id) {
  if (!id) {
    showPopupMessage("Invalid ID", "Please provide a valid subscription ID.");
    return;
  }

  const sub = currentData.find(r => r[PRIMARY_KEYS[currentTable]] == id);
  if (!sub) {
    showPopupMessage("Not Found", "Subscription not found!");
    return;
  }

  // 🔹 Open schedule form for future subscription
  openScheduleForm(sub);
}



function openScheduleForm(subscription) {
  const device = dropdownData.devices.find(d => d.DEVICE_ID === subscription.Device_ID);
  const deviceName = device ? device.DEVICE_NAME : `ID: ${subscription.Device_ID}`;

  const existingModal = document.getElementById('dynamicScheduleModal');
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="modal fade" id="dynamicScheduleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Schedule Subscription</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="dynamicScheduleForm">
              <div class="mb-3">
                <label class="form-label">Device Name</label>
                <input type="text" class="form-control" value="${deviceName}" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-control" id="scheduleStartDate" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              <div class="mb-3">
                <label class="form-label">End Date</label>
                <input type="date" class="form-control" id="scheduleEndDate" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="scheduleSubmit">Schedule</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalEl = document.getElementById('dynamicScheduleModal');
  const bootstrapModal = new bootstrap.Modal(modalEl);
  bootstrapModal.show();

  document.getElementById('scheduleSubmit').onclick = () => {
    const startDate = document.getElementById('scheduleStartDate').value;
    const endDate = document.getElementById('scheduleEndDate').value;

    if (!startDate || !endDate) {
      alert("Please fill all date fields.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be earlier than Start date.");
      return;
    }

    // 🔹 Ensure new subscription starts after current subscription ends
    const currentEnd = new Date(subscription.Subcription_End_date);
    if (new Date(startDate) <= currentEnd) {
      alert(`New subscription must start after current subscription ends (${subscription.Subcription_End_date}).`);
      return;
    }

    fetch(API[currentTable], {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Device_ID: subscription.Device_ID,
        Subscription_Start_date: startDate,
        Subcription_End_date: endDate,
        Subscription_ID: subscription.Subscription_ID,
        Plan_ID: subscription.Plan_ID,
        Payment_Date: new Date().toISOString().split('T')[0],
        Status: "Future"  // initially future
      })
    })
    .then(res => {
      if (!res.ok) return res.text().then(txt => { throw new Error(txt); });
      return res.json();
    })
    .then(data => {
      alert("✅ Subscription scheduled successfully!");
      bootstrapModal.hide();
      modalEl.remove();
      loadTable(currentTable); // Refresh table
    })
    .catch(err => {
      console.error("Schedule failed:", err);
      alert("❌ Failed to schedule subscription: " + err.message);
    });
  };

  modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}


// Modal form for renewing subscription (creates new entry instead of updating)
function openRenewForm(subscription) {
  const device = dropdownData.devices.find(d => d.DEVICE_ID === subscription.Device_ID);
  const deviceName = device ? device.DEVICE_NAME : `ID: ${subscription.Device_ID}`;

  // Remove existing modal if any
  const existingModal = document.getElementById('dynamicRenewModal');
  if (existingModal) existingModal.remove();

  // Create modal dynamically
  const modalHtml = `
    <div class="modal fade" id="dynamicRenewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Renew Subscription</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="dynamicRenewForm">
              <div class="mb-3">
                <label class="form-label">Device Name</label>
                <input type="text" class="form-control" value="${deviceName}" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">New Start Date</label>
                <input type="date" class="form-control" id="dynamicStartDate" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              <div class="mb-3">
                <label class="form-label">New End Date</label>
                <input type="date" class="form-control" id="dynamicEndDate" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="dynamicRenewSubmit">Renew</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.getElementById('dynamicRenewModal');
  const bootstrapModal = new bootstrap.Modal(modalEl);
  bootstrapModal.show();

  // Handle Renew Submit
  document.getElementById('dynamicRenewSubmit').onclick = () => {
    const newStartDate = document.getElementById('dynamicStartDate').value;
    const newEndDate = document.getElementById('dynamicEndDate').value;

    if (!newStartDate || !newEndDate) {
      alert("Please fill all date fields.");
      return;
    }

      if (new Date(newEndDate) < new Date(newStartDate)) {
    alert("End date cannot be earlier than Start date.");
    return;
  }

    fetch(API[currentTable], {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Device_ID: subscription.Device_ID,
        Subscription_Start_date: newStartDate,
        Subcription_End_date: newEndDate,
        Subscription_ID: subscription.Subscription_ID,
        Plan_ID: subscription.Plan_ID,
        Payment_Date: new Date().toISOString().split('T')[0],
        Status: "Active"
      })
    })
      .then(res => {
        if (!res.ok) return res.text().then(txt => { throw new Error(txt); });
        return res.json();
      })
      .then(data => {
        alert("✅ Subscription renewed successfully!");
        bootstrapModal.hide();
        modalEl.remove();
        loadTable(currentTable); // Refresh the table
      })
      .catch(err => {
        console.error("Renew failed:", err);
        alert("❌ Failed to renew subscription: " + err.message);
      });
  };

  // Clean modal when closed
  modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}

/* ============================================================
   📈 SUMMARY CARDS
   - updateSummary()
   ============================================================ */

// ===== Summary cards =====
async function updateSummary(){
  try{
    const [d,p,s,o] = await Promise.all([
      fetchJSON(API.masterdevices),
      fetchJSON(API.masterparameter),
      fetchJSON(API.mastersensor),
      fetchJSON(API.masterorganizations)
    ]);
    document.getElementById('totalDevices').innerText=d.length;
    document.getElementById('totalParameters').innerText=p.length;
    document.getElementById('totalSensors').innerText=s.length;
    document.getElementById('totalOrganizations').innerText=o.length;
  }catch(e){ console.warn("Summary update skipped:", e); }
}

/* ============================================================
   📡 POPUP SYSTEM
   - Device status popup
   - Organization popup
   - Sensor link popup
   - Parameter popup
   - Filter popup table
   ============================================================ */

async function showDeviceStatusPopup() {

  try {

      const devices = [...(dropdownData.devices || [])]
          .sort((a, b) => b.DEVICE_ID - a.DEVICE_ID);

      const readings = dropdownData.devicereadinglog || [];
      const subscriptions = dropdownData.mastersubscriptionhistory || [];
      const packages = dropdownData.mastersubscriptioninfo || [];
      const plans = dropdownData.masterplantype || [];



    const now = new Date();

    let deviceRows = devices.map(device => {

      // Filter readings of this device
      const deviceReadings = readings.filter(r =>
        r.DEVICE_ID == device.DEVICE_ID
      );

      let status = "Offline";
      let badgeClass = "bg-danger";
      let lastReadingDisplay = "No Data";

      if (deviceReadings.length > 0) {

        // Sort by latest READING_DATE + READING_TIME
deviceReadings.sort((a, b) => {
  const aDate = new Date(a.READING_DATE + "T" + a.READING_TIME.split(".")[0]);
  const bDate = new Date(b.READING_DATE + "T" + b.READING_TIME.split(".")[0]);
  return bDate - aDate;
});

// Latest reading
const cleanTime = deviceReadings[0].READING_TIME.split(".")[0];

const lastReadingTime = new Date(
  deviceReadings[0].READING_DATE + "T" + cleanTime
);

lastReadingDisplay = lastReadingTime.toLocaleString();


        const diffMinutes = (now - lastReadingTime) / (1000 * 60);

        // 🔥 10 MINUTE RULE
        if (diffMinutes <= 10) {
          status = "Online";
          badgeClass = "bg-success";
        }
      }

// ===== Subscription Logic =====
let subscriptionName = "No Subscription";
let validTillDisplay = "-";
let validClass = "bg-secondary";

const deviceSubs = subscriptions
  .filter(s => s.Device_ID == device.DEVICE_ID)
  .sort((a, b) => new Date(b.Subscription_Start_date) - new Date(a.Subscription_Start_date));

if (deviceSubs.length > 0) {

  const latestSub = deviceSubs[0];

  const pkg = packages.find(p => p.Subscription_ID == latestSub.Subscription_ID);
  const plan = plans.find(pl => pl.Plan_ID == latestSub.Plan_ID);

  subscriptionName =
    (pkg ? pkg.Package_Name : "") +
    (plan ? ` (${plan.Plan_Name})` : "");

  if (latestSub.Subcription_End_date) {

    const endDate = new Date(latestSub.Subcription_End_date);
    validTillDisplay = endDate.toLocaleDateString("en-GB");

    const diffDays = (endDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      validClass = "bg-danger"; // Expired
    }
    else if (diffDays <= 3) {
      validClass = "bg-warning text-dark"; // 3 days
    }
    else if (diffDays <= 15) {
      validClass = "bg-primary"; // 15 days
    }
    else if (diffDays <= 30) {
      validClass = "bg-orange"; // 1 month
    }
    else {
      validClass = "bg-success"; // Safe
    }
  }
}


      return `
        <tr>
          <td>${device.DEVICE_NAME}</td>
          <td>
            <span class="badge ${badgeClass}">
              ${status}
            </span>
          </td>
          <td>${lastReadingDisplay}</td>
           <td>${subscriptionName}</td>

          <td>
          <span class="badge ${validClass}">
            ${validTillDisplay}
          </span>
        </td>


        </tr>
      `;
    }).join("");

    const modalHtml = `
      <div class="modal fade" id="deviceStatusModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Live Device Status (10 Min Rule)</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <!-- 🔍 SEARCH BAR ADD HERE -->
  <div class="input-group mb-3">
    <span class="input-group-text">
      <i class="bi bi-search"></i>
    </span>
    <input type="text"
           class="form-control"
           placeholder="Search..."
           onkeyup="filterPopupTable(this)">
  </div> 
            <div class="table-responsive">
            <table class="table table-bordered table-sm">
            <thead class="table-light">
                  <tr>
                    <th>Device Name</th>
                    <th>Status</th>
                    <th>TimeStamp For Last Reading</th>
                     <th>Subscription</th>
                     <th>Valid Till</th>
                  </tr>
                </thead>
                <tbody>
                  ${deviceRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    const old = document.getElementById("deviceStatusModal");
    if (old) old.remove();

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = new bootstrap.Modal(document.getElementById("deviceStatusModal"));
    modal.show();

  } catch (error) {
    console.error("Device popup error:", error);
  }
}


async function showOrganizationPopup() {

  try {

    const organizations = [...(dropdownData.orgs || [])]
            .sort((a, b) => b.ORGANIZATION_ID - a.ORGANIZATION_ID);

    const centres = dropdownData.centres || [];


    let rows = organizations.map(org => {

      const linkedCentres = centres
        .filter(c => c.ORGANIZATION_ID == org.ORGANIZATION_ID);

      const centreNames = linkedCentres.map(c => c.CENTRE_NAME);

      const centreList = centreNames.length > 0
        ? centreNames.join(", ")
        : "No Centres";

          return `
            <tr>
              <td>${org.ORGANIZATION_NAME}</td>
              <td>${centreList}</td>
              <td>${linkedCentres.length}</td>
            </tr>
          `;

    }).join("");

    const modalHtml = `
      <div class="modal fade" id="orgStatusModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Organization & Centres</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
             <!-- 🔍 SEARCH BAR ADD HERE -->
  <div class="input-group mb-3">
    <span class="input-group-text">
      <i class="bi bi-search"></i>
    </span>
    <input type="text"
           class="form-control"
           placeholder="Search..."
           onkeyup="filterPopupTable(this)">
  </div>

              <div class="table-responsive">
                <table class="table table-bordered table-sm">
                  <thead class="table-light">
                 <tr>
                    <th>Organization</th>
                    <th>Centre Names</th>
                    <th>Total Centres</th>
                  </tr>

                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const old = document.getElementById("orgStatusModal");
    if (old) old.remove();

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = new bootstrap.Modal(document.getElementById("orgStatusModal"));
    modal.show();

  } catch (error) {
    console.error("Organization popup error:", error);
  }
}

async function showSensorFullLinkPopup() {

  try {

    const devices = dropdownData.devices || [];
    const sensors = dropdownData.sensors || [];
    const parameters = dropdownData.parameters || [];
    const orgs = dropdownData.orgs || [];
    const centres = dropdownData.centres || [];
    const deviceSensorLinks = [...(dropdownData.devicesensorlink || [])]
         .sort((a, b) => b.id - a.id);

    const sensorParamLinks = dropdownData.sensorparameterlink || [];

let rows = [];

deviceSensorLinks.forEach(link => {

  const device = devices.find(d => d.DEVICE_ID == link.DEVICE_ID);
  if (!device) return;

  const sensor = sensors.find(s => s.SENSOR_ID == link.SENSOR_ID);
  if (!sensor) return;

  // Multiple parameters support
  const relatedParams = sensorParamLinks
      .filter(sp => sp.SENSOR_ID == sensor.SENSOR_ID);

  if (relatedParams.length === 0) {
    rows.push(generateRow(device, sensor, null));
  } else {
    relatedParams.forEach(sp => {
      const parameter = parameters.find(p => p.PARAMETER_ID == sp.PARAMETER_ID);
      rows.push(generateRow(device, sensor, parameter));
    });
  }

});

function generateRow(device, sensor, parameter) {

  const org = orgs.find(o => o.ORGANIZATION_ID == device.ORGANIZATION_ID);
  const centre = centres.find(c => c.CENTRE_ID == device.CENTRE_ID);

  return `
    <tr>
      <td>${device.DEVICE_NAME} (${device.DEVICE_ID})</td>
      <td>${sensor.SENSOR_NAME} (${sensor.SENSOR_ID})</td>
      <td>${parameter ? parameter.PARAMETER_NAME + " (" + parameter.PARAMETER_ID + ")" : "-"}</td>
      <td>${org ? org.ORGANIZATION_NAME + " (" + org.ORGANIZATION_ID + ")" : "-"}</td>
      <td>${centre ? centre.CENTRE_NAME + " (" + centre.CENTRE_ID + ")" : "-"}</td>
    </tr>
  `;
}

rows = rows.join("");


    const modalHtml = `
      <div class="modal fade" id="sensorLinkModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Device-Sensor-Parameter Link View</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">

               <!-- 🔍 SEARCH BAR ADD HERE -->
  <div class="input-group mb-3">
    <span class="input-group-text">
      <i class="bi bi-search"></i>
    </span>
    <input type="text"
           class="form-control"
           placeholder="Search..."
           onkeyup="filterPopupTable(this)">
  </div>
              <div class="table-responsive">
                <table class="table table-bordered table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>Device</th>
                      <th>Sensor</th>
                      <th>Parameter</th>
                      <th>Organization</th>
                      <th>Centre</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows || "<tr><td colspan='5' class='text-center'>No Links Found</td></tr>"}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const old = document.getElementById("sensorLinkModal");
    if (old) old.remove();

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = new bootstrap.Modal(document.getElementById("sensorLinkModal"));
    modal.show();

  } catch (error) {
    console.error("Sensor link popup error:", error);
  }
}

async function showParameterPopup(){

  try{

    const parameters = [...(dropdownData.parameters || [])]
      .sort((a,b)=>b.PARAMETER_ID - a.PARAMETER_ID);

    const uoms = dropdownData.uoms || [];

    let rows = parameters.map(p=>{

      const uom = uoms.find(u=>u.UOM_ID == p.UOM_ID);

      return `
        <tr>
          <td>${p.PARAMETER_NAME} (${p.PARAMETER_ID})</td>
          <td>${uom ? uom.UOM_NAME : "-"}</td>
          <td>${p.LOWER_THRESHOLD ?? "-"}</td>
          <td>${p.UPPER_THRESHOLD ?? "-"}</td>
          <td>${p.THRESHOLD ?? "-"}</td>
        </tr>
      `;
    }).join("");

    const modalHtml = `
      <div class="modal fade" id="parameterPopupModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Parameter Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">

              <div class="input-group mb-3">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input type="text"
                       class="form-control"
                       placeholder="Search Parameter..."
                       onkeyup="filterPopupTable(this)">
              </div>

              <div class="table-responsive">
                <table class="table table-bordered table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>Parameter</th>
                      <th>UOM</th>
                      <th>Lower Threshold</th>
                      <th>Upper Threshold</th>
                      <th>Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows || "<tr><td colspan='6' class='text-center'>No Parameters Found</td></tr>"}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const old = document.getElementById("parameterPopupModal");
    if(old) old.remove();

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = new bootstrap.Modal(document.getElementById("parameterPopupModal"));
    modal.show();

  }catch(error){
    console.error("Parameter popup error:", error);
  }
}


function filterPopupTable(input) {

  const filter = input.value.toLowerCase();
  const table = input.closest(".modal-body").querySelector("table");
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });

}

function loadDeviceSensorParameterMaster() {

  currentTable = "devicesensorparameterlink";

  const devices = dropdownData.devices || [];
  const sensors = dropdownData.sensors || [];
  const parameters = dropdownData.parameters || [];
  const orgs = dropdownData.orgs || [];
  const centres = dropdownData.centres || [];
  const deviceSensorLinks = [...(dropdownData.devicesensorlink || [])]
    .sort((a, b) => b.id - a.id);

  const sensorParamLinks = dropdownData.sensorparameterlink || [];

  const tableEl = document.getElementById("mainTable");
  const thead = tableEl.querySelector("thead");
  const tbody = tableEl.querySelector("tbody");

  document.getElementById("tableTitle").innerText =
    "Device Sensor Parameter Link";

  thead.innerHTML = `
    <tr>
      <th>S_NO</th>
      <th>Device</th>
      <th>Sensor</th>
      <th>Parameter</th>
      <th>Organization</th>
      <th>Centre</th>
      <th>Actions</th>
    </tr>
  `;

  const rows = deviceSensorLinks.map((link, index) => {

  const device = devices.find(d => d.DEVICE_ID == link.DEVICE_ID);
  const sensor = sensors.find(s => s.SENSOR_ID == link.SENSOR_ID);

  const relatedParams = sensorParamLinks
    .filter(sp => sp.SENSOR_ID == link.SENSOR_ID);

  let paramDisplay = "-";
  let firstParamId = "";

  if (relatedParams.length > 0) {
    paramDisplay = relatedParams.map(sp => {
      const p = parameters.find(pp => pp.PARAMETER_ID == sp.PARAMETER_ID);
      return p ? `${p.PARAMETER_NAME} (${p.PARAMETER_ID})` : "";
    }).join(", ");

    // 🔥 IMPORTANT: edit ke liye first parameter store karo
    firstParamId = relatedParams[0].PARAMETER_ID;
  }

  const org = orgs.find(o =>
    o.ORGANIZATION_ID == device?.ORGANIZATION_ID
  );

  const centre = centres.find(c =>
    c.CENTRE_ID == device?.CENTRE_ID
  );

  return `
    <tr>
      <td>${index + 1}</td>
      <td>${device ? device.DEVICE_NAME + " (" + device.DEVICE_ID + ")" : "-"}</td>
      <td>${sensor ? sensor.SENSOR_NAME + " (" + sensor.SENSOR_ID + ")" : "-"}</td>
      <td>${paramDisplay}</td>
      <td>${org ? org.ORGANIZATION_NAME + " (" + org.ORGANIZATION_ID + ")" : "-"}</td>
      <td>${centre ? centre.CENTRE_NAME + " (" + centre.CENTRE_ID + ")" : "-"}</td>

      <td>
        <button class="btn btn-sm btn-warning"
          onclick='editRow(${JSON.stringify({
            id: link.id,
            DEVICE_ID: link.DEVICE_ID,
            SENSOR_ID: link.SENSOR_ID,
            PARAMETER_ID: firstParamId
          })})'>
          <i class="bi bi-pencil"></i>
        </button>

        <button class="btn btn-sm btn-danger"
          onclick="deleteRow(${link.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `;
}).join("");


  tbody.innerHTML = rows;

  document.getElementById("addBtn").style.display = "inline-block";
}

/* ============================================================
   🚀 INITIALIZATION
   - DOMContentLoaded
   - Initial dropdown load
   - Initial summary load
   ============================================================ */

// ===== init =====
document.addEventListener("DOMContentLoaded", async () => {
  await loadDropdowns();
  updateSummary();
});
