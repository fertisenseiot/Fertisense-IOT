/* ============================================================
   🌍 BASE CONFIGURATION
   ============================================================ */
const BASE_URL = "http://127.0.0.1:8000"; // direct IP
// const BASE_URL = "https://fertisense-iot-production.up.railway.app"; 

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
  devicereadinglog:    BASE_URL + "/api/devicereadinglog/",
  devicealarmlog:      BASE_URL + "/api/devicealarmlog/",
  devicealarmcalllog:  BASE_URL + "/api/devicealarmcalllog/",
  sensorparameterlink: BASE_URL + "/api/sensorparameterlink/",
  devicesensorlink:    BASE_URL + "/api/devicesensorlink/",
  compassdates:        BASE_URL + "/api/compassdates/",
  userorganizationcentrelink: BASE_URL + "/api/userorganizationcentrelink/",
  masternotificationtime: BASE_URL + "/api/masternotificationtime/",
  mastersubscriptioninfo: BASE_URL +"/api/mastersubscriptioninfo/",
  masterplantype: BASE_URL +"/api/masterplantype/",
  mastersubscriptionhistory: BASE_URL +"/api/subscriptionhistory/",
};

const HEADER_LABELS = {
  ORGANIZATION_ID: "ORGANIZATION NAME", DEVICE_ID: "DEVICE NAME", Device_ID: "DEVICE NAME",
  CENTRE_ID: "CENTRE NAME", SENSOR_ID: "SENSOR NAME", PARAMETER_ID: "PARAMETER NAME",
  ROLE_ID: "ROLE NAME", UOM_ID: "UNIT", USER_ID: "USER NAME", CATEGORY_ID: "CATEGORY NAME",
  Subscription_ID:"Subscription_Name", Plan_ID:"Plan_Name", IS_HARDWARE_PAYMENT_DONE: "HW PAYMENT"
};

const PRIMARY_KEYS = {
  masterorganizations: "ORGANIZATION_ID", mastercentre: "CENTRE_ID", masterdevices: "DEVICE_ID",
  mastersensor: "SENSOR_ID", masterparameter: "PARAMETER_ID", masteruom: "UOM_ID",
  createuser: "USER_ID", masterrole: "ROLE_ID", seuser: "USER_ID", devicereadinglog: "ID",
  devicealarmlog: "id", devicealarmcalllog: "ID", sensorparameterlink: "id", devicesensorlink: "id",
  compassdates: "ID", centreorganizationlink: "id", userorganizationcentrelink: "id",
  masternotificationtime: "id", devicescategory: "CATEGORY_ID", mastersubscriptioninfo: "Subscription_ID",
  masterplantype: "Plan_ID", mastersubscriptionhistory: "id"
};

const FIELD_SCHEMAS = {
  masterorganizations: ["ORGANIZATION_ID","ORGANIZATION_NAME"], mastercentre: ["CENTRE_ID","ORGANIZATION_ID","CENTRE_NAME"],
  masterdevices: ["DEVICE_ID","DEVICE_NAME","DEVICE_IP","ORGANIZATION_ID","CENTRE_ID","DEVICE_STATUS","IS_HARDWARE_PAYMENT_DONE"],
  mastersensor: ["SENSOR_ID","SENSOR_NAME","SENSOR_TYPE","UOM_ID"], masterparameter: ["PARAMETER_ID","PARAMETER_NAME","UOM_ID","LOWER_THRESHOLD","UPPER_THRESHOLD","THRESHOLD"],
  masteruom: ["UOM_ID","UOM_NAME","SYMBOL"], createuser: ["USER_ID","ACTUAL_NAME","USERNAME","ROLE_ID","PHONE","SEND_SMS","EMAIL","SEND_EMAIL","PASSWORD","confirm_password","VALIDITY_START","VALIDITY_END"],
  masterrole: ["ROLE_ID","ROLE_NAME"], devicereadinglog: ["ID","DEVICE_ID","SENSOR_ID","PARAMETER_ID","READING","RAISED_TIME"],
  devicealarmlog: ["ID","DEVICE_ID","SENSOR_ID","PARAMETER_ID","MESSAGE","RAISED_TIME"], devicealarmcalllog: ["ID","ALARM_ID","CALLED_AT","STATUS"],
  sensorparameterlink: ["ID","SENSOR_ID","PARAMETER_ID"], devicesensorlink: ["ID","DEVICE_ID","SENSOR_ID"],
  compassdates: ["ID","ORGANIZATION_ID","BRANCH_ID","CMPS_DT"], userorganizationcentrelink: ["USER_ID","ORGANIZATION_ID","CENTRE_ID"],
  masternotificationtime: ["NOTIFICATION_TIME","ORGANIZATION_ID"], devicescategory:["CATEGORY_ID","CATEGORY_NAME"],
  mastersubscriptioninfo:["Subscription_ID","Package_Name"], masterplantype:["Plan_ID","Plan_Name"],
  mastersubscriptionhistory:["id","Device_ID","Subscription_Start_date","Subcription_End_date","Subscription_ID","Plan_ID","Payment_Date","Status"]
};

function normalizeKey(name){ return name.replace(/\s+/g,"").toLowerCase(); }
async function fetchJSON(url){ const res = await fetch(url); if(!res.ok){ throw new Error(`${res.status} ${res.statusText} -> ${url}`); } return res.json(); }
function logout(){ fetch('/logout/').then(()=>window.location='/login/'); }
function formatTitle(table) {
  if (!table) return ""; let t = table;
  if (/^master/i.test(t)) t = t.replace(/^master/i, "Master ");
  if (/^devicescategory/i.test(t)) t = t.replace(/^devicescategory/i, "Device Category ");
  if (/^devicesensorlink/i.test(t)) t = t.replace(/^devicesensorlink/i, "Device Senor Link");
  if (/^sensorparameterlink/i.test(t)) t = t.replace(/^sensorparameterlink/i, "Sensor Parameter Link");
  if (/^userorganizationcentrelink/i.test(t)) t = t.replace(/^userorganizationcentrelink/i, "User Organization Centre Link");
  t = t.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return t.replace(/\b\w+/g, word => word.toUpperCase() === word ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).trim();
}

let currentTable="", currentData=[], dropdownData={}, dropdownLoaded = false; 

async function loadDropdowns(){
  if (dropdownLoaded) return; 
  try{
    const [orgs, centres, uoms, devices, sensors, parameters, roles, users, categories, subsInfo, planType, subsHistory, deviceSensor, sensorParam, userOrgCentre] = await Promise.all([
      fetchJSON(API.masterorganizations), fetchJSON(API.mastercentre), fetchJSON(API.masteruom), fetchJSON(API.masterdevices), fetchJSON(API.mastersensor), fetchJSON(API.masterparameter),
      fetchJSON(API.masterrole), fetchJSON(API.createuser), fetchJSON(API.devicescategory), fetchJSON(API.mastersubscriptioninfo), fetchJSON(API.masterplantype), fetchJSON(API.mastersubscriptionhistory),
      fetchJSON(API.devicesensorlink), fetchJSON(API.sensorparameterlink), fetchJSON(API.userorganizationcentrelink)
    ]);
    dropdownData = {orgs, centres, uoms, devices, sensors, parameters, roles, user:users, devicescategory:categories, mastersubscriptioninfo:subsInfo, masterplantype:planType, mastersubscriptionhistory:subsHistory, devicesensorlink:deviceSensor, sensorparameterlink:sensorParam, userorganizationcentrelink:userOrgCentre};
    dropdownLoaded = true; 
  }catch(err){}
}

