/* ============================================================
   🌍 BASE CONFIGURATION
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
  masterdevices: ["DEVICE_ID","DEVICE_NAME","DEVICE_IP","CATEGORY_ID","ORGANIZATION_ID","CENTRE_ID","DEVICE_STATUS","IS_HARDWARE_PAYMENT_DONE"],
  mastersensor: ["SENSOR_ID","SENSOR_NAME","SENSOR_TYPE","UOM_ID","SENSOR_STATUS"], masterparameter: ["PARAMETER_ID","PARAMETER_NAME","UOM_ID","LOWER_THRESHOLD","UPPER_THRESHOLD","THRESHOLD"],
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
  if (/^devicesensorlink/i.test(t)) t = t.replace(/^devicesensorlink/i, "Device Sensor Link");
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
  (dropdownData.user || []).forEach(u => sel.innerHTML += `<option value="${u.USER_ID}">${u.USERNAME} (${u.USER_ID})</option>`);
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

  const restrictedAddTables = ["devicealarmlog", "devicealarmcalllog", "compassdates", "devicereadinglog"];
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

        if (h === "ORG_ID" || h === "ORGANIZATION_ID") { const org = (dropdownData.orgs || []).find(o => o.ORGANIZATION_ID == row[h]); cellVal = org ? `${org.ORGANIZATION_NAME} (${org.ORGANIZATION_ID})` : row[h]; }
        if (h === "CENTRE_ID") { const c = (dropdownData.centres || []).find(c => c.CENTRE_ID == row[h]); cellVal = c ? `${c.CENTRE_NAME} (${c.CENTRE_ID})` : row[h]; }
        if (h === "CATEGORY_ID") { const cat = (dropdownData.devicescategory || []).find(dc => dc.CATEGORY_ID == row[h]); cellVal = cat ? `${cat.CATEGORY_NAME} (${cat.CATEGORY_ID})` : (row[h] !== null ? row[h] : "-"); }
        if (h === "DEVICE_ID" && currentTable !== "masterdevices") { const d = (dropdownData.devices || []).find(d => d.DEVICE_ID == row[h]); cellVal = d ? `${d.DEVICE_NAME} (${d.DEVICE_ID})` : row[h]; }
        if (h === "Device_ID") { const d = (dropdownData.devices || []).find(d => d.DEVICE_ID == row[h]); cellVal = d ? `${d.DEVICE_NAME} (${d.DEVICE_ID})` : row[h]; }
        if (h === "SENSOR_ID" && currentTable !== "mastersensor") { const s = (dropdownData.sensors || []).find(s => s.SENSOR_ID == row[h]); cellVal = s ? `${s.SENSOR_NAME} (${s.SENSOR_ID})` : row[h]; }
        if (h === "PARAMETER_ID" && currentTable !== "masterparameter") { const p = (dropdownData.parameters || []).find(p => p.PARAMETER_ID == row[h]); cellVal = p ? `${p.PARAMETER_NAME} (${p.PARAMETER_ID})` : row[h]; }
        if (h === "USER_ID") { const u = (dropdownData.user || []).find(u => u.USER_ID == row[h]); cellVal = u ? `${u.USERNAME} (${u.USER_ID})` : row[h]; }
        if (h === "ROLE_ID") { const r = (dropdownData.roles || []).find(r => r.ROLE_ID == row[h]); cellVal = r ? `${r.ROLE_NAME} (${r.ROLE_ID})` : row[h]; }
        if (h === "UOM_ID") { const u = (dropdownData.uoms || []).find(u => u.UOM_ID == row[h]); cellVal = u ? `${u.UOM_NAME} (${u.UOM_ID})` : row[h]; }
        if (h === "Subscription_ID") { const p = (dropdownData.mastersubscriptioninfo || []).find(p => p.Subscription_ID == row[h]); cellVal = p ? `${p.Package_Name} (${p.Subscription_ID})` : row[h]; }
        if (h === "Plan_ID") { const p = (dropdownData.masterplantype || []).find(p => p.Plan_ID == row[h]); cellVal = p ? `${p.Plan_Name} (${p.Plan_ID})` : row[h]; }
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
   🧾 SMART CRUD POPUP
   ============================================================ */
function addRow(){ openModal({}); }

const autoCapStr = `oninput="if(this.value.length > 0) this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);"`;