function populateUserDropdown(){
  const sel = document.getElementById("userSelect"); if(!sel) return; sel.innerHTML = `<option value="">-- Select User --</option>`;
  (dropdownData.user || []).forEach(u => sel.innerHTML += `<option value="${u.USER_ID}">${u.USERNAME}</option>`);
}

function sortDescending(table, data) {
  if (!data || data.length === 0) return data;
  if (table === "mastersubscriptionhistory") return data[0].id ? data.sort((a,b)=>b.id-a.id) : data.sort((a,b)=>new Date(b.Subscription_Start_date)-new Date(a.Subscription_Start_date));
  const dateKeys = Object.keys(data[0]).filter(k => k.toLowerCase().includes("date") || k.toLowerCase().includes("time"));
  if (dateKeys.length) return data.sort((a,b)=>new Date(b[dateKeys[0]])-new Date(a[dateKeys[0]]));
  const numberKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number" || !isNaN(Number(data[0][k])));
  if (numberKeys.length) return data.sort((a,b)=>Number(b[numberKeys[0]])-Number(a[numberKeys[0]]));
  return data; 
}

function calculateSubscriptionStatus(row) {
  const today = new Date(); today.setHours(0,0,0,0); const start = new Date(row.Subscription_Start_date); start.setHours(0,0,0,0);
  const end = row.Subcription_End_date ? new Date(row.Subcription_End_date) : null; if(end) end.setHours(0,0,0,0);
  return (end && end < today) ? "Expired" : (start > today ? "Future" : "Active");
}

/* ============================================================
   📊 MAIN TABLE LOADER
   ============================================================ */
async function loadTable(table) {
  history.pushState(null, "", location.pathname + "#" + normalizeKey(table));
  document.getElementById("graphSection").style.display = "none";
  currentTable = normalizeKey(table);

  if (currentTable === "devicereadinglog") {
    document.getElementById("mainTable").style.display = "none";
    try { currentData = await fetchJSON(API.devicereadinglog); } catch (err) { currentData = []; }
    renderDeviceReadingGraphSection();
    return;
  } else { document.getElementById("mainTable").style.display = "table"; }

  if (!API[currentTable]) return;
  document.getElementById('tableTitle').innerText = formatTitle(table) + " Directory";

  // 🔥 Completely hide "Add New" button for device reading logs and restricted tables
  const restrictedAddTables = ["devicealarmlog", "devicealarmcalllog", "compassdates", "mastersensor", "devicesensorlink", "sensorparameterlink", "devicereadinglog"];
  document.getElementById("addBtn").style.display = restrictedAddTables.includes(currentTable) ? "none" : "inline-block";

  try {
    currentData = await fetchJSON(API[currentTable]);
    currentData = sortDescending(currentTable, currentData);
  } catch (err) { currentData = []; }

  const tableEl = document.getElementById('mainTable');
  const thead = tableEl.querySelector('thead'); const tbody = tableEl.querySelector('tbody');
  thead.innerHTML = tbody.innerHTML = "";

  let headers = currentData.length ? Object.keys(currentData[0]) : (FIELD_SCHEMAS[currentTable] || []);
  const pk = PRIMARY_KEYS[currentTable] || headers[0];
  if (currentTable === "masterdevices" && !headers.includes("DEVICE_ID")) headers.push("DEVICE_ID");
  if (currentTable === "mastersensor" && !headers.includes("SENSOR_ID")) headers.push("SENSOR_ID");
  if (currentTable === "masterparameter" && !headers.includes("PARAMETER_ID")) headers.push("PARAMETER_ID");

  const displayHeaders = headers.map(h => ["masterorganizations","mastercentre","masterdevices","mastersensor","masterparameter","masteruom","createuser","masterrole","sensorparameterlink","devicesensorlink","userorganizationcentrelink","masternotificationtime","devicescategory","devicealarmlog","devicereadinglog","mastersubscriptioninfo","masterplantype","mastersubscriptionhistory"].includes(currentTable) && h === pk ? "S_NO" : (HEADER_LABELS[h] || h));
  if (currentTable === "masterdevices") displayHeaders.push("DEVICE_ID");
  if (currentTable === "mastersensor") displayHeaders.push("SENSOR_ID");
  if (currentTable === "masterparameter") displayHeaders.push("PARAMETER_ID");

  const noActionTables = ["devicealarmlog", "devicealarmcalllog", "compassdates"];
  thead.innerHTML = `<tr>${displayHeaders.filter((h,i) => headers[i] !== "PASSWORD" && headers[i] !== "DEVICE_STATUS").map(h => `<th>${h}</th>`).join("")}${noActionTables.includes(currentTable) ? "" : "<th>Actions</th>"}</tr>`;

  if (currentData.length) {
    tbody.innerHTML = currentData.map((row, rowIdx) => {
      let computedStatus = currentTable === "mastersubscriptionhistory" ? calculateSubscriptionStatus(row) : null;
      let rowCells = headers.filter(h => h !== "PASSWORD" && h !== "DEVICE_STATUS").map(h => {
        if (currentTable === "mastersubscriptionhistory" && h === "Status") return `<td>${computedStatus}</td>`;
        let cellVal = row[h] ?? "";
        if (h === "SEND_SMS" || h === "SEND_EMAIL") cellVal = (row[h] === true || row[h] === 1 || row[h] === "true") ? "Yes" : "No";
        if (currentTable === "masterdevices" && h === "IS_HARDWARE_PAYMENT_DONE") cellVal = row[h] == 1 ? "Yes" : "No";
        if (h === pk && ["masterorganizations","mastercentre","masterdevices","mastersensor","masterparameter","masteruom","createuser","masterrole","sensorparameterlink","devicesensorlink","userorganizationcentrelink","masternotificationtime","devicescategory","devicereadinglog","devicealarmlog","mastersubscriptioninfo","masterplantype","mastersubscriptionhistory"].includes(currentTable)) return `<td>${rowIdx + 1}</td>`;

        if (h === "ORG_ID" || h === "ORGANIZATION_ID") { const org = (dropdownData.orgs || []).find(o => o.ORGANIZATION_ID == row[h]); cellVal = org ? org.ORGANIZATION_NAME : row[h]; }
        if (h === "CENTRE_ID") { const c = (dropdownData.centres || []).find(c => c.CENTRE_ID == row[h]); cellVal = c ? c.CENTRE_NAME : row[h]; }
        if (h === "CATEGORY_ID") { const cat = (dropdownData.devicescategory || []).find(dc => dc.CATEGORY_ID == row[h]); cellVal = cat ? cat.CATEGORY_NAME : row[h]; }
        if (h === "DEVICE_ID" && currentTable !== "masterdevices") { const d = (dropdownData.devices || []).find(d => d.DEVICE_ID == row[h]); cellVal = d ? d.DEVICE_NAME : row[h]; }
        if (h === "Device_ID") { const d = (dropdownData.devices || []).find(d => d.DEVICE_ID == row[h]); cellVal = d ? d.DEVICE_NAME : row[h]; }
        if (h === "SENSOR_ID" && currentTable !== "mastersensor") { const s = (dropdownData.sensors || []).find(s => s.SENSOR_ID == row[h]); cellVal = s ? s.SENSOR_NAME : row[h]; }
        if (h === "PARAMETER_ID" && currentTable !== "masterparameter") { const p = (dropdownData.parameters || []).find(p => p.PARAMETER_ID == row[h]); cellVal = p ? p.PARAMETER_NAME : row[h]; }
        if (h === "USER_ID") { const u = (dropdownData.user || []).find(u => u.USER_ID == row[h]); cellVal = u ? u.USERNAME : row[h]; }
        if (h === "ROLE_ID") { const r = (dropdownData.roles || []).find(r => r.ROLE_ID == row[h]); cellVal = r ? r.ROLE_NAME : row[h]; }
        if (h === "UOM_ID") { const u = (dropdownData.uoms || []).find(u => u.UOM_ID == row[h]); cellVal = u ? u.UOM_NAME : row[h]; }
        if (h === "Subscription_ID") { const p = (dropdownData.mastersubscriptioninfo || []).find(p => p.Subscription_ID == row[h]); cellVal = p ? p.Package_Name : row[h]; }
        if (h === "Plan_ID") { const p = (dropdownData.masterplantype || []).find(p => p.Plan_ID == row[h]); cellVal = p ? p.Plan_Name : row[h]; }
        if (/^\d{4}-\d{2}-\d{2}$/.test(cellVal)) { cellVal = new Date(cellVal).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" }); }
        return `<td>${cellVal}</td>`;
      }).join("");

      if (currentTable === "masterdevices") rowCells += `<td>${row.DEVICE_ID || ""}</td>`;
      if (currentTable === "mastersensor") rowCells += `<td>${row.SENSOR_ID || ""}</td>`;
      if (currentTable === "masterparameter") rowCells += `<td>${row.PARAMETER_ID || ""}</td>`;

      const idVal = row[pk];

      if (currentTable === "mastersubscriptionhistory") {
        return `<tr class="${computedStatus === 'Expired' ? 'expired-row' : ''}">${rowCells}
          <td>
            <div class="d-flex align-items-center">
              <button class="btn-action edit me-2" onclick='openModal(${JSON.stringify(row)})' title="Edit"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm py-1" style="font-size:0.75rem;" onclick='renew(${row[pk] || row.id})'>Renew</button>
            </div>
          </td>
        </tr>`;
      }
      if (currentTable === "masterdevices") {
        return `<tr class="${row.DEVICE_STATUS === 1 ? '' : 'inactive-row'}">${rowCells}
          <td><div class="d-flex align-items-center"><button class="btn-action edit me-3" onclick='openModal(${JSON.stringify(row)})' title="Edit"><i class="bi bi-pencil"></i></button><label class="switch mb-0"><input type="checkbox" ${row.DEVICE_STATUS === 1 ? "checked" : ""} onchange="toggleActiveStatus(${row.DEVICE_ID}, this)"><span class="slider round"><span class="status-text">${row.DEVICE_STATUS === 1 ? "Active" : "Inactive"}</span></span></label></div></td></tr>`;
      }
      if (currentTable === "mastersensor") {
        return `<tr class="${row.SENSOR_STATUS === 1 ? '' : 'inactive-row'}">${rowCells}
          <td><div class="d-flex align-items-center"><button class="btn-action edit me-3" onclick='openModal(${JSON.stringify(row)})' title="Edit"><i class="bi bi-pencil"></i></button><label class="switch mb-0"><input type="checkbox" ${row.SENSOR_STATUS === 1 ? "checked" : ""} onchange="toggleSensorStatus(${row.SENSOR_ID}, this)"><span class="slider round"><span class="status-text">${row.SENSOR_STATUS === 1 ? "Active" : "Inactive"}</span></span></label></div></td></tr>`;
      }
      return `<tr>${rowCells}${noActionTables.includes(currentTable) ? "" : `
        <td><div class="d-flex align-items-center"><button class="btn-action edit me-2" onclick='openModal(${JSON.stringify(row)})'><i class="bi bi-pencil"></i></button><button class="btn-action delete" onclick='deleteRow(${JSON.stringify(idVal)})'><i class="bi bi-trash"></i></button></div></td>`}</tr>`;
    }).join("");
  } else {
    tbody.innerHTML = `<tr><td colspan="${headers.length + 1}" class="text-center text-muted py-4">No records found</td></tr>`;
  }
}

/* ============================================================
   🧾 SMART CRUD POPUP (Compact Modal + Static Lock)
   ============================================================ */
function addRow(){ openModal({}); }

const autoCapStr = `oninput="if(this.value.length > 0) this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);"`;

async function openModal(row ={}){
  const isEdit = Object.keys(row).length > 0;
  document.getElementById('modalTitle').innerHTML = `<i class="bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-square'} me-2"></i> ${isEdit ? "Edit" : "Add"} Record`;
  document.getElementById('submitBtnText').innerText = isEdit ? `Update Changes` : `Save Record`;

  const fieldsDiv = document.getElementById('modalFields'); fieldsDiv.innerHTML = "";

  if (currentTable === "masterdevices") {
    const today = new Date(); const nextYear = new Date(); nextYear.setFullYear(today.getFullYear() + 1);
    const startStr = today.toISOString().split('T')[0]; const endStr = nextYear.toISOString().split('T')[0];

    let linkedSensorId = "", linkedParamId = "", subPkgId = "", subPlanId = "", subStart = startStr, subEnd = endStr;

    if(isEdit) {
      const dsl = (dropdownData.devicesensorlink || []).find(l => l.DEVICE_ID == row.DEVICE_ID);
      if(dsl) {
        linkedSensorId = dsl.SENSOR_ID;
        const spl = (dropdownData.sensorparameterlink || []).find(l => l.SENSOR_ID == dsl.SENSOR_ID);
        if(spl) linkedParamId = spl.PARAMETER_ID;
      }
      const subs = (dropdownData.mastersubscriptionhistory || []).filter(s => s.Device_ID == row.DEVICE_ID).sort((a,b)=>b.id-a.id);
      if(subs.length > 0) {
        subPkgId = subs[0].Subscription_ID; subPlanId = subs[0].Plan_ID;
        subStart = subs[0].Subscription_Start_date ? subs[0].Subscription_Start_date.split('T')[0] : startStr;
        subEnd = subs[0].Subcription_End_date ? subs[0].Subcription_End_date.split('T')[0] : endStr;
      }
    }

    fieldsDiv.innerHTML = `
      <input type="hidden" name="DEVICE_ID" value="${row.DEVICE_ID ?? ''}">
      
      <div class="col-md-6 mb-1"><label class="form-label">Device Name</label><input type="text" class="form-control" name="DEVICE_NAME" value="${row.DEVICE_NAME ?? ''}" ${autoCapStr} required></div>
      <div class="col-md-6 mb-1"><label class="form-label">Category</label><select class="form-select" name="CATEGORY_ID" required><option value="">Select Category</option>${(dropdownData.devicescategory||[]).map(c=>`<option value="${c.CATEGORY_ID}" ${row.CATEGORY_ID==c.CATEGORY_ID?'selected':''}>${c.CATEGORY_NAME}</option>`).join('')}</select></div>
      <div class="col-md-6 mb-1"><label class="form-label">Organization</label><select class="form-select" name="ORGANIZATION_ID" id="dev_org_select" required><option value="">Select Org</option>${(dropdownData.orgs||[]).map(o=>`<option value="${o.ORGANIZATION_ID}" ${row.ORGANIZATION_ID==o.ORGANIZATION_ID?'selected':''}>${o.ORGANIZATION_NAME}</option>`).join('')}</select></div>
      <div class="col-md-6 mb-1"><label class="form-label">Centre</label><select class="form-select" name="CENTRE_ID" id="dev_centre_select" required><option value="">Select Centre</option>${(dropdownData.centres||[]).filter(c => c.ORGANIZATION_ID == row.ORGANIZATION_ID).map(c=>`<option value="${c.CENTRE_ID}" ${row.CENTRE_ID==c.CENTRE_ID?'selected':''}>${c.CENTRE_NAME}</option>`).join('')}</select></div>
      <div class="col-md-12 mb-1"><label class="form-label">HW Payment Done</label><select class="form-select" name="IS_HARDWARE_PAYMENT_DONE"><option value="1" ${row.IS_HARDWARE_PAYMENT_DONE==1?'selected':''}>Yes</option><option value="0" ${row.IS_HARDWARE_PAYMENT_DONE==0?'selected':''}>No</option></select></div>
      
      <div class="col-12 mt-2 pt-2 border-top"><label class="form-label text-success">Sensor & Parameter Linking</label></div>
      <div class="col-md-6 mb-1">
        <label class="form-label text-muted">Create New Sensor</label>
        <input type="text" class="form-control border-success mb-1" name="NEW_SENSOR_NAME" placeholder="Sensor Name" ${autoCapStr}>
        <input type="text" class="form-control border-success" name="NEW_SENSOR_TYPE" placeholder="Sensor Type (e.g. DHT11)" ${autoCapStr}>
      </div>
      <div class="col-md-6 mb-1">
        <label class="form-label text-muted">OR Pick Existing Sensor</label>
        <select class="form-select border-success mb-2" name="EXISTING_SENSOR_ID"><option value="">-- Choose Existing Sensor --</option>${(dropdownData.sensors||[]).map(s=>`<option value="${s.SENSOR_ID}" ${linkedSensorId==s.SENSOR_ID?'selected':''}>${s.SENSOR_NAME}</option>`).join('')}</select>
        
        <label class="form-label text-success">Link Parameter</label>
        <select class="form-select border-success" name="LINK_PARAMETER_ID"><option value="">-- Select Parameter --</option>${(dropdownData.parameters||[]).map(p=>`<option value="${p.PARAMETER_ID}" ${linkedParamId==p.PARAMETER_ID?'selected':''}>${p.PARAMETER_NAME}</option>`).join('')}</select>
      </div>

      <div class="col-12 mt-2 pt-2 border-top"><label class="form-label text-primary">Assign Subscription</label></div>
      <div class="col-md-6 mb-1"><select class="form-select border-primary" name="Subscription_ID"><option value="">-- Select Package --</option>${(dropdownData.mastersubscriptioninfo||[]).map(p=>`<option value="${p.Subscription_ID}" ${subPkgId==p.Subscription_ID?'selected':''}>${p.Package_Name}</option>`).join('')}</select></div>
      <div class="col-md-6 mb-1"><select class="form-select border-primary" name="Plan_ID"><option value="">-- Select Plan --</option>${(dropdownData.masterplantype||[]).map(p=>`<option value="${p.Plan_ID}" ${subPlanId==p.Plan_ID?'selected':''}>${p.Plan_Name}</option>`).join('')}</select></div>
      <div class="col-md-6 mb-1"><input type="date" class="form-control border-primary" name="VALIDITY_START" value="${subStart}"></div>
      <div class="col-md-6 mb-1"><input type="date" class="form-control border-primary" name="VALIDITY_END" value="${subEnd}"></div>
    `;

    setTimeout(() => {
      const orgSel = document.getElementById('dev_org_select');
      const cenSel = document.getElementById('dev_centre_select');
      if(orgSel && cenSel) {
        orgSel.addEventListener('change', () => {
          cenSel.innerHTML = `<option value="">Select Centre</option>` + (dropdownData.centres||[]).filter(c=>c.ORGANIZATION_ID == orgSel.value).map(c=>`<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`).join('');
        });
      }
    }, 100);

    bootstrap.Modal.getOrCreateInstance(document.getElementById('crudModal'), { backdrop: 'static', keyboard: false }).show();
    return;
  }

  // --- Normal Tables form logic ---
  if (normalizeKey(currentTable) === "devicesensorlink") {
    fieldsDiv.innerHTML = `<input type="hidden" name="id" value="${row?.id ?? ''}">
      <div class="col-12 mb-2"><label class="form-label">DEVICE</label><select class="form-select" name="DEVICE_ID"><option value="">-- Choose Device --</option>${(dropdownData.devices || []).sort((a,b)=>b.DEVICE_ID-a.DEVICE_ID).map(d=>`<option value="${d.DEVICE_ID}" ${row.DEVICE_ID==d.DEVICE_ID?'selected':''}>${d.DEVICE_NAME}</option>`).join("")}</select></div>
      <div class="col-12 mb-2"><label class="form-label">SENSOR</label><select class="form-select" name="SENSOR_ID"><option value="">-- Choose Sensor --</option>${(dropdownData.sensors || []).sort((a,b)=>b.SENSOR_ID-a.SENSOR_ID).map(s=>`<option value="${s.SENSOR_ID}" ${row.SENSOR_ID==s.SENSOR_ID?'selected':''}>${s.SENSOR_NAME}</option>`).join("")}</select></div>`;
  } 
else if (currentTable === "createuser") {
    const d = new Date(); const n = new Date(d); n.setFullYear(d.getFullYear() + 1);
    fieldsDiv.innerHTML = `<input type="hidden" name="USER_ID" value="${row.USER_ID ?? ''}">
      <div class="col-md-6 mb-1"><label class="form-label">Actual Name</label><input type="text" class="form-control" name="ACTUAL_NAME" value="${row.ACTUAL_NAME ?? ''}" ${autoCapStr}></div>
      <div class="col-md-6 mb-1"><label class="form-label">Username</label><input type="text" class="form-control" name="USERNAME" value="${row.USERNAME ?? ''}" ${autoCapStr}></div>
      <div class="col-md-6 mb-1"><label class="form-label">Role</label><select class="form-select" name="ROLE_ID"><option value="">-- Choose Role --</option>${(dropdownData.roles || []).map(r => `<option value="${r.ROLE_ID}" ${(String(r.ROLE_ID) === String(row.ROLE_ID ?? "")) ? "selected" : ""}>${r.ROLE_NAME}</option>`).join("")}</select></div>
      <div class="col-md-6 mb-1"><label class="form-label">Phone</label><input type="text" class="form-control" name="PHONE" value="${row.PHONE ?? ''}"></div>
      <div class="col-md-12 mb-1"><label class="form-label">Email</label><input type="email" class="form-control" name="EMAIL" value="${row.EMAIL ?? ''}"></div>
      <div class="col-12 mb-1 d-flex align-items-center py-1"><div class="form-check me-4"><input class="form-check-input" type="checkbox" name="SEND_SMS" ${row.SEND_SMS ? "checked" : ""}><label class="form-check-label small">Send SMS</label></div><div class="form-check"><input class="form-check-input" type="checkbox" name="SEND_EMAIL" ${row.SEND_EMAIL ? "checked" : ""}><label class="form-check-label small">Send Email</label></div></div>
      <div class="col-md-6 mb-1"><label class="form-label">Password</label><input type="password" class="form-control" id="PASSWORD" name="PASSWORD" value="${row.PASSWORD ?? ''}"></div>
      <div class="col-md-6 mb-1"><label class="form-label">Confirm Password</label><input type="password" class="form-control" id="confirm_password" name="confirm_password" value="${row.PASSWORD ?? ''}"></div>
      <div class="col-md-6 mb-1"><label class="form-label">Validity Start</label><input type="date" class="form-control" name="VALIDITY_START" value="${row.VALIDITY_START ?? d.toISOString().split('T')[0]}"></div>
      <div class="col-md-6 mb-1"><label class="form-label">Validity End</label><input type="date" class="form-control" name="VALIDITY_END" value="${row.VALIDITY_END ?? n.toISOString().split('T')[0]}"></div>`;
  }
  else {
    const schema = currentData.length ? Object.keys(currentData[0]) : (FIELD_SCHEMAS[currentTable] || []);
    const pk = PRIMARY_KEYS[currentTable];
    schema.forEach(key => {
      if((currentTable === "devicesensorlink" && (key === "ORGANIZATION_ID" || key === "CENTRE_ID")) || key === "CREATED_BY" || key === "created_by" || (currentTable === "mastersensor" && key === "SENSOR_STATUS") || (currentTable === "masterdevices" && key === "DEVICE_STATUS") || (currentTable === "mastersubscriptionhistory" && key === "Status")) return;
      if(key === pk){ fieldsDiv.innerHTML += `<input name="${key}" value="${row[key]??''}" hidden>`; return; }

      let field = `<div class="col-12 mb-2"><label class="form-label">${key.replace(/_/g, " ")}</label>`;
      if (key === "ORG_ID" || key === "ORGANIZATION_ID") field += `<select class="form-select" name="${key}"><option value="">Select Organization</option>${(dropdownData.orgs || []).map(o => `<option value="${o.ORGANIZATION_ID}" ${o.ORGANIZATION_ID == (row[key] ?? "") ? 'selected' : ''}>${o.ORGANIZATION_NAME}</option>`).join("")}</select>`;
      else if (key === "CENTRE_ID") field += `<select class="form-select" name="CENTRE_ID"><option value="">Select Centre</option>${(dropdownData.centres || []).map(c => `<option value="${c.CENTRE_ID}" ${c.CENTRE_ID == (row["CENTRE_ID"] || "") ? 'selected' : ''}>${c.CENTRE_NAME}</option>`).join('')}</select>`;
      else if (key === "UOM_ID") field += `<select class="form-select" name="UOM_ID"><option value="">Select UOM</option>${(dropdownData.uoms || []).map(o => `<option value="${o.UOM_ID}" ${(o.UOM_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.UOM_NAME}</option>`).join("")}</select>`;
      else if (key === "DEVICE_ID" || key === "Device_ID") field += `<select class="form-select" name="${key}"><option value="">Select Device</option>${(dropdownData.devices || []).map(o => `<option value="${o.DEVICE_ID}" ${(o.DEVICE_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.DEVICE_NAME}</option>`).join("")}</select>`;
      else if (key === "Subscription_ID") field += `<select class="form-select" name="Subscription_ID"><option value="">Select Package</option>${(dropdownData.mastersubscriptioninfo || []).map(o => `<option value="${o.Subscription_ID}" ${(o.Subscription_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.Package_Name}</option>`).join("")}</select>`;
      else if (key === "Plan_ID") field += `<select class="form-select" name="Plan_ID"><option value="">Select Plan</option>${(dropdownData.masterplantype || []).map(o => `<option value="${o.Plan_ID}" ${(o.Plan_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.Plan_Name}</option>`).join("")}</select>`;
      else if (key === "SENSOR_ID") field += `<select class="form-select" name="SENSOR_ID"><option value="">Select Sensor</option>${(dropdownData.sensors || []).map(o => `<option value="${o.SENSOR_ID}" ${(o.SENSOR_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.SENSOR_NAME}</option>`).join("")}</select>`;
      else if (key === "PARAMETER_ID") field += `<select class="form-select" name="PARAMETER_ID"><option value="">Select Parameter</option>${(dropdownData.parameters || []).map(o => `<option value="${o.PARAMETER_ID}" ${(o.PARAMETER_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.PARAMETER_NAME}</option>`).join("")}</select>`;
      else if (key === "ROLE_ID") field += `<select class="form-select" name="ROLE_ID"><option value="">Select Role</option>${(dropdownData.roles || []).map(r => `<option value="${r.ROLE_ID}" ${(String(r.ROLE_ID) === String(row.ROLE_ID ?? "")) ? "selected" : ""}>${r.ROLE_NAME}</option>`).join("")}</select>`;
      else if (key === "USER_ID") field += `<select class="form-select" name="USER_ID"><option value="">Select User</option>${(dropdownData.user || []).map(u => `<option value="${u.USER_ID}" ${(u.USER_ID == (row[key] ?? "")) ? 'selected' : ''}>${u.USERNAME}</option>`).join("")}</select>`;
      else if (currentTable === "masterdevices" && key === "IS_HARDWARE_PAYMENT_DONE") field += `<select class="form-select" name="IS_HARDWARE_PAYMENT_DONE"><option value="1" ${row[key] == 1 ? "selected" : ""}>Yes</option><option value="0" ${row[key] == 0 ? "selected" : ""}>No</option></select>`;
      else if (key === "CATEGORY_ID") field += `<select class="form-select" name="CATEGORY_ID"><option value="">Select Category</option>${(dropdownData.devicescategory || []).map(dc => `<option value="${dc.CATEGORY_ID}" ${(dc.CATEGORY_ID == (row[key] ?? "")) ? 'selected' : ''}>${dc.CATEGORY_NAME}</option>`).join("")}</select>`;
      else if(key === "SEND_SMS" || key === "SEND_EMAIL") field = `<div class="col-12 mb-2 d-flex align-items-end"><div class="form-check"><input class="form-check-input" type="checkbox" name="${key}" ${row[key] ? "checked" : ""}><label class="form-check-label ms-1">${key.replace("_"," ")}</label></div></div>`;
      else {
        let type="text"; const k = key.toLowerCase();
        if(k.includes("email")) type="email"; else if(k.includes("password")) type="password"; else if(k.includes("validity_start") || k.includes("validity_end")) type="date"; else if(k.includes("date")) type = "date"; else if(k.endsWith("_at") || k.endsWith("_time")) type = "datetime-local"; else if(k.includes("upper")||k.includes("lower")||k.includes("value")||k.includes("threshold")||k.endsWith("_id")) type="number";
        
        field += `<input class="form-control" name="${key}" value="${row[key]??''}" type="${type}" ${type==="number"?'step="any"':''} ${type==="text" ? autoCapStr : ''}>`;
      }
      if(key !== "SEND_SMS" && key !== "SEND_EMAIL") field += `</div>`;
      fieldsDiv.innerHTML += field;
    });
  }

  if (currentTable === "userorganizationcentrelink") {
    const orgDropdown = fieldsDiv.querySelector('select[name="ORG_ID"], select[name="ORGANIZATION_ID"]');
    const centreDropdown = fieldsDiv.querySelector('select[name="CENTRE_ID"]');
    if (orgDropdown && centreDropdown) {
      function updateCentres() {
        centreDropdown.innerHTML = `<option value="">-- Choose Centre --</option>` + (dropdownData.centres || []).filter(c => String(c.ORGANIZATION_ID) === String(orgDropdown.value)).map(c => `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`).join("");
      }
      orgDropdown.addEventListener("change", updateCentres);
      if (row.ORGANIZATION_ID) { updateCentres(); centreDropdown.value = row.CENTRE_ID || ""; }
    }
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById('crudModal'), { backdrop: 'static', keyboard: false }).show();
}

/* ============================================================
   💾 MULTI-API SMART SUBMISSION HANDLER
   ============================================================ */
document.getElementById('crudForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const form = new FormData(this); let payload = {}; form.forEach((v,k)=>payload[k]=v);

  Object.keys(payload).forEach(k => { if (payload[k] === "" || payload[k] === undefined) delete payload[k]; });
  ["SEND_SMS","SEND_EMAIL"].forEach(f => { if(payload[f] !== undefined) payload[f] = payload[f] === "on"; });
  
  const pk = PRIMARY_KEYS[currentTable];
  const id = payload[pk];
  const isEdit = id && id.trim() !== "" ? true : false;
  
  const submitBtn = document.getElementById('submitBtn');
  const originalText = document.getElementById('submitBtnText').innerText;
  submitBtn.disabled = true; document.getElementById('submitBtnText').innerText = "Processing...";

  try {
    if (currentTable === "masterdevices") {
        let devId = id;
        if(!isEdit) {
            let dRes = await fetch(API.masterdevices, { method: 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ DEVICE_NAME: payload.DEVICE_NAME, CATEGORY_ID: payload.CATEGORY_ID, ORGANIZATION_ID: payload.ORGANIZATION_ID, CENTRE_ID: payload.CENTRE_ID, IS_HARDWARE_PAYMENT_DONE: payload.IS_HARDWARE_PAYMENT_DONE, DEVICE_STATUS: 1 }) });
            if(!dRes.ok) throw new Error("Failed to create Device");
            devId = (await dRes.json()).DEVICE_ID;
        } else {
            await fetch(API.masterdevices + id + "/", { method: 'PATCH', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ DEVICE_NAME: payload.DEVICE_NAME, CATEGORY_ID: payload.CATEGORY_ID, ORGANIZATION_ID: payload.ORGANIZATION_ID, CENTRE_ID: payload.CENTRE_ID, IS_HARDWARE_PAYMENT_DONE: payload.IS_HARDWARE_PAYMENT_DONE }) });
        }

        let sensorId = payload.EXISTING_SENSOR_ID;
        if(payload.NEW_SENSOR_NAME) {
            let sRes = await fetch(API.mastersensor, { method: 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ SENSOR_NAME: payload.NEW_SENSOR_NAME.trim(), SENSOR_TYPE: (payload.NEW_SENSOR_TYPE || "").trim(), SENSOR_STATUS: 1 }) });
            if(sRes.ok) { sensorId = (await sRes.json()).SENSOR_ID; }
        }

        if(sensorId) {
            const extDsl = (dropdownData.devicesensorlink||[]).find(l => l.DEVICE_ID == devId);
            if(extDsl) await fetch(API.devicesensorlink + extDsl.id + "/", { method: 'PATCH', headers: {"Content-Type":"application/json"}, body: JSON.stringify({SENSOR_ID: sensorId}) });
            else await fetch(API.devicesensorlink, { method: 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify({DEVICE_ID: devId, SENSOR_ID: sensorId}) });
            
            if(payload.LINK_PARAMETER_ID) {
                const extSpl = (dropdownData.sensorparameterlink||[]).find(l => l.SENSOR_ID == sensorId);
                if(extSpl) await fetch(API.sensorparameterlink + extSpl.id + "/", { method: 'PATCH', headers: {"Content-Type":"application/json"}, body: JSON.stringify({PARAMETER_ID: payload.LINK_PARAMETER_ID}) });
                else await fetch(API.sensorparameterlink, { method: 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify({SENSOR_ID: sensorId, PARAMETER_ID: payload.LINK_PARAMETER_ID}) });
            }
        }

        if(payload.Subscription_ID && payload.Plan_ID) {
            const extSubs = (dropdownData.mastersubscriptionhistory||[]).filter(s => s.Device_ID == devId).sort((a,b)=>b.id-a.id);
            if(extSubs.length > 0) {
                await fetch(API.mastersubscriptionhistory + extSubs[0].id + "/", { method: 'PATCH', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ Subscription_ID: payload.Subscription_ID, Plan_ID: payload.Plan_ID, Subscription_Start_date: payload.VALIDITY_START, Subcription_End_date: payload.VALIDITY_END }) });
            } else {
                await fetch(API.mastersubscriptionhistory, { method: 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ Device_ID: devId, Subscription_ID: payload.Subscription_ID, Plan_ID: payload.Plan_ID, Subscription_Start_date: payload.VALIDITY_START, Subcription_End_date: payload.VALIDITY_END, Status: "Active", Payment_Date: new Date().toISOString().split('T')[0] }) });
            }
        }
    } 
    else {
        if (currentTable === "userorganizationcentrelink" && (!payload.USER_ID || !payload.ORGANIZATION_ID || !payload.CENTRE_ID)) throw new Error("USER, ORGANIZATION aur CENTRE select karna mandatory hai");
        if (currentTable === "createuser" && isEdit) { delete payload.confirm_password; if (!payload.PASSWORD) delete payload.PASSWORD; }
        if(currentTable === "devicesensorlink"){
            const dev = dropdownData.devices.find(d => d.DEVICE_ID == payload.DEVICE_ID);
            if(dev){ payload.ORGANIZATION_ID = dev.ORGANIZATION_ID; payload.CENTRE_ID = dev.CENTRE_ID; }
        }
        if(!isEdit) delete payload[pk]; 

        const url = isEdit ? API[currentTable] + id + "/" : API[currentTable];
        let res = await fetch(url,{ method: isEdit ? 'PATCH' : 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if(!res.ok) throw new Error("Submission Failed");
    }

    const messageDiv = document.getElementById("crudMessage");
    if(!isEdit) this.reset();
    
    messageDiv.innerText = "Successfully Saved!"; messageDiv.classList.remove("d-none");
    setTimeout(() => { messageDiv.classList.add("d-none"); bootstrap.Modal.getInstance(document.getElementById('crudModal')).hide(); }, 1000);
    
    dropdownLoaded = false; await loadDropdowns(); await loadTable(currentTable); await updateSummary();
  } catch(error) { alert(error.message); console.error(error); } 
  finally { submitBtn.disabled = false; document.getElementById('submitBtnText').innerText = originalText; }
});