async function openModal(row ={}){
  const isEdit = Object.keys(row).length > 0;
  document.getElementById('modalTitle').innerHTML = `<i class="bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-square'} me-2"></i> ${isEdit ? "Edit" : "Add"} Record`;
  document.getElementById('submitBtnText').innerText = isEdit ? `Update Changes` : `Save Record`;

  const fieldsDiv = document.getElementById('modalFields'); fieldsDiv.innerHTML = "";

  // 🔥 MASTER DEVICES MODAL (Ab category wapas included hai)
  if (currentTable === "masterdevices") {
    fieldsDiv.innerHTML = `
      <input type="hidden" name="DEVICE_ID" value="${row.DEVICE_ID ?? ''}">
      
      <div class="col-md-12 mb-2"><label class="form-label">Device Name</label><input type="text" class="form-control" name="DEVICE_NAME" value="${row.DEVICE_NAME ?? ''}" ${autoCapStr} required></div>
      <div class="col-md-6 mb-2"><label class="form-label">Category</label><select class="form-select" name="CATEGORY_ID" required><option value="">Select Category</option>${(dropdownData.devicescategory||[]).map(c=>`<option value="${c.CATEGORY_ID}" ${row.CATEGORY_ID==c.CATEGORY_ID?'selected':''}>${c.CATEGORY_NAME} (${c.CATEGORY_ID})</option>`).join('')}</select></div>
      <div class="col-md-6 mb-2"><label class="form-label">Organization</label><select class="form-select" name="ORGANIZATION_ID" id="dev_org_select" required><option value="">Select Org</option>${(dropdownData.orgs||[]).map(o=>`<option value="${o.ORGANIZATION_ID}" ${row.ORGANIZATION_ID==o.ORGANIZATION_ID?'selected':''}>${o.ORGANIZATION_NAME} (${o.ORGANIZATION_ID})</option>`).join('')}</select></div>
      <div class="col-md-6 mb-2"><label class="form-label">Centre</label><select class="form-select" name="CENTRE_ID" id="dev_centre_select" required><option value="">Select Centre</option>${(dropdownData.centres||[]).filter(c => c.ORGANIZATION_ID == row.ORGANIZATION_ID).map(c=>`<option value="${c.CENTRE_ID}" ${row.CENTRE_ID==c.CENTRE_ID?'selected':''}>${c.CENTRE_NAME} (${c.CENTRE_ID})</option>`).join('')}</select></div>
      <div class="col-md-6 mb-2"><label class="form-label">HW Payment Done</label><select class="form-select" name="IS_HARDWARE_PAYMENT_DONE"><option value="1" ${row.IS_HARDWARE_PAYMENT_DONE==1?'selected':''}>Yes</option><option value="0" ${row.IS_HARDWARE_PAYMENT_DONE==0?'selected':''}>No</option></select></div>
    `;

    setTimeout(() => {
      const orgSel = document.getElementById('dev_org_select');
      const cenSel = document.getElementById('dev_centre_select');
      if(orgSel && cenSel) {
        orgSel.addEventListener('change', () => {
          cenSel.innerHTML = `<option value="">Select Centre</option>` + (dropdownData.centres||[]).filter(c=>c.ORGANIZATION_ID == orgSel.value).map(c=>`<option value="${c.CENTRE_ID}">${c.CENTRE_NAME} (${c.CENTRE_ID})</option>`).join('');
        });
      }
    }, 100);

    bootstrap.Modal.getOrCreateInstance(document.getElementById('crudModal'), { backdrop: 'static', keyboard: false }).show();
    return;
  }

  // --- Normal Tables form logic ---
  if (normalizeKey(currentTable) === "devicesensorlink") {
    fieldsDiv.innerHTML = `<input type="hidden" name="id" value="${row?.id ?? ''}">
      <div class="col-12 mb-2"><label class="form-label">DEVICE</label><select class="form-select" name="DEVICE_ID"><option value="">-- Choose Device --</option>${(dropdownData.devices || []).sort((a,b)=>b.DEVICE_ID-a.DEVICE_ID).map(d=>`<option value="${d.DEVICE_ID}" ${row.DEVICE_ID==d.DEVICE_ID?'selected':''}>${d.DEVICE_NAME} (${d.DEVICE_ID})</option>`).join("")}</select></div>
      <div class="col-12 mb-2"><label class="form-label">SENSOR</label><select class="form-select" name="SENSOR_ID"><option value="">-- Choose Sensor --</option>${(dropdownData.sensors || []).sort((a,b)=>b.SENSOR_ID-a.SENSOR_ID).map(s=>`<option value="${s.SENSOR_ID}" ${row.SENSOR_ID==s.SENSOR_ID?'selected':''}>${s.SENSOR_NAME} (${s.SENSOR_ID})</option>`).join("")}</select></div>`;
  } 
  else if (currentTable === "createuser") {
    const d = new Date(); const n = new Date(d); n.setFullYear(d.getFullYear() + 1);
    fieldsDiv.innerHTML = `<input type="hidden" name="USER_ID" value="${row.USER_ID ?? ''}">
      <div class="col-md-6 mb-1"><label class="form-label">Actual Name</label><input type="text" class="form-control" name="ACTUAL_NAME" value="${row.ACTUAL_NAME ?? ''}" ${autoCapStr}></div>
      <div class="col-md-6 mb-1"><label class="form-label">Username</label><input type="text" class="form-control" name="USERNAME" value="${row.USERNAME ?? ''}" ${autoCapStr}></div>
      <div class="col-md-6 mb-1"><label class="form-label">Role</label><select class="form-select" name="ROLE_ID"><option value="">-- Choose Role --</option>${(dropdownData.roles || []).map(r => `<option value="${r.ROLE_ID}" ${(String(r.ROLE_ID) === String(row.ROLE_ID ?? "")) ? "selected" : ""}>${r.ROLE_NAME} (${r.ROLE_ID})</option>`).join("")}</select></div>
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
      if(key === "CREATED_BY" || key === "created_by" || (currentTable === "mastersensor" && key === "SENSOR_STATUS") || (currentTable === "masterdevices" && key === "DEVICE_STATUS") || (currentTable === "mastersubscriptionhistory" && key === "Status")) return;
      if(key === pk){ fieldsDiv.innerHTML += `<input name="${key}" value="${row[key]??''}" hidden>`; return; }

      let field = `<div class="col-12 mb-2"><label class="form-label">${key.replace(/_/g, " ")}</label>`;
      if (key === "ORG_ID" || key === "ORGANIZATION_ID") field += `<select class="form-select" name="${key}"><option value="">Select Organization</option>${(dropdownData.orgs || []).map(o => `<option value="${o.ORGANIZATION_ID}" ${o.ORGANIZATION_ID == (row[key] ?? "") ? 'selected' : ''}>${o.ORGANIZATION_NAME} (${o.ORGANIZATION_ID})</option>`).join("")}</select>`;
      else if (key === "CENTRE_ID") field += `<select class="form-select" name="CENTRE_ID"><option value="">Select Centre</option>${(dropdownData.centres || []).map(c => `<option value="${c.CENTRE_ID}" ${c.CENTRE_ID == (row["CENTRE_ID"] || "") ? 'selected' : ''}>${c.CENTRE_NAME} (${c.CENTRE_ID})</option>`).join('')}</select>`;
      else if (key === "UOM_ID") field += `<select class="form-select" name="UOM_ID"><option value="">Select UOM</option>${(dropdownData.uoms || []).map(o => `<option value="${o.UOM_ID}" ${(o.UOM_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.UOM_NAME} (${o.UOM_ID})</option>`).join("")}</select>`;
      else if (key === "DEVICE_ID" || key === "Device_ID") field += `<select class="form-select" name="${key}"><option value="">Select Device</option>${(dropdownData.devices || []).map(o => `<option value="${o.DEVICE_ID}" ${(o.DEVICE_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.DEVICE_NAME} (${o.DEVICE_ID})</option>`).join("")}</select>`;
      else if (key === "Subscription_ID") field += `<select class="form-select" name="Subscription_ID"><option value="">Select Package</option>${(dropdownData.mastersubscriptioninfo || []).map(o => `<option value="${o.Subscription_ID}" ${(o.Subscription_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.Package_Name} (${o.Subscription_ID})</option>`).join("")}</select>`;
      else if (key === "Plan_ID") field += `<select class="form-select" name="Plan_ID"><option value="">Select Plan</option>${(dropdownData.masterplantype || []).map(o => `<option value="${o.Plan_ID}" ${(o.Plan_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.Plan_Name} (${o.Plan_ID})</option>`).join("")}</select>`;
      else if (key === "SENSOR_ID") field += `<select class="form-select" name="SENSOR_ID"><option value="">Select Sensor</option>${(dropdownData.sensors || []).map(o => `<option value="${o.SENSOR_ID}" ${(o.SENSOR_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.SENSOR_NAME} (${o.SENSOR_ID})</option>`).join("")}</select>`;
      else if (key === "PARAMETER_ID") field += `<select class="form-select" name="PARAMETER_ID"><option value="">Select Parameter</option>${(dropdownData.parameters || []).map(o => `<option value="${o.PARAMETER_ID}" ${(o.PARAMETER_ID == (row[key] ?? "")) ? 'selected' : ''}>${o.PARAMETER_NAME} (${o.PARAMETER_ID})</option>`).join("")}</select>`;
      else if (key === "ROLE_ID") field += `<select class="form-select" name="ROLE_ID"><option value="">Select Role</option>${(dropdownData.roles || []).map(r => `<option value="${r.ROLE_ID}" ${(String(r.ROLE_ID) === String(row.ROLE_ID ?? "")) ? "selected" : ""}>${r.ROLE_NAME} (${r.ROLE_ID})</option>`).join("")}</select>`;
      else if (key === "USER_ID") field += `<select class="form-select" name="USER_ID"><option value="">Select User</option>${(dropdownData.user || []).map(u => `<option value="${u.USER_ID}" ${(u.USER_ID == (row[key] ?? "")) ? 'selected' : ''}>${u.USERNAME} (${u.USER_ID})</option>`).join("")}</select>`;
      else if (currentTable === "masterdevices" && key === "IS_HARDWARE_PAYMENT_DONE") field += `<select class="form-select" name="IS_HARDWARE_PAYMENT_DONE"><option value="1" ${row[key] == 1 ? "selected" : ""}>Yes</option><option value="0" ${row[key] == 0 ? "selected" : ""}>No</option></select>`;
      else if (key === "CATEGORY_ID") field += `<select class="form-select" name="CATEGORY_ID"><option value="">Select Category</option>${(dropdownData.devicescategory || []).map(dc => `<option value="${dc.CATEGORY_ID}" ${(dc.CATEGORY_ID == (row[key] ?? "")) ? 'selected' : ''}>${dc.CATEGORY_NAME} (${dc.CATEGORY_ID})</option>`).join("")}</select>`;
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

  bootstrap.Modal.getOrCreateInstance(document.getElementById('crudModal'), { backdrop: 'static', keyboard: false }).show();
}

/* ============================================================
   💾 SUBMISSION HANDLER
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
        if(!isEdit) {
            let dRes = await fetch(API.masterdevices, { method: 'POST', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ DEVICE_NAME: payload.DEVICE_NAME, CATEGORY_ID: payload.CATEGORY_ID, ORGANIZATION_ID: payload.ORGANIZATION_ID, CENTRE_ID: payload.CENTRE_ID, IS_HARDWARE_PAYMENT_DONE: payload.IS_HARDWARE_PAYMENT_DONE, DEVICE_STATUS: 1 }) });
            if(!dRes.ok) throw new Error("Failed to create Device");
        } else {
            let dRes = await fetch(API.masterdevices + id + "/", { method: 'PATCH', headers: {"Content-Type":"application/json"}, body: JSON.stringify({ DEVICE_NAME: payload.DEVICE_NAME, CATEGORY_ID: payload.CATEGORY_ID, ORGANIZATION_ID: payload.ORGANIZATION_ID, CENTRE_ID: payload.CENTRE_ID, IS_HARDWARE_PAYMENT_DONE: payload.IS_HARDWARE_PAYMENT_DONE }) });
            if(!dRes.ok) throw new Error("Failed to update Device");
        }
    } 
    else {
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
   🔁 STATUS TOGGLES & UTILS
   ============================================================ */
function toggleActiveStatus(deviceId, checkbox) {
  const isActive = checkbox.checked; const tr = checkbox.closest("tr"); tr.classList.toggle("inactive-row", !isActive); checkbox.nextElementSibling.querySelector(".status-text").textContent = isActive ? "Active" : "Inactive";
  fetch(`${API.masterdevices}${deviceId}/`, { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ DEVICE_STATUS: isActive ? 1 : 0 }) });
}
function toggleSensorStatus(sensorId, checkbox) {
  const isActive = checkbox.checked; const tr = checkbox.closest("tr"); tr.classList.toggle("inactive-row", !isActive); checkbox.nextElementSibling.querySelector(".status-text").textContent = isActive ? "Active" : "Inactive";
  fetch(`${API.mastersensor}${sensorId}/`, { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ SENSOR_STATUS: isActive ? 1 : 0 }) });
}

async function deleteRow(id){
  if(id==null || id===""){ alert("Invalid ID"); return; }
  if(!confirm("Delete this row?")) return;
  try{ const res = await fetch(API[currentTable] + id + "/", { method:'DELETE' }); if(!res.ok){ alert(`Delete failed`); return; } }catch(err){ alert("Delete request failed."); return; }
  await loadTable(currentTable); updateSummary();
}

async function updateSummary(){
  if (!dropdownLoaded) await loadDropdowns();
  try {
    document.getElementById('totalDevices').innerText = (dropdownData.devices || []).length;
    document.getElementById('totalParameters').innerText = (dropdownData.parameters || []).length;
    document.getElementById('totalSensors').innerText = (dropdownData.sensors || []).length;
    document.getElementById('totalOrganizations').innerText = (dropdownData.orgs || []).length;
  }catch(e){}
}

document.addEventListener("DOMContentLoaded", async () => { await loadDropdowns(); populateUserDropdown(); updateSummary(); });
window.addEventListener("hashchange", function() { const table = location.hash.replace("#", ""); if (table) loadTable(table); });