/* ============================================================
   🔁 ACTIVE / INACTIVE TOGGLE
   ============================================================ */
function toggleActiveStatus(deviceId, checkbox) {
  const isActive = checkbox.checked; const tr = checkbox.closest("tr"); tr.classList.toggle("inactive-row", !isActive); checkbox.nextElementSibling.querySelector(".status-text").textContent = isActive ? "Active" : "Inactive";
  fetch(`${API.masterdevices}${deviceId}/`, { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ DEVICE_STATUS: isActive ? 1 : 0 }) });
}
function toggleSensorStatus(sensorId, checkbox) {
  const isActive = checkbox.checked; const tr = checkbox.closest("tr"); tr.classList.toggle("inactive-row", !isActive); checkbox.nextElementSibling.querySelector(".status-text").textContent = isActive ? "Active" : "Inactive";
  fetch(`${API.mastersensor}${sensorId}/`, { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ SENSOR_STATUS: isActive ? 1 : 0 }) });
}

/* ============================================================
   🗑 DELETE HANDLER
   ============================================================ */
async function deleteRow(id){
  if(id==null || id===""){ alert("Invalid ID"); return; }
  if(!confirm("Delete this row?")) return;
  try{ const res = await fetch(API[currentTable] + id + "/", { method:'DELETE' }); if(!res.ok){ alert(`Delete failed`); return; } }catch(err){ alert("Delete request failed."); return; }
  await loadTable(currentTable); updateSummary();
}

/* ============================================================
   📈 SUMMARY CARDS
   ============================================================ */
async function updateSummary(){
  if (!dropdownLoaded) await loadDropdowns();
  try {
    document.getElementById('totalDevices').innerText = (dropdownData.devices || []).length;
    document.getElementById('totalParameters').innerText = (dropdownData.parameters || []).length;
    document.getElementById('totalSensors').innerText = (dropdownData.sensors || []).length;
    document.getElementById('totalOrganizations').innerText = (dropdownData.orgs || []).length;
  }catch(e){}
}

/* ============================================================
   📡 POPUP SYSTEM & GRAPHS
   ============================================================ */
async function showDeviceStatusPopup() {
  try {
    const readings = await fetchJSON(API.devicereadinglog);
    const devices = [...(dropdownData.devices || [])].sort((a, b) => b.DEVICE_ID - a.DEVICE_ID);
    const subscriptions = dropdownData.mastersubscriptionhistory || [];
    const packages = dropdownData.mastersubscriptioninfo || [];
    const plans = dropdownData.masterplantype || [];
    const now = new Date();

    let deviceRows = devices.map(device => {
      const deviceReadings = readings.filter(r => r.DEVICE_ID == device.DEVICE_ID);
      let status = "Offline", badgeClass = "bg-danger", lastReadingDisplay = "No Data";

      if (deviceReadings.length > 0) {
        deviceReadings.sort((a, b) => new Date(b.READING_DATE + "T" + b.READING_TIME.split(".")[0]) - new Date(a.READING_DATE + "T" + a.READING_TIME.split(".")[0]));
        const cleanTime = deviceReadings[0].READING_TIME.split(".")[0];
        const lastReadingTime = new Date(deviceReadings[0].READING_DATE + "T" + cleanTime);
        lastReadingDisplay = lastReadingTime.toLocaleString();
        if ((now - lastReadingTime) / (1000 * 60) <= 10) { status = "Online"; badgeClass = "bg-success"; }
      }

      let subName = "No Subscription", validTill = "-", validClass = "bg-secondary";
      const deviceSubs = subscriptions.filter(s => s.Device_ID == device.DEVICE_ID).sort((a, b) => new Date(b.Subscription_Start_date) - new Date(a.Subscription_Start_date));
      if (deviceSubs.length > 0) {
        const pkg = packages.find(p => p.Subscription_ID == deviceSubs[0].Subscription_ID);
        const plan = plans.find(pl => pl.Plan_ID == deviceSubs[0].Plan_ID);
        subName = (pkg ? pkg.Package_Name : "") + (plan ? ` (${plan.Plan_Name})` : "");
        if (deviceSubs[0].Subcription_End_date) {
          const endDate = new Date(deviceSubs[0].Subcription_End_date);
          validTill = endDate.toLocaleDateString("en-GB");
          validClass = endDate < now ? "bg-danger" : "bg-success";
        }
      }

      return `<tr><td>${device.DEVICE_NAME}</td><td><span class="badge ${badgeClass}">${status}</span></td><td>${lastReadingDisplay}</td><td>${subName}</td><td><span class="badge ${validClass}">${validTill}</span></td></tr>`;
    }).join("");

    createSearchablePopup("deviceStatusModal", "Live Device Status (10 Min Rule)", ["Device Name", "Status", "Timestamp", "Subscription", "Valid Till"], deviceRows);
  } catch (e) { console.error(e); }
}

async function showParameterPopup() {
  const sortedParams = [...(dropdownData.parameters || [])].sort((a, b) => b.PARAMETER_ID - a.PARAMETER_ID);
  const rows = sortedParams.map(p => {
    const uom = (dropdownData.uoms || []).find(u => u.UOM_ID == p.UOM_ID);
    return `<tr><td>${p.PARAMETER_NAME} (${p.PARAMETER_ID})</td><td>${uom ? uom.UOM_NAME : "-"}</td><td>${p.LOWER_THRESHOLD ?? "-"}</td><td>${p.UPPER_THRESHOLD ?? "-"}</td><td>${p.THRESHOLD ?? "-"}</td></tr>`;
  }).join("");
  createSearchablePopup("parameterPopupModal", "Parameter Details", ["Parameter", "UOM", "Lower Threshold", "Upper Threshold", "Threshold"], rows);
}

async function showSensorFullLinkPopup() {
  const sortedLinks = [...(dropdownData.devicesensorlink || [])].sort((a, b) => b.id - a.id);
  const rows = sortedLinks.map(link => {
    const dev = (dropdownData.devices || []).find(d => d.DEVICE_ID == link.DEVICE_ID);
    const sens = (dropdownData.sensors || []).find(s => s.SENSOR_ID == link.SENSOR_ID);
    const paramLink = (dropdownData.sensorparameterlink || []).find(pl => pl.SENSOR_ID == link.SENSOR_ID);
    const param = (dropdownData.parameters || []).find(p => p.PARAMETER_ID == paramLink?.PARAMETER_ID);
    const org = (dropdownData.orgs || []).find(o => o.ORGANIZATION_ID == dev?.ORGANIZATION_ID);
    const centre = (dropdownData.centres || []).find(c => c.CENTRE_ID == dev?.CENTRE_ID);

    return `<tr><td>${dev?.DEVICE_NAME || "-"} (${link.DEVICE_ID})</td><td>${sens?.SENSOR_NAME || "-"} (${link.SENSOR_ID})</td><td>${param ? param.PARAMETER_NAME : "-"}</td><td>${org?.ORGANIZATION_NAME || "-"}</td><td>${centre?.CENTRE_NAME || "-"}</td></tr>`;
  }).join("");
  createSearchablePopup("sensorLinkModal", "Device-Sensor-Parameter Link View", ["Device", "Sensor", "Parameter", "Organization", "Centre"], rows);
}

async function showOrganizationPopup() {
  const sortedOrgs = [...(dropdownData.orgs || [])].sort((a, b) => b.ORGANIZATION_ID - a.ORGANIZATION_ID);
  const rows = sortedOrgs.map(org => {
    const centres = (dropdownData.centres || []).filter(c => c.ORGANIZATION_ID == org.ORGANIZATION_ID);
    const centreNames = centres.map(c => c.CENTRE_NAME).join(", ") || "No Centres";
    return `<tr><td>${org.ORGANIZATION_NAME}</td><td>${centreNames}</td><td>${centres.length}</td></tr>`;
  }).join("");
  createSearchablePopup("orgStatusModal", "Organization & Centres", ["Organization", "Centre Names", "Total Centres"], rows);
}

function createSearchablePopup(modalId, title, headers, bodyRows) {
  const old = document.getElementById(modalId); if (old) old.remove();
  const html = `
    <div class="modal fade" id="${modalId}" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-light py-3 px-4">
            <h5 class="modal-title fw-bold text-primary">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="this.blur()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="input-group mb-3">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0 shadow-none" placeholder="Search records..." onkeyup="filterPopupTable(this)">
            </div>
            <div class="table-responsive">
              <table class="table custom-table">
                <thead class="table-light"><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${bodyRows || "<tr><td colspan='100' class='text-center text-muted'>No data available</td></tr>"}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", html);
  new bootstrap.Modal(document.getElementById(modalId), { backdrop: 'static', keyboard: false }).show();
}

function filterPopupTable(input) {
  const filter = input.value.toLowerCase();
  input.closest(".modal-body").querySelectorAll("table tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
}

function renderDeviceReadingGraphSection(){
  const graphSection = document.getElementById("graphSection"); document.getElementById("mainTable").style.display = "none"; document.getElementById("tableTitle").innerText = "User Device Graph"; graphSection.style.display = "block";
  graphSection.innerHTML = `<div class="row mb-3 g-3"><div class="col-md-3"><label class="form-label">Select User</label><select id="userSelect" class="form-select" onchange="handleUserChange()"><option value="">-- Select User --</option></select></div><div class="col-md-3"><label class="form-label">Select Device</label><select id="deviceSelect" class="form-select" onchange="loadUserGraph()"><option value="">-- Select Device --</option></select></div><div class="col-md-3" id="parameterDropdownContainer" style="display:none;"><label class="form-label">Select Parameter</label><select id="parameterSelect" class="form-select" onchange="loadUserGraph()"><option value="">-- Select Parameter --</option></select></div><div class="col-md-3"><label class="form-label">Time Filter</label><select id="timeFilter" class="form-select" onchange="loadUserGraph()"><option value="10">Last 10 Minutes</option><option value="60">Last 1 Hour</option><option value="1440">Last 1 Day</option></select></div></div><div class="graph-container"><canvas id="userChart"></canvas></div>`;
  populateUserDropdown();
}

function handleUserChange(){
  const userId = document.getElementById("userSelect").value;
  const deviceSelect = document.getElementById("deviceSelect");
  deviceSelect.innerHTML = `<option value="">-- Select Device --</option>`;
  if (!userId) return;
  
  const userLinks = (dropdownData.userorganizationcentrelink || []).filter(l => l.USER_ID == userId);
  let matchedDevices = [];

  if (userLinks.length > 0) {
    matchedDevices = (dropdownData.devices || []).filter(d => 
      userLinks.some(l => l.ORGANIZATION_ID == d.ORGANIZATION_ID && (l.CENTRE_ID == d.CENTRE_ID || !l.CENTRE_ID))
    );
  } else {
    matchedDevices = dropdownData.devices || [];
  }

  matchedDevices.forEach(d => {
    deviceSelect.innerHTML += `<option value="${d.DEVICE_ID}">${d.DEVICE_NAME}</option>`;
  });
}

let userChartInstance = null;
async function loadUserGraph(){
  const deviceId = document.getElementById("deviceSelect").value;
  const timeFilter = parseInt(document.getElementById("timeFilter").value);
  const paramContainer = document.getElementById("parameterDropdownContainer");
  const paramSelect = document.getElementById("parameterSelect");

  if (!deviceId) return;

  try {
    const readings = await fetchJSON(API.devicereadinglog);
    const deviceReadings = readings.filter(r => r.DEVICE_ID == deviceId);
    
    const sensorLinks = (dropdownData.devicesensorlink || []).filter(l => l.DEVICE_ID == deviceId);
    const sensorIds = sensorLinks.map(l => l.SENSOR_ID);
    const paramLinks = (dropdownData.sensorparameterlink || []).filter(l => sensorIds.includes(l.SENSOR_ID));
    const paramIds = [...new Set(paramLinks.map(l => l.PARAMETER_ID))];

    const validParams = (dropdownData.parameters || []).filter(p => paramIds.includes(p.PARAMETER_ID));

    if (validParams.length > 1) {
      paramContainer.style.display = "block";
      if (paramSelect.options.length <= 1) {
        paramSelect.innerHTML = `<option value="">-- Select Parameter --</option>` + validParams.map(p => `<option value="${p.PARAMETER_ID}">${p.PARAMETER_NAME}</option>`).join("");
      }
    } else {
      paramContainer.style.display = "none";
    }

    const selectedParamId = paramSelect.value || (validParams.length > 0 ? validParams[0].PARAMETER_ID : null);

    const targetParam = (dropdownData.parameters || []).find(p => p.PARAMETER_ID == selectedParamId);
    const upperLimit = targetParam ? parseFloat(targetParam.UPPER_THRESHOLD) : null;
    const lowerLimit = targetParam ? parseFloat(targetParam.LOWER_THRESHOLD) : null;

    const now = new Date();
    let isOnline = false;
    if (deviceReadings.length > 0) {
      deviceReadings.sort((a, b) => new Date(b.READING_DATE + "T" + b.READING_TIME.split(".")[0]) - new Date(a.READING_DATE + "T" + a.READING_TIME.split(".")[0]));
      const lastTime = new Date(deviceReadings[0].READING_DATE + "T" + deviceReadings[0].READING_TIME.split(".")[0]);
      if ((now - lastTime) / (1000 * 60) <= 10) isOnline = true;
    }

    const filteredReadings = deviceReadings.filter(r => {
      if (selectedParamId && r.PARAMETER_ID != selectedParamId) return false;
      const readingTime = new Date(r.READING_DATE + "T" + r.READING_TIME);
      const diffMins = (now - readingTime) / (1000 * 60);
      return diffMins <= timeFilter;
    }).sort((a, b) => new Date(a.READING_DATE + "T" + a.READING_TIME) - new Date(b.READING_DATE + "T" + b.READING_TIME));

    // 🔥 Clean time format (HH:MM:SS) ignoring milliseconds
    const labels = filteredReadings.map(r => {
      let t = r.READING_TIME || "";
      return t.split(".")[0]; 
    });
    const dataValues = filteredReadings.map(r => parseFloat(r.READING));

    const pointColors = dataValues.map(val => {
      if ((upperLimit !== null && val > upperLimit) || (lowerLimit !== null && val < lowerLimit)) {
        return '#EE5D50'; 
      }
      return isOnline ? '#05CD99' : '#A3AED1'; 
    });

    const ctx = document.getElementById("userChart").getContext("2d");
    if (userChartInstance) userChartInstance.destroy();

    userChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reading Value',
          data: dataValues,
          borderColor: isOnline ? '#05CD99' : '#A3AED1',
          backgroundColor: isOnline ? 'rgba(5, 205, 153, 0.1)' : 'rgba(163, 174, 209, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: pointColors,
          pointRadius: 4,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let val = context.raw;
                let alertText = "";
                if ((upperLimit !== null && val > upperLimit) || (lowerLimit !== null && val < lowerLimit)) {
                  alertText = " ⚠️ [ALERT: Threshold Violated!]";
                }
                return `Reading: ${val}${alertText}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });

  } catch (err) { console.error("Graph load error:", err); }
}

function getDeviceUnit(deviceId){ return ''; }
function getTimeUnit(){ return 'minute'; }

/* ============================================================
   📱 RESPONSIVE SIDEBAR TOGGLE
   ============================================================ */
function toggleSidebar() { document.querySelector('.sidebar').classList.toggle('active'); document.querySelector('.sidebar-overlay').classList.toggle('active'); }
document.querySelectorAll('.sidebar .nav-link:not(.collapsed)').forEach(link => { link.addEventListener('click', () => { if(window.innerWidth < 992) { document.querySelector('.sidebar').classList.remove('active'); document.querySelector('.sidebar-overlay').classList.remove('active'); } }); });

document.addEventListener("DOMContentLoaded", async () => { await loadDropdowns(); populateUserDropdown(); updateSummary(); });
window.addEventListener("hashchange", function() { const table = location.hash.replace("#", ""); if (table) loadTable(table); });
