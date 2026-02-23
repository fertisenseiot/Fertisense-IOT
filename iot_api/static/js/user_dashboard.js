/* ============================================================
   USER DASHBOARD MAIN SCRIPT
   ------------------------------------------------------------
   Handles:
   - API configuration
   - Organization & Centre loading
   - Device summary & status
   - Live graph rendering (Chart.js)
   - Alarm handling
   - User management (Create, Link)
   - Role-based UI control
   ============================================================ */


 /* ===============================
   BASE URL CONFIGURATION
   =============================== */
  
//const BASE_URL = "https://fertisense-iot-production.up.railway.app";
 const BASE_URL ="http://127.0.0.1:8000";

// API Endpoints Mapping
 const API = {
  masterorganizations: BASE_URL + "/api/masterorganization/",
  mastercentre: BASE_URL + "/api/mastercentre/",
  devicecategory: BASE_URL + "/api/devicecategory/",
  masterDevices: BASE_URL + "/api/masterdevice/",
  devicereadinglog: BASE_URL + "/api/devicereadinglog/",
  devicealarmlog: BASE_URL + "/api/devicealarmlog/",
  userorganizationcentrelinks: BASE_URL + "/api/userorganizationcentrelink/",
  userorganizationcentrelink: BASE_URL + "/api/userorgcentre/",
  masteruom: BASE_URL + "/api/masteruom/",
  createuser: BASE_URL+"/api/masteruser/",
  masterparameter: BASE_URL + "/api/masterparameter/",
  devicestatusalarmlog: BASE_URL + "/api/devicestatusalarmlog"
};

/* ===============================
   GLOBAL STATE VARIABLES
   =============================== */

// Cached data to reduce API calls
window.cache = {
  masterparameter: null,
  masteruom: null,
  centreReadings: {},   // centreId → readings[]
  deviceReadings: {},   // deviceId → readings[]
  deviceAlarms: {},
  deviceStatusAlarms: {}
}; //for fast opening 1

// 🔥 Hide navbar labels until correct user loads
document.addEventListener("DOMContentLoaded", function () {

    const orgLabel = document.getElementById("navbarOrgLabel");
    const centreLabel = document.getElementById("navbarCentreLabel");

    if (orgLabel) orgLabel.style.display = "none";
    if (centreLabel) centreLabel.style.display = "none";

});

let centreData=[], allDevices=[], allCategories=[], currentCentreId=null, currentUser=null;
let editingUserId = null;
let currentCategoryId=null, liveUpdateInterval=null;
window.currentDeviceGraphDeviceId = null;
let graphRangeMinutes = 1440;   // default = 1 day
window.currentGraphParameterId = null;   // incubator ke liye active parameter

/* ============================================================
   LOAD ORGANIZATIONS FOR CURRENT USER
   - Fetch logged-in user
   - Fetch allowed org-centre links
   - Populate organization dropdown
   - Auto-load first allowed centre
   - Update navbar labels
   ============================================================ */
// ------------- LOAD DATA -------------

async function loadOrganizations(){
  try{
const userRes = await fetch(BASE_URL + "/api/currentuser/", {
  credentials: "include"
});
currentUser = await userRes.json();

   
    if (!currentUser || !currentUser.USER_ID) {
    console.error("❌ currentUser not ready", currentUser);
    return;
} // added on saturday

    const linkRes = await fetch(API.userorganizationcentrelink, {
    credentials: "include"
});

    const userLinks = await linkRes.json();
    if (!Array.isArray(userLinks)) {
  console.error("❌ userorgcentre API failed", userLinks);
  return;   // ⛔ yahin function stop
}
    const allowedOrgIds = userLinks.map(l => l.ORGANIZATION_ID);

    const res = await fetch(API.masterorganizations);
    const orgs = await res.json();
    const orgSelect = document.getElementById("organizationSelect");
    orgSelect.innerHTML = '<option value="">Select Organization</option>';
    orgs.filter(o => allowedOrgIds.includes(o.ORGANIZATION_ID))
        .forEach(o => orgSelect.innerHTML += `<option value="${o.ORGANIZATION_ID}">${o.ORGANIZATION_NAME}</option>`);
    
    if(userLinks.length>0){
      orgSelect.value = userLinks[0].ORGANIZATION_ID;
      await loadCentres(orgSelect.value, true, userLinks[0].CENTRE_ID);
    }

    // ⭐ NAVBAR ORGANIZATION LABEL UPDATE
try {
    const orgLabel = document.getElementById("navbarOrgName");
    const orgWrapper = document.getElementById("navbarOrgLabel");

    if (orgWrapper) orgWrapper.style.display = "block";

    const selectedOrg = orgs.find(o => o.ORGANIZATION_ID == orgSelect.value);

    if (selectedOrg && orgLabel) {
        orgLabel.innerText = "Organization: " + selectedOrg.ORGANIZATION_NAME;
    }
} catch(e){console.log(e);}

// ⭐ set navbar org + centre finally
if (userLinks.length > 0) {

    const orgName =
        orgs.find(o => o.ORGANIZATION_ID == userLinks[0].ORGANIZATION_ID)?.ORGANIZATION_NAME || "";

    const centreName =
        centreData.find(c => c.CENTRE_ID == userLinks[0].CENTRE_ID)?.CENTRE_NAME || "";

    setNavbarOrgCentre(orgName, centreName);

    // 🔥 ROLE BASED CENTRE UI APPLY
    applyCentreRoleUI(currentUser, centreData);
}

  }catch(err){ console.error(err);}
}

/* ============================================================
   LOAD CENTRES BASED ON SELECTED ORGANIZATION
   - Filters centre list
   - Auto-select user default centre
   - Updates navbar centre name
   ============================================================ */

async function loadCentres(orgId, auto = false, userCentreId = null) {
  const centreSelect = document.getElementById("centreSelect");
  centreSelect.innerHTML = '<option value="">Select Centre</option>';
  if (!orgId) return;

  try {
    if (!centreData.length) {
      const res = await fetch(API.mastercentre);
      centreData = await res.json();
    }

    let filtered = centreData.filter(c => c.ORGANIZATION_ID == orgId);

    filtered.forEach(c => {
      centreSelect.innerHTML += `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`;
    });

    if (auto && userCentreId) {
      centreSelect.value = userCentreId;
      currentCentreId = userCentreId;
      loadDevices(userCentreId);
    }

    /* ⭐⭐⭐ NAVBAR CENTRE NAME UPDATE ⭐⭐⭐ */
    try {
      const label = document.getElementById("navbarCentreName");
      const labelWrapper = document.getElementById("navbarCentreLabel");

      // 👉 navbar centre label dikhao
      if (labelWrapper) labelWrapper.style.display = "block";

      if (label) {

        let centreObj = centreData.find(c => c.CENTRE_ID == currentCentreId);

        if (!centreObj && centreSelect.value) {
          centreObj = centreData.find(c => c.CENTRE_ID == centreSelect.value);
        }

        if (centreObj) {
          label.innerHTML = " Centre: " + centreObj.CENTRE_NAME;
        }
      }
    } catch (e) {
      console.log(e);
    }

   const orgText =
    document.getElementById("organizationSelect").selectedOptions[0]?.textContent || "";

let centreText = "";

if (centreSelect.value) {
    centreText =
        centreSelect.selectedOptions[0]?.textContent || "";
} 
else if (userCentreId) {
    const c = centreData.find(c => c.CENTRE_ID == userCentreId);
    centreText = c?.CENTRE_NAME || "";
}

setNavbarOrgCentre(orgText, centreText);

  } catch (err) {
    console.error(err);
  }
}


/* ============================================================
   LOAD DEVICES FOR SELECTED CENTRE
   - Fetch devices
   - Fetch categories
   - Show category cards
   - Trigger live summary update
   ============================================================ */

   async function preloadCentreData(centreId){

  // Agar already cache me hai to dobara fetch mat karo
  if(window.cache.centreReadings[centreId]){
      console.log("Using cached centre readings");
      return;
  }

  console.log("Fetching centre readings...");

  const data = await fetch(
      API.devicereadinglog + `?centre=${centreId}`
  ).then(r => r.json());

  window.cache.centreReadings[centreId] = data;
}

async function loadDevices(centreId){
  currentCentreId=centreId;

   // 🔥 clear device alarm cache on centre change
  window.cache.deviceAlarms = {};
  window.cache.deviceStatusAlarms = {};

  try{

    const [devices, categories] = await Promise.all([
      fetch(API.masterDevices).then(r=>r.json()),
      fetch(API.devicecategory).then(r=>r.json())
    ]);

    allDevices = devices.filter(d=>d.CENTRE_ID==centreId);
    allCategories = categories;

    showCategoryCards();
    setTimeout(updateSummaryLive, 0);

  }catch(err){console.error(err);}
}



// ------------- DASHBOARD UI -------------
function clearFilters(){
    document.getElementById("startDateTime").value = "";
    document.getElementById("endDateTime").value = "";

    // reload current data without filters
    if(currentCategoryId){
        updateDashboardLive(currentCategoryId);
    }

    if(window.currentDeviceGraphDeviceId){
        const d = allDevices.find(x => x.DEVICE_ID === window.currentDeviceGraphDeviceId);
        if(d){
            loadDeviceReadings(d);
        }
    }
}

/* ============================================================
   UPDATE SUMMARY CARDS
   - Total Devices
   - Active Devices
   - Offline Devices
   ============================================================ */

function updateSummary(){
    const total = allDevices.length;
    const active = allDevices.filter(d => d.status === "active").length;
    const offline = total - active;

    document.getElementById("totalDevices").textContent = total;
    document.getElementById("activeDevices").textContent = active;
    document.getElementById("offlineDevices").textContent = offline;
}

function formatDateTimeDDMMYY(dateStr, timeStr){
  if(!dateStr || !timeStr) return "-";

  const d = new Date(dateStr + "T" + timeStr);

  if (isNaN(d)) return "-";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}-${mm}-${yy} ${hh}:${min}`;
}


/* ============================================================
   SET GRAPH TIME RANGE
   - Updates graphRangeMinutes
   - Highlights active range button
   - Reloads device graph
   ============================================================ */

function setGraphRange(minutes){

    graphRangeMinutes = minutes;
    // 🔥 FIX ACTIVE BUTTON STATE
    document.querySelectorAll(".range-btn").forEach(btn=>{
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline-primary");
    });

    const activeBtn = document.querySelector(`.range-btn[data-min="${minutes}"]`);
    if(activeBtn){
        activeBtn.classList.remove("btn-outline-primary");
        activeBtn.classList.add("btn-primary");
    }

    if(window.currentDeviceGraphDeviceId){
        const d = allDevices.find(
            x => x.DEVICE_ID === window.currentDeviceGraphDeviceId
        );
        if(d){
            loadDeviceReadings(d);
        }
    }
}



function showCategoryCards(){
  document.getElementById("deviceDetailsContainer").style.display="none";
  const container=document.getElementById("deviceTypeCards");
  container.innerHTML="";
  allCategories.forEach(cat=>{
    const devicesOfCat = allDevices.filter(d=>d.CATEGORY_ID===cat.CATEGORY_ID);
    const count = devicesOfCat.length;
    const card = document.createElement("div");
    card.className="device-type-card";
    card.innerHTML=`<h6>${cat.CATEGORY_NAME}</h6><strong>${count}</strong>`;
    if(count>0) card.onclick=()=>openDeviceDashboard(cat.CATEGORY_ID);
    else card.classList.add('disabled');
    container.appendChild(card);
  });
}



/* ============================================================
   SHOW CREATE USER FORM
   - Hide dashboard
   - Show form
   - Load user list
   ============================================================ */

function showUserForm() {

    if(currentUser.ROLE_ID !== 2) return;

    const modal = new bootstrap.Modal(
        document.getElementById('createUserModal')
    );

    modal.show();

    // 🔥 ALSO LOAD USER LIST
    loadUserList();

    // 🔥 SHOW USER LIST SECTION
    document.getElementById("userListContainer").style.display = "block";
}



/* ============================================================
   LOAD USER LIST CREATED BY CURRENT ADMIN
   ============================================================ */

async function loadUserList() {
  try {
    const res = await fetch(BASE_URL + "/api/masteruser/");
    let users = await res.json();

    // Filter by current user & sort descending by USER_ID (latest first)
    users = users.filter(u => u.CREATED_BY === currentUser.USER_ID)
                 .sort((a,b)=> b.USER_ID - a.USER_ID);

    const tbody = document.getElementById("userListBody");
    tbody.innerHTML = "";

    users.forEach((u, index) => {
      const serial = index + 1; // Latest = 1
      const validity = `${u.VALIDITY_START || '-'} → ${u.VALIDITY_END || '-'}`;
      tbody.innerHTML += `
        <tr>
          <td>${serial}</td>
          <td>${u.USERNAME}</td>
          <td>${u.ACTUAL_NAME}</td>
          <td>${u.EMAIL}</td>
          <td>${u.PHONE || '-'}</td>
          <td>${u.ROLE_ID == 2 ? "IoT Admin" : "User"}</td>
          <td>${validity}</td>
          <td>
   <button class="btn btn-sm btn-warning"
           onclick="editUser(${u.USER_ID})">
      Edit
   </button>
</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

/* ============================================================
   HANDLE CREATE USER FORM SUBMISSION
   - Validate fields
   - Check duplicates
   - Send POST request
   - Reload user list
   ============================================================ */

// Form submission ke baad list reload
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const now = new Date();
  const username = document.getElementById("newUsername").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const actualName = document.getElementById("newActualName").value.trim();

  // 🔹 Required fields check
  if (!username || !password || !confirmPassword || !actualName || !email) {
    alert("❌ Please fill all required fields!");
    return;
  }

  // 🔹 Password match check
  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  try {
    // 🔹 Fetch existing users created by current admin
    const resUsers = await fetch(BASE_URL + "/api/masteruser/");
    const users = await resUsers.json();
    const filteredUsers = users.filter(u => u.CREATED_BY === currentUser.USER_ID);

    // 🔹 Frontend duplicate check
    if (filteredUsers.some(u => u.USERNAME.toLowerCase() === username.toLowerCase())) {
      alert("❌ Username already exists!");
      return;
    }
    if (filteredUsers.some(u => u.EMAIL.toLowerCase() === email.toLowerCase())) {
      alert("❌ Email already exists!");
      return;
    }

    // 🔹 Prepare payload
    const payload = {
      USERNAME: username,
      PASSWORD: password,
      ACTUAL_NAME: actualName,
      EMAIL: email,
      PHONE: document.getElementById("phone").value.trim() || null,
      CREATED_BY: currentUser.USER_ID,
      CREATED_ON: now.toISOString().split("T")[0],
      VALIDITY_START: document.getElementById("validityStart").value || now.toISOString().split("T")[0],
      VALIDITY_END: document.getElementById("validityEnd").value || null,
      SEND_EMAIL: document.getElementById("sendEmail").checked,
      SEND_SMS: document.getElementById("sendSMS").checked,
      ROLE_ID: parseInt(document.getElementById("newUserRole").value),
      PASSWORD_RESET: false
    };

    // 🔹 Submit to backend
let url = BASE_URL + "/api/masteruser/";
let method = "POST";

if(editingUserId){
    url = BASE_URL + "/api/masteruser/" + editingUserId + "/";
    method = "PUT";
}

const res = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
});


if (res.ok) {
    alert(editingUserId ? "✅ User updated successfully!" : "✅ User created successfully!");
    document.getElementById("createUserForm").reset();
    loadUserList();

    editingUserId = null;
    document.querySelector("#createUserForm button[type='submit']").innerText = "Create";

} else {
    const data = await res.json();
    // 🔹 Friendly error message
    let messages = [];
    if (data.USERNAME) messages.push("Username already exists!");
    if (data.EMAIL) messages.push("Email already exists!");
    const msg = messages.length ? `❌ ${messages.join("\n")}` : "❌ Failed to create user!";
    alert(msg);
}


  } catch (err) {
    alert("❌ Error creating user! Please try again.");
  }
});

/* ============================================================
   ROLE BASED UI CONTROL
   - Hide org/centre filters for normal users
   - Show full access for IoT Admin
   ============================================================ */
function handleRoleDisable() {

  // 👉 NORMAL USER
  if (currentUser.ROLE_ID !== 2) {

      // hide ONLY org & centre filters
      const org = document.getElementById("organizationSelect")?.parentElement;
      const centre = document.getElementById("centreSelect")?.parentElement;

      if (org) org.style.display = "none";
      if (centre) centre.style.display = "none";

      return;
  }

  // 👉 ADMIN (everything visible)
  const navItem = document.getElementById("userManagementNav");
  if (navItem) navItem.classList.remove("d-none");
}



// 🔹 Show/hide section
function showUserOrgCentreLinkForm(){

    if(currentUser.ROLE_ID !== 2) return;

    const modal = new bootstrap.Modal(
        document.getElementById('userLinkModal')
    );

    modal.show();

    loadUsersForLink();
    loadOrganizationsForLink();
    loadUserOrgCentreLinks();
}


function togglePassword() {
  const passwordField = document.getElementById("newPassword");
  const confirmField = document.getElementById("confirmPassword");
  const checkbox = document.getElementById("showPassword");

  if (checkbox.checked) {
    passwordField.type = "text";
    confirmField.type = "text";
  } else {
    passwordField.type = "password";
    confirmField.type = "password";
  }
}



function hideUserOrgCentreLinkForm(){
  document.getElementById("userOrgCentreLinkSection").style.display="none";
  document.getElementById("deviceTypeCards").style.display="flex";
}

// 🔹 Load users (only created by current user)
async function loadUsersForLink() {
  try {
    const res = await fetch(BASE_URL + "/api/masteruser/");
    const users = await res.json();
    const filteredUsers = users.filter(u => u.CREATED_BY === currentUser.USER_ID);
    const select = document.getElementById("linkUserSelect");
    select.innerHTML = '<option value="">Select User</option>';
    filteredUsers.forEach(u => {
      select.innerHTML += `<option value="${u.USER_ID}">${u.ACTUAL_NAME} (${u.USERNAME})</option>`;
    });
  } catch(err){ console.error(err); }
}

// 🔹 Load organizations (current user allowed only)
async function loadOrganizationsForLink() {
  try{
    const linkRes = await fetch(API.userorganizationcentrelink, {
  credentials: "include"
});

     const links = await linkRes.json();   // ✅ CORRECT

     if (!Array.isArray(links)) {
  console.error("❌ userorgcentre API did not return array", links);
  return;
}
    const allowedOrgIds = [...new Set(links.map(l=>l.ORGANIZATION_ID))];

    const resOrgs = await fetch(API.masterorganizations);
    const orgs = await resOrgs.json();
    const select = document.getElementById("linkOrgSelect");
    select.innerHTML = '<option value="">Select Organization</option>';
    orgs.filter(o=>allowedOrgIds.includes(o.ORGANIZATION_ID))
        .forEach(o => select.innerHTML += `<option value="${o.ORGANIZATION_ID}">${o.ORGANIZATION_NAME}</option>`);
    
    select.addEventListener("change", e=>loadCentresForLink(e.target.value));
  }catch(err){ console.error(err); }
}

// 🔹 Load centres based on selected org
async function loadCentresForLink(orgId){
  const select = document.getElementById("linkCentreSelect");
  select.innerHTML = '<option value="">Select Centre</option>';
  if(!orgId) return;
  try{
    const resCentres = await fetch(API.mastercentre);
    const centres = await resCentres.json();
    centres.filter(c => c.ORGANIZATION_ID == orgId)
           .forEach(c=> select.innerHTML += `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`);
  }catch(err){ console.error(err); }
}

document.getElementById("saveUserLinkBtn").addEventListener("click", async () => {
    const userId = document.getElementById("linkUserSelect").value;
    const orgId = document.getElementById("linkOrgSelect").value;
    const centreId = document.getElementById("linkCentreSelect").value;

    if (!userId || !orgId || !centreId) { 
        alert("Select all fields!"); 
        return; 
    }

    try {
        // ✅ Get user and check CREATED_BY
        const resUsers = await fetch(BASE_URL + "/api/masteruser/");
        const users = await resUsers.json();
        const user = users.find(u => u.USER_ID == userId);
        if (!user || user.CREATED_BY != currentUser.USER_ID) {
            alert("❌ You can only link users you have created!");
            return;
        }

        // ✅ Payload with correct created_by
        const payload = {
            USER_ID: parseInt(userId),
            ORGANIZATION_ID: parseInt(orgId),
            CENTRE_ID: parseInt(centreId),
            created_by: parseInt(currentUser.USER_ID)
        };

        const res = await fetch(API.userorganizationcentrelinks, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) { 
            alert("✅ Link saved!");
            // 🔹 Reload table after save
            await loadUserOrgCentreLinks(); 
        } else {
            const data = await res.json();
            console.error("Failed to save link:", data);
            alert("❌ Failed to save link! Check console for details.");
        }

    } catch (err) {
        console.error("Error saving user link:", err);
        alert("❌ Error saving link!");
    }
});

async function loadUserOrgCentreLinks() {
  try {
    const res = await fetch(API.userorganizationcentrelinks, {
  credentials: "include"
});
    let links = await res.json();

    // 🔹 Get all users, orgs, centres to map names
    const [usersRes, orgsRes, centresRes] = await Promise.all([
      fetch(API.createuser),        // masteruser
      fetch(API.masterorganizations),
      fetch(API.mastercentre)
    ]);

    const users = await usersRes.json();
    const orgs = await orgsRes.json();
    const centres = await centresRes.json();

    // 🔹 Filter links created by current user & sort descending by LINK_ID (latest top)
    links = links.filter(l => l.created_by === currentUser.USER_ID)
                 .sort((a,b)=> (b.LINK_ID || 0) - (a.LINK_ID || 0));

    const tbody = document.getElementById("userOrgCentreLinksBody");
    tbody.innerHTML = "";

    links.forEach((l, index) => {
      const serial = index + 1; // Latest = 1
      const userName = users.find(u => u.USER_ID === l.USER_ID)?.ACTUAL_NAME || '-';
      const orgName = orgs.find(o => o.ORGANIZATION_ID === l.ORGANIZATION_ID)?.ORGANIZATION_NAME || '-';
      const centreName = centres.find(c => c.CENTRE_ID === l.CENTRE_ID)?.CENTRE_NAME || '-';

      tbody.innerHTML += `<tr>
          <td>${serial}</td>
          <td>${userName}</td>
          <td>${orgName}</td>
          <td>${centreName}</td>
        </tr>`;
    });

  } catch (err) {
    console.error("Failed to load user-org-centre links:", err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
    const startInput = document.getElementById('validityStart');
    const endInput = document.getElementById('validityEnd');
    
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const yyyy = today.getFullYear();

    const startDate = `${yyyy}-${mm}-${dd}`;
    startInput.value = startDate;

    const endDateObj = new Date(today);
    endDateObj.setFullYear(endDateObj.getFullYear() + 1); // Add 1 year
    const endYYYY = endDateObj.getFullYear();
    const endMM = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endDD = String(endDateObj.getDate()).padStart(2, '0');
    const endDate = `${endYYYY}-${endMM}-${endDD}`;
    endInput.value = endDate;
  });


function backToDashboard(){ 
  showCategoryCards(); 
  if(liveUpdateInterval) clearInterval(liveUpdateInterval);
  window.currentDeviceGraphDeviceId = null;
}

function logout(){

  // 🔥 Clear user specific storage
  localStorage.removeItem("ORG_NAME");
  localStorage.removeItem("CENTRE_NAME");
  localStorage.removeItem("lastRefreshTime");

  fetch('/logout/', { credentials: "include" })
    .then(()=>window.location='/login/');
}


// ------------- LIVE UPDATES -------------
// ------------- LIVE UPDATES -------------
function startLiveUpdates(categoryId){
    if(liveUpdateInterval) clearInterval(liveUpdateInterval);

    // 🔹 sirf ek baar update
    updateDashboardLive(categoryId);

    // ❌ auto refresh hata diya
    // liveUpdateInterval = setInterval(()=>updateDashboardLive(categoryId),10000);
}

function manualRefresh(){
    if(currentCategoryId){
        updateDashboardLive(currentCategoryId);
    }

    if(window.currentDeviceGraphDeviceId){
        const currentDevice = allDevices.find(
            d => d.DEVICE_ID === window.currentDeviceGraphDeviceId
        );
        if(currentDevice){
            loadDeviceReadings(currentDevice);
        }
    }
      updateLastRefreshTime();
}


function applyDateFilter(){

    const startInput = document.getElementById("startDateTime").value;
    const endInput   = document.getElementById("endDateTime").value;

    if(!startInput || !endInput){
        alert("Please select both start and end date.");
        return;
    }

    const start = new Date(startInput);
    const end   = new Date(endInput);

    // ⛔ If end < start
    if(end < start){
        alert("End date must be after Start date.");
        return;
    }

    // 🔥 Difference in days
    const diffMs = end - start;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // ⛔ Limit 3 days
    if(diffDays > 3){
        alert("⚠ You can view data for maximum 3 days only.");
        return;
    }

    // ✅ Allowed → apply filter
    if(currentCategoryId){
        updateDashboardLive(currentCategoryId);
    }

    if(window.currentDeviceGraphDeviceId){
        const d = allDevices.find(x => x.DEVICE_ID === window.currentDeviceGraphDeviceId);
        if(d){
            loadDeviceReadings(d);
        }
    }
}



// ----------- DEVICE STATUS FIX (VOC FRIENDLY) -----------
// ------------------- DEVICE LIVE STATUS FIX -------------------
async function updateDashboardLive(categoryId){
    if(!currentCentreId) return;

    const devices = allDevices.filter(d => d.CATEGORY_ID === categoryId);
    const [masterparameter, masteruom] = await Promise.all([
        fetch(API.masterparameter).then(r=>r.json()),
        fetch(API.masteruom).then(r=>r.json())
    ]);

    const readingsDataRaw = await (await fetch(API.devicereadinglog + `?centre=${currentCentreId}&category=${categoryId}`)).json();
    const now = new Date();

    devices.forEach(device=>{
        // 1️⃣ Filter readings for this device only
        data.sort((a,b)=>{
    return new Date(a.READING_DATE+'T'+a.READING_TIME) -
           new Date(b.READING_DATE+'T'+b.READING_TIME);
});
        const latestReading = deviceReadings[deviceReadings.length-1];

        // 2️⃣ Determine online/offline
// 2️⃣ Determine online/offline
let status = "offline", displayVal = "Offline";

if (deviceReadings.length > 0) {
    // Filter only VOC readings for VOC devices
   // 🔥 Sirf VOC category ke liye VOC filter
const category = allCategories.find(c=>c.CATEGORY_ID===device.CATEGORY_ID);
const isVOC = category?.CATEGORY_NAME?.toLowerCase().includes("voc");

let filteredReadings = deviceReadings;

if(isVOC){
   filteredReadings = deviceReadings.filter(r=>{
      const param = masterparameter.find(p=>p.PARAMETER_ID==r.PARAMETER_ID);
      return param?.PARAMETER_NAME?.toLowerCase().includes("voc");
   });
}

// const latestReading = filteredReadings[filteredReadings.length-1];


    // Use latest VOC reading (if exists)
const latestReading = filteredReadings[filteredReadings.length - 1] 
                   || deviceReadings[deviceReadings.length - 1];


    const readingTime = new Date(latestReading.READING_DATE + 'T' + latestReading.READING_TIME);
    if (now - readingTime <= 10 * 60 * 1000) {
        status = "active";

        const param = masterparameter.find(p => String(p.PARAMETER_ID) === String(latestReading.PARAMETER_ID));
        const uomObj = param ? masteruom.find(u => String(u.UOM_ID) === String(param.UOM_ID)) : null;
        const uom = uomObj?.UOM_NAME || '';

        displayVal = Math.round(parseFloat(latestReading.READING)) + ' ' + uom;

    }
}

device.status = status;


        // 3️⃣ Update device card
        const el = document.getElementById(`currentTemp_${device.DEVICE_ID}`);
        if(!el) return;
        el.textContent = displayVal;
        el.parentElement.className = status==="active" ? "device-card bg-success" : "device-card bg-secondary";
    });

    // 4️⃣ Update summary
    const total = devices.length;
    const active = devices.filter(d=>d.status==="active").length;
    document.getElementById("totalDevices").textContent = total;
    document.getElementById("activeDevices").textContent = active;
    document.getElementById("offlineDevices").textContent = total - active;

    // // 5️⃣ Refresh graph & alarms if a device is open
    // if(window.currentDeviceGraphDeviceId){
    //     const currentDevice = allDevices.find(d=>d.DEVICE_ID===window.currentDeviceGraphDeviceId);
    //     if(currentDevice) loadDeviceReadings(currentDevice);
    // }


    // Refresh chart & alarms for current device
    // if(window.currentDeviceGraphDeviceId){
    //     loadDeviceReadings(allDevices.find(d=>d.DEVICE_ID===window.currentDeviceGraphDeviceId));
    // }

    function manualRefresh(){

    if(currentCategoryId){
        updateDashboardLive(currentCategoryId);
    }
}


    // 🔁 Auto-refresh graph every 30 minutes (1800000 ms)
if (window.deviceGraphRefreshInterval) clearInterval(window.deviceGraphRefreshInterval);

// window.deviceGraphRefreshInterval = setInterval(() => {
//     if (window.currentDeviceGraphDeviceId) {
//         const currentDevice = allDevices.find(d => d.DEVICE_ID === window.currentDeviceGraphDeviceId);
//         if (currentDevice) {
//             console.log("⏳ Auto-refreshing graph for:", currentDevice.DEVICE_NAME);
//             loadDeviceReadings(currentDevice);
//         }
//     }
// }, 30 * 60 * 1000); // 30 minutes


    // Update summary accurately device-wise
    updateSummary();
}


/* ============================================================
   OPEN DEVICE DASHBOARD (CATEGORY LEVEL)
   - Hide category cards
   - Show device cards
   - Load initial readings
   ============================================================ */

// ------------- DEVICE DASHBOARD -------------
async function openDeviceDashboard(categoryId){

    currentCategoryId = categoryId;

    document.getElementById("deviceTypeCards").innerHTML="";
    document.getElementById("deviceDetailsContainer").style.display="block";

    const category = allCategories.find(c=>c.CATEGORY_ID===categoryId);
    document.getElementById("deviceTypeTitle").textContent =
        category?.CATEGORY_NAME || categoryId;

      if(window.currentGraphParameterId){
    const p = masterparameter.find(x=>x.PARAMETER_ID==window.currentGraphParameterId);
    if(p){
        document.getElementById("deviceTypeTitle").textContent =
           device.DEVICE_NAME + " → " + p.PARAMETER_NAME;
    }
}


    const devices = allDevices.filter(d=>d.CATEGORY_ID===categoryId);
    const deviceList = document.getElementById("deviceList");
    deviceList.innerHTML = "";

    // 🔹 STEP 1: PEHLE CARD BANAAO
    devices.forEach(device=>{
        const div = document.createElement("div");
        div.className = "device-card bg-secondary";
        div.style.cursor = "pointer";
        div.id = `card_${device.DEVICE_ID}`;

const category = allCategories.find(c=>c.CATEGORY_ID===device.CATEGORY_ID);
const isMultiParam =
  category?.CATEGORY_NAME?.toLowerCase().includes("incubator") ||
  category?.CATEGORY_NAME?.toLowerCase().includes("voc");


if(isMultiParam){
  div.innerHTML = `
    <h6>${device.DEVICE_NAME}</h6>

    <div id="param1_${device.DEVICE_ID}" class="device-reading">Loading...</div>
    <div id="param2_${device.DEVICE_ID}" class="device-reading"></div>
    <div id="param3_${device.DEVICE_ID}" class="device-reading"></div>

    <div class="device-hint">Click to view </div>
  `;
}else{
  div.innerHTML = `
    <h6>${device.DEVICE_NAME}</h6>
    <p id="currentTemp_${device.DEVICE_ID}" style="font-weight:600;">Loading...</p>
    <div class="device-hint">Click to view </div>
  `;
}



        div.addEventListener("click",()=>loadDeviceReadings(device));

        deviceList.appendChild(div);
    });

    // 🔹 STEP 2: AB FAST LOADING STATUS + READING DO
    const masterparameter = await fetch(API.masterparameter).then(r=>r.json());
const masteruom = await fetch(API.masteruom).then(r=>r.json());

devices.forEach(device=>{
    loadCardReadingFast(device, masterparameter, masteruom);
});


}

/* ============================================================
   FAST DEVICE CARD STATUS UPDATE
   - Fetch latest reading
   - Detect online/offline
   - Handle multi-parameter devices (Incubator/VOC)
   - Apply threshold color logic
   ============================================================ */

async function loadCardReadingFast(device, masterparameter, masteruom){

    const cardEl = document.getElementById(`card_${device.DEVICE_ID}`);
     
     // ✅ FIX: category yahin define karo
    const category = allCategories.find(
        c => c.CATEGORY_ID === device.CATEGORY_ID
    );

    // -------------------- CHECK INCUBATOR CATEGORY --------------------
const isMultiParam =
  category?.CATEGORY_NAME?.toLowerCase().includes("incubator") ||
  category?.CATEGORY_NAME?.toLowerCase().includes("voc");

    // ===============================================================
    //      🌟 SPECIAL LOGIC ONLY FOR INCUBATOR DEVICES
    // ===============================================================
if (isMultiParam) {

    const p1 = document.getElementById(`param1_${device.DEVICE_ID}`);
    const p2 = document.getElementById(`param2_${device.DEVICE_ID}`);
    const p3 = document.getElementById(`param3_${device.DEVICE_ID}`);

    try{
        const res = 
  window.cache.centreReadings[currentCentreId]
    .filter(r => r.DEVICE_ID == device.DEVICE_ID);
        const data = await res.json();

        const ownReadings = data.filter(r => r.DEVICE_ID == device.DEVICE_ID);

        if(!ownReadings.length){
            p1.innerText = "Offline";
            p2.innerText = "";
            p3.innerText = "";
            cardEl.className = "device-card bg-secondary";
            return;
        }

        let grouped = {};
        ownReadings.forEach(r => {
            if (!grouped[r.PARAMETER_ID]) grouped[r.PARAMETER_ID] = [];
            grouped[r.PARAMETER_ID].push(r);
        });

        let keys = masterparameter
            .filter(p => grouped[p.PARAMETER_ID])
            .map(p => p.PARAMETER_ID)
            .slice(0,3);

        let displayTargets = [p1, p2, p3];

keys.forEach((k, idx) => {
    const recs = grouped[k];
    const last = recs[recs.length - 1];

    const param = masterparameter.find(mp => mp.PARAMETER_ID == k);
    const uomObj = masteruom.find(u => u.UOM_ID == param?.UOM_ID);

const readingVal = parseFloat(last.READING);
const lower = parseFloat(param.LOWER_THRESHOLD || 0);
const upper = parseFloat(param.UPPER_THRESHOLD || 0);

let btnColor = "btn-light";
let indicator = "";

// 🔥 Only incubator & VOC get threshold button highlight
if (isMultiParam) {

    if (upper && readingVal > upper) {
        btnColor = "btn-danger";
        indicator = " ↑";   // High
    }
    else if (lower && readingVal < lower) {
        btnColor = "btn-danger";
        indicator = " ↓";   // Low
    }
}

displayTargets[idx].innerHTML = `
  <div style="display:flex;
            justify-content:space-between;
            align-items:center;
            width:100%;
            margin-bottom:6px;">
      <span>
        ${param.PARAMETER_NAME}: 
        ${Math.round(readingVal)} ${uomObj?.UOM_NAME || ''}
      </span>

      <button class="btn btn-sm ${btnColor}"
        style="font-size:10px;padding:2px 8px;"
        data-param="${param.PARAMETER_ID}">
        View${indicator}
      </button>
  </div>
`;



displayTargets[idx].querySelector("button").onclick = (e) => {
    e.stopPropagation();

    window.currentGraphParameterId = param.PARAMETER_ID;
    window.manualGraphLock = true;   // 🔒 freeze auto refresh

    loadDeviceReadings(device);

    setTimeout(() => {
        window.manualGraphLock = false;   // 🔓 unfreeze
    }, 1000);
};



    displayTargets[idx].dataset.param = param.PARAMETER_ID;

  displayTargets[idx].onclick = (e) => {
    e.stopPropagation();

    window.currentGraphParameterId = param.PARAMETER_ID;
    window.manualGraphLock = true;     // 🔥 stop auto refresh

    loadDeviceReadings(device);

    // 1 second baad auto refresh wapas allow
    setTimeout(() => {
        window.manualGraphLock = false;
    }, 1000);
};
});

// 👇 forEach ke baad
// detect last reading time
let latestTime = null;

keys.forEach(k => {
    const last = grouped[k][grouped[k].length - 1];
    const dt = new Date(last.READING_DATE + "T" + last.READING_TIME);
    if (!latestTime || dt > latestTime) latestTime = dt;
});

// 15 min rule
if (!latestTime || (Date.now() - latestTime.getTime()) > 15 * 60 * 1000) {
    cardEl.className = "device-card bg-secondary";   // OFFLINE
} else {
    cardEl.className = "device-card bg-success";     // ONLINE
}

if (!latestTime || (Date.now() - latestTime.getTime()) > 15 * 60 * 1000) {
    p1.innerText = "Offline";
    p2.innerText = "";
    p3.innerText = "";
}



    }
    catch(err){
        p1.innerText = "Offline";
        p2.innerText = "";
        p3.innerText = "";
        cardEl.className = "device-card bg-secondary";
    }

    return;   // 🔥 incubator ke baad normal logic chalne se roko
}


// ===============================================================
//      ⭐ ORIGINAL LOGIC FOR ALL OTHER DEVICES (UNCHANGED)
// ===============================================================

const valueEl = document.getElementById(`currentTemp_${device.DEVICE_ID}`);

if (!valueEl) {
    console.warn("Value element not found for device:", device.DEVICE_ID);
    return;
}

try {

    const res = await fetch(API.devicereadinglog + `?device=${device.DEVICE_ID}`);
    const data = await res.json();

    const ownReadings = data.filter(r => r.DEVICE_ID == device.DEVICE_ID);

    if (!ownReadings.length) {
        valueEl.innerText = "Offline";
        cardEl.className = "device-card bg-secondary";
        return;
    }

    const last = ownReadings[ownReadings.length - 1];
    const dt = new Date(last.READING_DATE + "T" + last.READING_TIME);

    if (Date.now() - dt.getTime() > 10 * 60 * 1000) {
        valueEl.innerText = "Offline";
        cardEl.className = "device-card bg-secondary";
        return;
    }

    const param = masterparameter.find(p => p.PARAMETER_ID == last.PARAMETER_ID);
    const uomObj = masteruom.find(u => u.UOM_ID == param?.UOM_ID);
    const uom = uomObj?.UOM_NAME || "";

    valueEl.innerText = Math.round(last.READING) + " " + uom;
    cardEl.className = "device-card bg-success";

} catch (err) {
    console.error(err);
    valueEl.innerText = "Offline";
    cardEl.className = "device-card bg-secondary";
}
}

   // startLiveUpdates(categoryId);


//graph align
// 👉 ADD THIS HERE

function groupByMinute(points, mode="average") {

    const map = new Map();

    points.forEach(p => {
        const d = p.x;

        const key =
            d.getFullYear() + "-" +
            String(d.getMonth()+1).padStart(2,"0") + "-" +
            String(d.getDate()).padStart(2,"0") + "T" +
            String(d.getHours()).padStart(2,"0") + ":" +
            String(d.getMinutes()).padStart(2,"0") + ":00";

        if(!map.has(key)) map.set(key, []);
        map.get(key).push(p.y);
    });

    const result = [];

    map.forEach((values, key) => {
        let value =
            mode==="average"
            ? values.reduce((a,b)=>a+b,0)/values.length
            : values[values.length-1];

const base = Math.round(value);

// 🔥 micro lift (sirf visual ke liye)
const lifted =
  points.length > 1
    ? base + (Math.random() * 0.08 - 0.04)
    : base;

result.push({
  x: new Date(key),
  y: lifted
});

    });

    result.sort((a,b)=>a.x-b.x);
    return result;
}

function downsample(points, max = 120) {
    if (points.length <= max) return points;

    const step = Math.ceil(points.length / max);
    return points.filter((_, i) => i % step === 0);
}

/* ============================================================
   LOAD DEVICE GRAPH DATA
   - Fetch reading logs
   - Apply time filter
   - Apply parameter filter
   - Handle offline periods
   - Plot Chart.js graph
   - Show alarm markers
   - Update average box
   ============================================================ */

async function loadDeviceReadings(device){
// 🔐 HARD GRAPH CONTEXT LOCK
window.currentDeviceGraphDeviceId = device.DEVICE_ID;

// ⏱️ DEFAULT GRAPH RANGE (FIRST LOAD ONLY)
if (typeof window.graphRangeInitialized === "undefined") {
    graphRangeMinutes = 10;        // default = Last 10 Min
    markActiveRange(10);           // UI highlight
    window.graphRangeInitialized = true;
}


     // 🔒 stop double / triple reload
    if (window.manualGraphLock && !window.currentGraphParameterId) return;

 

    // window.currentDeviceGraphDeviceId = device.DEVICE_ID;
    const masterparameter = await fetch(API.masterparameter).then(r=>r.json());
    const masteruom = await fetch(API.masteruom).then(r=>r.json());
    const startInput = document.getElementById("startDateTime").value;
    const endInput = document.getElementById("endDateTime").value;

    // 🔹 Default to last 24 hours
    let now = new Date();

// user ne manual date diya?
if(startInput && endInput){
    start = new Date(startInput);
    end = new Date(endInput);
}else{
    start = new Date(now.getTime() - graphRangeMinutes * 60 * 1000);
    end   = now;   // 🔥 ALWAYS current time
}
// 🔍 DEBUG: graph context check
console.log(
  "GRAPH CONTEXT =>",
  "DEVICE:", window.currentDeviceGraphDeviceId,
  "PARAM:", window.currentGraphParameterId,
  "RANGE:", graphRangeMinutes
);


    // const now = new Date();

    const readingsDataRaw =
    window.cache.centreReadings[currentCentreId] || [];

    // 🔐 HARD PARAMETER LOCK (FIRST LOAD ONLY)
// 👉 reading se hi parameter lock karo (safe for multi-parameter devices)
if (!window.currentGraphParameterId && readingsDataRaw.length) {

    const firstReading = readingsDataRaw.find(
        r => r.DEVICE_ID === device.DEVICE_ID
    );

    if (firstReading) {
        window.currentGraphParameterId = firstReading.PARAMETER_ID;
    }
}
console.log(
  "GRAPH CONTEXT =>",
  "DEVICE:", window.currentDeviceGraphDeviceId,
  "PARAM:", window.currentGraphParameterId,
  "RANGE:", graphRangeMinutes
);


    // 🔹 Filter readings only for this device and within last 24 hours
// 🔹 Filter readings only for this device and within last 24 hours
// 🔹 Filter readings for this device (within selected time range)
let dataPoints = readingsDataRaw
    .filter(r => r.DEVICE_ID === device.DEVICE_ID)
    //.filter(r => !window.currentGraphParameterId || String(r.PARAMETER_ID) === String(window.currentGraphParameterId))
    .map(r => ({
        x: new Date(r.READING_DATE + "T" + r.READING_TIME),
        y: parseFloat(r.READING),
        paramId: r.PARAMETER_ID
    }))
    .filter(p => p.x >= start && p.x <= end);

// 🔒 HARD PARAMETER LOCK BASED ON DEVICE CATEGORY
// const category = allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID);
// const categoryName = category?.CATEGORY_NAME?.toLowerCase() || "";

// dataPoints = dataPoints.filter(p => {
//     const param = masterparameter.find(mp => mp.PARAMETER_ID == p.paramId);
//     if (!param) return false;

//     const pname = param.PARAMETER_NAME.toLowerCase();

//     // 🔹 Refricheck → FRIDGE only
//     if (categoryName.includes("refricheck") || categoryName.includes("fridge")) {
//         return pname.includes("fridge");
//     }

//     // 🔹 Cryosafe → CRYO only
//     if (categoryName.includes("cryo")) {
//         return pname.includes("cryo");
//     }

//     return true;
// });



// 🔥 Incubator parameter filter (jab koi param click hua ho)
if (window.currentGraphParameterId) {
    dataPoints = dataPoints.filter(p =>
        String(p.paramId) === String(window.currentGraphParameterId)
    );
}


// 🔥 ONLY for INCUBATOR: allow old data if offline
if (
   !dataPoints.length &&
   allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID)
       ?.CATEGORY_NAME?.toLowerCase().includes("incubator")
) {


    dataPoints = readingsDataRaw
        .filter(r => r.DEVICE_ID === device.DEVICE_ID)
        .map(r => ({
            x: new Date(r.READING_DATE + "T" + r.READING_TIME),
            y: parseFloat(r.READING),
            paramId: r.PARAMETER_ID
        }));

    if (window.currentGraphParameterId) {
        dataPoints = dataPoints.filter(p =>
            String(p.paramId) === String(window.currentGraphParameterId)
        );
    }
}

// normal devices → still block graph
if (
   !dataPoints.length &&
   !allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID)
       ?.CATEGORY_NAME?.toLowerCase().includes("incubator")
) {

    document.getElementById("avgBox").innerText = "Avg: --";
    return;
}

// get selected parameter (incubator safe)
let param = null;

if (window.currentGraphParameterId) {
    param = masterparameter.find(
        p => String(p.PARAMETER_ID) === String(window.currentGraphParameterId)
    );
} else if (dataPoints.length) {
    param = masterparameter.find(
        p => String(p.PARAMETER_ID) === String(dataPoints[0].paramId)
    );
}



// 🔹 Detect if VOC category
const category = allCategories.find(c => c.CATEGORY_ID === currentCategoryId);
const isVOC = category?.CATEGORY_NAME?.toLowerCase().includes("voc");

// 🔹 If VOC → keep only VOC readings
// if (isVOC) {
//     const vocParam = masterparameter.find(p => p.PARAMETER_NAME.toLowerCase().includes("voc"));
//     if (vocParam) {
//         dataPoints = dataPoints.filter(dp => String(dp.paramId) === String(vocParam.PARAMETER_ID));
//     }
// }

    // 👉 convert raw readings to 1-minute points
// const dataToPlot = groupByMinute(
//     dataPoints.map(p => ({ x: p.x, y: p.y })), 
//     "average"       // "last" bhi use kar sakte ho
// ); // old version 1

const grouped = groupByMinute(
    dataPoints.map(p => ({ x: p.x, y: p.y })),
    "average"
);

const dataToPlot = downsample(
    grouped,
    graphRangeMinutes <= 60 ? 60 : 120
); // new fast opening 1



// ⭐ STEP 1 — Alarm API YAHAN FETCH KARO
// 🔥 ALARM CACHE
if(!window.cache.deviceAlarms[device.DEVICE_ID]){
    window.cache.deviceAlarms[device.DEVICE_ID] =
        await fetch(
            API.devicealarmlog + 
            `?centre=${currentCentreId}&category=${currentCategoryId}`
        ).then(r=>r.json());
}

const alarmsRaw = window.cache.deviceAlarms[device.DEVICE_ID];

// ⭐ STEP 1.1 — DEVICE OFFLINE / ONLINE ALARM FETCH
// 🔥 STATUS ALARM CACHE
if(!window.cache.deviceStatusAlarms[device.DEVICE_ID]){
    window.cache.deviceStatusAlarms[device.DEVICE_ID] =
        await fetch(
            API.devicestatusalarmlog + 
            `?device=${device.DEVICE_ID}`
        ).then(r=>r.json());
}

const statusAlarmsRaw =
    window.cache.deviceStatusAlarms[device.DEVICE_ID];

// ===== OFFLINE PERIOD FILTER BASED ON CURRENT GRAPH RANGE =====
let offlinePeriods = [];

statusAlarmsRaw.forEach(s => {

    if (s.DEVICE_ID !== device.DEVICE_ID) return;

    let startTime = new Date(s.CREATED_ON_DATE + "T" + s.CREATED_ON_TIME);

    let endTime = s.IS_ACTIVE === 0
        ? new Date(s.UPDATED_ON_DATE + "T" + s.UPDATED_ON_TIME)
        : new Date();

    // completely outside graph window
    if (endTime < start || startTime > end) return;

    if (startTime < start) startTime = start;
    if (endTime > end) endTime = end;

    offlinePeriods.push({ start: startTime, end: endTime });
});

// ==============================
// 🔥 FORCE ZERO DURING OFFLINE
// ==============================

offlinePeriods.forEach(p => {

    dataToPlot.forEach(point => {

        if (point.x >= p.start && point.x <= p.end) {
            point.y = 0;
        }

    });

});


// ============================
// 🔘 OFFLINE GREY LINE DATA
// ============================

const offlineLineData = [];

if (dataToPlot.length) {

    const minY = 0;



    offlinePeriods.forEach(p => {

        // offlineLineData.push(
        //     { x: p.start, y: minY },
        //     { x: p.end,   y: minY },
        //     { x: null,    y: null }   // break line
        // );

        offlineLineData.push(
    { 
        x: p.start, 
        y: 0,
        offlineStart: p.start,
        offlineEnd: p.end
    },
    { 
        x: p.end, 
      //  y: dataToPlot.find(d => d.x >= p.end)?.y || minY 
      y: 0,
      offlineStart: p.start,
      offlineEnd: p.end
    },
    { x: null, y: null }
);


    });
}


/* 🔴 Alarm marker points */
const alarmPoints = [];

alarmsRaw.forEach(a => {

    if (a.DEVICE_ID !== device.DEVICE_ID) return;

    // agar incubator ya multi param device hai
    if (
        window.currentGraphParameterId &&
        String(a.PARAMETER_ID) !== String(window.currentGraphParameterId)
    ) return;

    const alarmTime = new Date(
        (a.ALARM_DATE || a.CREATED_DATE || a.DATE) + "T" +
        (a.ALARM_TIME || a.CREATED_TIME)
    );

    // nearest reading dhundo
    const closest = dataToPlot.find(p =>
        Math.abs(new Date(p.x) - alarmTime) < 60000
    );

    if (closest) {
        alarmPoints.push({
            x: closest.x,
            y: closest.y
        });
    }

});

// 🔴 Offline marker points
const offlineMarkers = offlinePeriods.map(p => {
    return {
        x: p.start,
        y: dataToPlot.length ? dataToPlot[0].y : 0,
        offlineStart: p.start,
        offlineEnd: p.end
    };
});


// 🔥 Update AVG box for selected time range
updateAverageBox(dataToPlot, param, masteruom);

 
// ===== OFFLINE BADGE UPDATE =====
let totalOffline = 0;

offlinePeriods.forEach(p => {
    totalOffline += (p.end - p.start);
});

const totalMinutes = Math.round(totalOffline / 60000);

const badge = document.getElementById("offlineBadge");

if(totalMinutes > 0){
    const hours = Math.floor(totalMinutes/60);
    const rem = totalMinutes % 60;

    badge.style.display = "inline-block";
    badge.innerText = `Offline: ${hours}h ${rem}m`;
} else {
    badge.style.display = "none";
}




    const paramName = param?.PARAMETER_NAME?.toLowerCase() || "";

    // 🔹 Cap readings (limit Y values)
    dataPoints.forEach(p => {
        if (paramName.includes("voc") && p.y > 2000) p.y = 2000;
        if (paramName.includes("refricheck") && p.y > 15) p.y = 15;
    });

  // 🔹 Update current value (INCUBATOR SAFE)
const latest = dataPoints[dataPoints.length - 1];

// detect incubator
// const category = allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID);
const isIncubator = category?.CATEGORY_NAME?.toLowerCase().includes("incubator");

if (latest) {
    const uomObj = param ? masteruom.find(u => String(u.UOM_ID) === String(param.UOM_ID)) : null;
    const uom = uomObj?.UOM_NAME || '';
    const readingVal = parseFloat(latest.y);

    // 🔹 Threshold color
    let colorClass = "bg-success";
    if (!isNaN(readingVal)) {
        if (param?.UPPER_THRESHOLD && readingVal > param.UPPER_THRESHOLD) colorClass = "bg-danger";
        else if (param?.LOWER_THRESHOLD && readingVal < param.LOWER_THRESHOLD) colorClass = "bg-warning";
    }

    // 🔥 ONLY update currentTemp for NON-INCUBATOR
    if (!isIncubator) {
        const el = document.getElementById(`currentTemp_${device.DEVICE_ID}`);
        if (el) {
            el.innerHTML = `
                <span class="device-reading">
                    ${param.PARAMETER_NAME.toUpperCase()}: ${Math.round(readingVal)} ${uom}
                </span>
            `;
            el.parentElement.className = `device-card ${colorClass}`;
        }
    }

    device.status = "active";
}
else {
    device.status = "offline";

    // 🔥 INCUBATOR offline handling
    if (isIncubator) {
        const card = document.getElementById(`card_${device.DEVICE_ID}`);
        if (card) {
            card.classList.remove("bg-success","bg-danger");
            card.classList.add("bg-secondary");
        }
    }
    // normal devices untouched
}

// 🔥 STEP 1: y-axis ko 5 ke gap pe force karne wala plugin
const step5TicksPlugin = {
  id: 'step5Ticks',
  afterBuildTicks(scale) {
    if (scale.axis !== 'y') return;

    const min = scale.min;
    const max = scale.max;
    const step = 5;

    const start = Math.floor(min / step) * step;
    const end   = Math.ceil(max / step) * step;

    const ticks = [];
    for (let v = start; v <= end; v += step) {
      ticks.push({ value: v });
    }

    scale.ticks = ticks;
  }
};


    // 🔹 Draw line chart
  const ctx = document.getElementById("deviceGraph").getContext('2d');

if (window.deviceChart) window.deviceChart.destroy();

// gradient background
const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, "rgba(13,110,253,.35)");
gradient.addColorStop(1, "rgba(13,110,253,0)");

window.deviceChart = new Chart(ctx,{
  type: "line",
  data: {
datasets: [

    // 🔘 OFFLINE GREY LINE (bottom flat)
  {
    label: "Offline",
    data: offlineLineData,
    borderColor: "#555",
    borderWidth: 2,
    tension: 0,
    fill: false,
    pointRadius: 0
  },


  // 🔵 Normal graph line
  {
    label: device.DEVICE_NAME,
    data: dataToPlot,
    borderColor: "#0d6efd",
    backgroundColor: gradient,
    fill: false,
    tension: 0.25,
    spanGaps: true,
    cubicInterpolationMode: 'monotone',
    borderWidth: 2.5,
    pointRadius: 0,
    pointHoverRadius: 4,
    hitRadius: 15
  },

  // 🔴 Alarm red dots
  {
    label: "Alarms",
    data: alarmPoints,
    showLine: false,
    pointBackgroundColor: "red",
    pointBorderColor: "white",
    pointRadius: 5,
    pointHoverRadius: 7
  }

//   {
//     label: "Offline",
//     data: offlineMarkers,
//     showLine: false,
//     pointBackgroundColor: "#dc3545",
//     pointBorderColor: "#fff",
//     pointRadius: 6,
//     pointHoverRadius: 8
// }
]
  },

  options: {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: { display: false },

      
tooltip: {
  callbacks: {
   
    

    label: function(ctx){

        if(ctx.dataset.label === "Offline"){
            const start = new Date(ctx.raw.offlineStart);
            const end   = new Date(ctx.raw.offlineEnd);

            const durationMs = end - start;
            const hours = Math.floor(durationMs / (1000*60*60));
            const minutes = Math.floor((durationMs % (1000*60*60)) / (1000*60));

            return [
                "DEVICE OFFLINE",
                "From: " + start.toLocaleString("en-GB"),
                "To: " + end.toLocaleString("en-GB"),
                "Duration: " + hours + "h " + minutes + "m"
            ];
        }

        return "Reading: " + Math.round(ctx.raw.y);
    }
  }
}


    },

    scales: {
      x: {
        type: "time",
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        // grace: '10%',
        min:0,
        grid: { color: "rgba(0,0,0,0.06)" },

        ticks: {
           autoSkip: true,
           maxTicksLimit: graphRangeMinutes <= 60 ? 5 : 8,
           precision: 0,
           padding: 6

        }
      }
    }
  },

  // 🔥 STEP 2: YAHAN LAGANA HAI
  plugins: [step5TicksPlugin]
});

// ✅ YAHI ADD KARNA HAI
document.getElementById("lastRefreshText").style.display = "inline";
updateLastRefreshTime();

// window.deviceChart = new Chart(ctx,{
//   type: "line",
//   data: {
//     datasets: [
//       {
//         label: device.DEVICE_NAME,

//         // 🔥 IMPORTANT FIX
//         data: dataToPlot,   // [{x:Date,y:Number}] directly

//         borderColor: "#0d6efd",
//         backgroundColor: gradient,
//         fill: true,
//         tension: 0.45,
//         borderWidth: 2.5,
//         pointRadius: 0,
//         pointHoverRadius: 2
//       }
//     ]
//   },

//   options: {
//   responsive: true,
//   maintainAspectRatio: false,

//   // 🔥 SMOOTH SLIDE ANIMATION
//   animation: {
//     duration: 900,
//     easing: "easeInOutQuart"
//   },

//   transitions: {
//     active: {
//       animation: {
//         duration: 600
//       }
//     }
//   },

//   plugins: {
//     legend: { display: false },
//     tooltip: {
//       backgroundColor: "#111",
//       titleColor: "#0d6efd",
//       bodyColor: "#fff",
//       displayColors: false,
//       callbacks: {
//         title: function(ctx) {
//           return new Date(ctx[0].parsed.x).toLocaleString();
//         },
//         label: function(ctx) {
//           return "Reading : " + Math.round(ctx.parsed.y);
//           // return "Reading : " + ctx.parsed.y.toFixed(2);
//         }
//       }
//     }
//   },

// scales: {
//   x: {
//     type: "time",
//     grid: { display: false }
//   },
// y: {
//   beginAtZero: false,

//   grid: { 
//     color: "rgba(0,0,0,0.05)" 
//   },

//   ticks: {
//     stepSize: 5,
//     autoSkip : false,
//     maxTicksLimit: 20,               // ✅ ab apply hoga
//     callback: function(value) {
//       return Math.round(value);
//     }
//   }
// }
// }
//   }
// });


//   options: {
//     responsive: true,
//     maintainAspectRatio: false,

//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         backgroundColor: "#111",
//         titleColor: "#0d6efd",
//         bodyColor: "#fff",
//         displayColors: false,
//         callbacks: {
//           title: function(ctx) {
//             return new Date(ctx[0].parsed.x).toLocaleString();
//           },
//           label: function(ctx) {
//             return "Reading : " + ctx.parsed.y.toFixed(2);
//           }
//         }
//       }
//     },

//     scales: {
//       x: {
//         type: "time",
//         grid: { display: false }
//       },
//       y: {
//         beginAtZero: true,
//         grid: { color: "rgba(0,0,0,0.05)" }
//       }
//     }
//   }
// });


    // 🔹 Update alarms
    // const alarmsRaw = await (await fetch(API.devicealarmlog + `?centre=${currentCentreId}&category=${currentCategoryId}`)).json();

   // 🔹 Detect VOC category
const isVOCDevice = allCategories.find(c => c.CATEGORY_ID === currentCategoryId)?.CATEGORY_NAME?.toLowerCase().includes("voc");

// 🔹 Filter alarms
// const now = new Date();

let alarms = alarmsRaw.filter(a => {

    if (a.DEVICE_ID !== device.DEVICE_ID) return false;

    const alarmTime = new Date(
        (a.ALARM_DATE || a.CREATED_DATE || a.DATE || '') + "T" +
        (a.ALARM_TIME || a.CREATED_TIME || '')
    );

    // ❌ invalid date guard
    if (isNaN(alarmTime)) return false;

    // ✅ ONLY LAST 24 HOURS
    return (now - alarmTime) <= (24 * 60 * 60 * 1000);
});

const offlineEvents = statusAlarmsRaw.map(s => ({
    DEVICE_ID: s.DEVICE_ID,

    PARAMETER_ID: null, // status alarm

    ALARM_TEXT: "DEVICE OFFLINE",

    // 🔴 offline kab hua
    ALARM_DATE: s.CREATED_ON_DATE,
    ALARM_TIME: s.CREATED_ON_TIME,

    // 🟢 online kab hua
    RESOLVED_DATE: s.IS_ACTIVE === 0 ? s.UPDATED_ON_DATE : null,
    RESOLVED_TIME: s.IS_ACTIVE === 0 ? s.UPDATED_ON_TIME : null,

    IS_ACTIVE: s.IS_ACTIVE
}));




// 🔥 ONLY selected parameter ka alarm dekho (Incubator logic)
let filteredAlarms = alarms;

if (window.currentGraphParameterId) {
    filteredAlarms = alarms.filter(a =>
        String(a.PARAMETER_ID) === String(window.currentGraphParameterId)
    );
}

// 🔥 sirf selected parameter ka ACTIVE alarm
const hasActiveAlarm = filteredAlarms.some(a => a.IS_ACTIVE === 1);

const card = document.getElementById(`card_${device.DEVICE_ID}`);


const categoryName = category?.CATEGORY_NAME?.toLowerCase() || "";

// ✅ Only incubator & voc ko red hone se bachana hai
const isSpecial =
    categoryName.includes("incubator") ||
    categoryName.includes("voc");


if (card) {

    // 🟢 Special devices → card always green if online
    if (isSpecial) {

        if (device.status === "active") {
            card.classList.remove("bg-secondary");
            card.classList.add("bg-success");
        } else {
            card.classList.remove("bg-success");
            card.classList.add("bg-secondary");
        }

    }
    // 🔴 Normal devices (Refri / Cryo) → old logic same
    else {

        if (hasActiveAlarm) {
            card.classList.remove("bg-success");
            card.classList.add("bg-danger");
        } else {
            card.classList.remove("bg-danger");
            card.classList.add("bg-success");
        }

    }
}


if (isVOCDevice) {
    alarms = alarms.filter(a => {
        const param = masterparameter.find(p => String(p.PARAMETER_ID) === String(a.PARAMETER_ID));
        return param && param.PARAMETER_NAME.toLowerCase().includes("voc");
    });
}

// Use robust sorting like devicealarmlog
// 🔥 PARAMETER + OFFLINE ALARMS MERGE
// alarms = [...alarms, ...offlineEvents];

alarms = alarms.sort((a, b) => {
    const aDateTime = new Date(
        (a.ALARM_DATE || a.CREATED_DATE || a.DATE || '') + " " + (a.ALARM_TIME || a.CREATED_TIME || '')
    );
    const bDateTime = new Date(
        (b.ALARM_DATE || b.CREATED_DATE || b.DATE || '') + " " + (b.ALARM_TIME || b.CREATED_TIME || '')
    );

    if (!isNaN(aDateTime) && !isNaN(bDateTime)) {
        return bDateTime - aDateTime; // latest first
    }

    if (a.S_NO && b.S_NO) return b.S_NO - a.S_NO;
    if (a.READING && b.READING) return b.READING - a.READING;

    return 0;
});

const alarmBody = document.getElementById("alarmLog");
alarmBody.innerHTML = "";

const deviceStatusAlarm = statusAlarmsRaw
  .filter(s => {

    if (s.DEVICE_ID !== device.DEVICE_ID) return false;

    const alarmTime = new Date(
      s.CREATED_ON_DATE + "T" + s.CREATED_ON_TIME
    );

    // 🔥 EXACT same 24h logic as temperature alarms
    return (now - alarmTime) <= (24 * 60 * 60 * 1000);
  })
  .sort((a,b)=>{
    const aTime = new Date(a.CREATED_ON_DATE + "T" + a.CREATED_ON_TIME);
    const bTime = new Date(b.CREATED_ON_DATE + "T" + b.CREATED_ON_TIME);
    return bTime - aTime;
  })[0];


if (deviceStatusAlarm) {

  const raisedTime = formatDateTimeDDMMYY(
    deviceStatusAlarm.CREATED_ON_DATE,
    deviceStatusAlarm.CREATED_ON_TIME
  );

  const resolvedTime =
    deviceStatusAlarm.IS_ACTIVE === 0
      ? formatDateTimeDDMMYY(
          deviceStatusAlarm.UPDATED_ON_DATE,
          deviceStatusAlarm.UPDATED_ON_TIME
        )
      : "-";

  alarmBody.innerHTML += `
    <tr>
      <td data-label="Device">${device.DEVICE_NAME}</td>
      <td data-label="Alarm">DEVICE OFFLINE</td>
      <td data-label="Raised Time">${raisedTime}</td>
      <td data-label="Resolution Time">${resolvedTime}</td>
      <td data-label="Status">
        <span class="badge ${deviceStatusAlarm.IS_ACTIVE ? "bg-danger" : "bg-success"}">
          ${deviceStatusAlarm.IS_ACTIVE ? "Active" : "Resolved"}
        </span>
      </td>
    </tr>
  `;
}


let activeCount = 0;

alarms.forEach(a => {

    const isActive = a.IS_ACTIVE === 1;
    if (isActive) activeCount++;

    // check incubator category
    const category = allCategories.find(c => c.CATEGORY_ID === currentCategoryId);
    const isIncubator = category?.CATEGORY_NAME?.toLowerCase().includes("incubator");

    // get parameter name
const param = a.PARAMETER_ID
    ? masterparameter.find(p => p.PARAMETER_ID == a.PARAMETER_ID)
    : null;


//     alarmBody.innerHTML += `
//         <tr>
//             <td>${device.DEVICE_NAME}</td>

//             <td>
//                 ${
//                     isIncubator 
//                     ? (param?.PARAMETER_NAME || "Unknown") + " → "
//                     : ""
//                 }
//                 ${a.READING ?? "-"}
//             </td>

//             <td>${a.ALARM_DATE} ${a.ALARM_TIME}</td>

//             <td>
//                 <span class="badge ${isActive ? 'bg-danger' : 'bg-success'}">
//                     ${isActive ? 'Active' : 'Resolved'}
//                 </span>
//             </td>
//         </tr>`;
// });

const raisedTime = formatDateTimeDDMMYY(a.ALARM_DATE, a.ALARM_TIME);

// 🔹 Resolution time (sirf resolved alarm ke liye)
const resolutionTime =
    !isActive
        ? formatDateTimeDDMMYY(
            a.RESOLVED_DATE || a.NORMALIZED_DATE || a.ALARM_DATE,
            a.RESOLVED_TIME || a.NORMALIZED_TIME || a.ALARM_TIME
          )
        : "-";

        

alarmBody.innerHTML += `
    <tr>
        <!-- Device -->
        <td data-label="Device">
          ${device.DEVICE_NAME}</td>

        <!-- Alarm (integer value) -->
       <td data-label="Alarm">
  ${
    a.ALARM_TEXT
      ? a.ALARM_TEXT
      : (
          isIncubator
            ? (param?.PARAMETER_NAME || "Unknown") + " → "
            : ""
        ) +
        (a.READING !== null
          ? Math.round(a.READING) + " " +
            (masteruom.find(u => u.UOM_ID == param?.UOM_ID)?.UOM_NAME || "")
          : "-"
        )
  }
</td>


        <!-- Raised Time -->
        <td data-label="Raised Time">
          ${raisedTime}</td>

        <!-- Alarm Resolution Time -->
        <td data-label="Resolution Time">
          ${resolutionTime}</td>

        <!-- Status (unchanged) -->
        <td data-label="Status">
            <span class="badge ${isActive ? 'bg-danger' : 'bg-success'}">
                ${isActive ? 'Active' : 'Resolved'}
            </span>
        </td>
    </tr>`;
});
filterAlarmTableLast24h();

document.getElementById("alarm24h").textContent =
    alarms.filter(a => {
        const dt = new Date((a.ALARM_DATE || a.CREATED_DATE || a.DATE || '') + " " + (a.ALARM_TIME || a.CREATED_TIME || ''));
        return !isNaN(dt) && (now - dt <= 24 * 60 * 60 * 1000);
    }).length;

document.getElementById("activeAlarmCount").textContent = activeCount;


    // 🔁 Auto-refresh graph every 30 minutes (1800000 ms)
if (window.deviceGraphRefreshInterval) clearInterval(window.deviceGraphRefreshInterval);

    updateSummary();

}

document.querySelector('.navbar-toggler').addEventListener('click', () => {

  document.querySelector('.sidebar').classList.toggle('active');

});



/* ⭐ OPTIONAL PRO UX */
document.addEventListener("click", function(e){

  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".navbar-toggler");

  if(!sidebar.contains(e.target) && !toggle.contains(e.target)){
      sidebar.classList.remove("active");
  }

});





// Event listeners
//document.getElementById("startDateTime").addEventListener("change",()=>{ if(currentCategoryId) updateDashboardLive(currentCategoryId); });
//document.getElementById("endDateTime").addEventListener("change",()=>{ if(currentCategoryId) updateDashboardLive(currentCategoryId); });
document.getElementById("organizationSelect").addEventListener("change",e=>loadCentres(e.target.value));
document.getElementById("centreSelect").addEventListener("change",e=>loadDevices(e.target.value));

/* ============================================================
   FILTER ALARM TABLE (LAST 24 HOURS ONLY)
   ============================================================ */

function filterAlarmTableLast24h() {

    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24 hours

    const rows = document.querySelectorAll("#alarmLog tr");

    rows.forEach(row => {

        // 👉 Time + Date 3rd column me hai (index 2)
        const dateTimeText = row.cells[2].innerText.trim();  

        // "YYYY-MM-DD HH:mm:ss" ko JS Date me convert
        const dt = new Date(dateTimeText.replace(" ", "T"));

        // console.log(dt);  // debug chahiye to

        if (dt < cutoff) {
            row.style.display = "none";   // purane chhupa do
        } else {
            row.style.display = "";       // recent dikhao
        }
    });
}


function updateLastRefreshTime() {
    const now = new Date();

    // save in localStorage
    localStorage.setItem("lastRefreshTime", now.toString());

    // show nicely formatted
    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    document.getElementById("lastRefreshText").innerText =
        "Last refreshed: " + now.toLocaleString("en-GB", options);
}

// when page loads, read last saved time
window.addEventListener("load", function () {

    // ⭐ navbar labels force show (no flicker)
    const centreLbl = document.getElementById("navbarCentreLabel");
    if (centreLbl) centreLbl.style.display = "block";

    const orgLbl = document.getElementById("navbarOrgLabel");
    if (orgLbl) orgLbl.style.display = "block";

    const saved = localStorage.getItem("lastRefreshTime");

//     setNavbarOrgCentre(
//   localStorage.getItem("ORG_NAME"),
//   localStorage.getItem("CENTRE_NAME")
// );


    if (saved) {

        const dt = new Date(saved);

        const options = {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        };

        document.getElementById("lastRefreshText").innerText =
            "Last refreshed: " + dt.toLocaleString("en-GB", options);

    } else {

        document.getElementById("lastRefreshText").innerText =
            "Last refreshed: never";
    }
});

function updateAverageBox(dataPoints, param, masteruom) {

    const avgBox = document.getElementById("avgBox");

    if (!dataPoints.length || !param) {
        avgBox.innerText = "Avg: --";
        avgBox.style.background = "#e9ecef";
        avgBox.style.color = "#000";
        return;
    }

    // 🔹 Calculate average
    const sum = dataPoints.reduce((a,b)=>a + b.y, 0);
    const avg = sum / dataPoints.length;

    // 🔹 UOM
    const uomObj = masteruom.find(u => String(u.UOM_ID) === String(param.UOM_ID));
    const uom = uomObj?.UOM_NAME || "";

    // 🔹 Thresholds
    const lower = parseFloat(param.LOWER_THRESHOLD || 0);
    const upper = parseFloat(param.UPPER_THRESHOLD || 0);

    let status = "Normal";
    let bg = "#28a745"; // green

    if (upper && avg > upper) {
        status = "High";
        bg = "#dc3545";
    }
    else if (lower && avg < lower) {
        status = "Low";
        bg = "#ffc107";
    }

    avgBox.innerText = `Avg: ${avg.toFixed(2)} ${uom} (${status})`;
    avgBox.style.background = bg;
    avgBox.style.color = "#fff";
}

// 🔁 Avg box click = change time range
let avgRangeIndex = 0;
const avgRanges = [10, 60, 1440];   // 10 min, 1 hour, 1 day

function cycleAvgRange(){
    avgRangeIndex = (avgRangeIndex + 1) % avgRanges.length;
    setGraphRange(avgRanges[avgRangeIndex]);
}

function validateDateRangeLive(){

    const startVal = document.getElementById("startDateTime").value;
    const endVal   = document.getElementById("endDateTime").value;

    if(!startVal || !endVal) return;

    const start = new Date(startVal);
    const end   = new Date(endVal);

    if(end < start){
        alert("End date must be after start date");
        document.getElementById("endDateTime").value = "";
        return;
    }

    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    if(diffDays > 3){
        alert("⚠ You can select maximum 3 days only");
        document.getElementById("endDateTime").value = "";
    }
}

document.getElementById("startDateTime").addEventListener("change", validateDateRangeLive);
document.getElementById("endDateTime").addEventListener("change", validateDateRangeLive);



function markActiveRange(mins){
  document.querySelectorAll(".range-btn").forEach(b=>{
    b.classList.remove("btn-primary");
    b.classList.add("btn-outline-primary");
  });

  const btn = document.querySelector(`[data-min='${mins}']`);
  if(btn){
    btn.classList.remove("btn-outline-primary");
    btn.classList.add("btn-primary");
  }
}



function setNavbarOrgCentre(orgName, centreName){

    // set text values
    document.getElementById("navbarOrgName").innerText = orgName || "-";
    document.getElementById("navbarCentreName").innerText = centreName || "-";

    // also store
    localStorage.setItem("ORG_NAME", orgName || "");
    localStorage.setItem("CENTRE_NAME", centreName || "");

    document.getElementById("mobileOrgName").innerText = orgName || "-";
document.getElementById("mobileCentreName").innerText = centreName || "-";

}

async function updateSummaryLive(){

    if(!currentCentreId) return;

    try{

        // 🔥 CACHE BASED FETCH (sirf pehli baar API call)
if (!window.cache.centreReadings[currentCentreId]) {
    window.cache.centreReadings[currentCentreId] =
        await fetch(API.devicereadinglog + `?centre=${currentCentreId}`)
            .then(r => r.json());
}

const readingsDataRaw =
    window.cache.centreReadings[currentCentreId];// new fast opening 1


        const now = new Date();

        allDevices.forEach(device=>{

            const deviceReadings = readingsDataRaw
                .filter(r => r.DEVICE_ID === device.DEVICE_ID)
                .sort((a,b)=>new Date(a.READING_DATE+'T'+a.READING_TIME) - new Date(b.READING_DATE+'T'+b.READING_TIME));

            const latest = deviceReadings[deviceReadings.length-1];

            if(!latest){
                device.status = "offline";
                return;
            }

            const readingTime = new Date(latest.READING_DATE + "T" + latest.READING_TIME);

            device.status =
                (now - readingTime <= 10*60*1000)
                ? "active"
                : "offline";

        });

        updateSummary();

    }
    catch(err){
        console.error("Summary Live Error:",err);
    }
}

// ============================================================
// EDIT USER FUNCTION
// ============================================================

function editUser(userId){

    console.log("Edit clicked for:", userId);

    // Find user from table list (temporary logic)
    fetch(BASE_URL + "/api/masteruser/")
        .then(res => res.json())
        .then(users => {

            const user = users.find(u => u.USER_ID == userId);
            if(!user){
                alert("User not found");
                return;
            }
            editingUserId = user.USER_ID;

            // 🔹 Fill form fields
            document.getElementById("newActualName").value = user.ACTUAL_NAME || "";
            document.getElementById("newUsername").value = user.USERNAME || "";
            document.getElementById("email").value = user.EMAIL || "";
            document.getElementById("phone").value = user.PHONE || "";
            document.getElementById("validityStart").value = user.VALIDITY_START || "";
            document.getElementById("validityEnd").value = user.VALIDITY_END || "";
            document.getElementById("newUserRole").value = user.ROLE_ID;

            // 🔹 Change button text
            document.querySelector("#createUserForm button[type='submit']").innerText = "Update";

            // 🔹 Open modal
            const modal = new bootstrap.Modal(
                document.getElementById('createUserModal')
            );
            modal.show();

        });
}


function applyCentreRoleUI(user, centres) {

    const centreText = document.getElementById("navbarCentreName");
    const centreDropdown = document.getElementById("adminCentreDropdown");
    const mobileDropdown = document.getElementById("mobileAdminCentreDropdown");

    if (!centreText || !centreDropdown) return;

    if (user.ROLE_ID == 2) {

        // 🔥 Hide text
        centreText.style.display = "none";

        // 🔥 Show desktop dropdown
        centreDropdown.style.display = "inline-block";

        // 🔥 Show mobile dropdown (if exists)
        if (mobileDropdown) {
            mobileDropdown.style.display = "block";
        }

        centreDropdown.innerHTML = "";
        if (mobileDropdown) mobileDropdown.innerHTML = "";

        const orgId = document.getElementById("organizationSelect").value;

        const filteredCentres = centres.filter(c => 
            String(c.ORGANIZATION_ID) === String(orgId)
        );

        filteredCentres.forEach(c => {

            // Desktop option
            const option1 = document.createElement("option");
            option1.value = c.CENTRE_ID;
            option1.textContent = c.CENTRE_NAME;
            centreDropdown.appendChild(option1);

            // 🔥 Mobile option
            if (mobileDropdown) {
                const option2 = document.createElement("option");
                option2.value = c.CENTRE_ID;
                option2.textContent = c.CENTRE_NAME;
                mobileDropdown.appendChild(option2);
            }
        });

        centreDropdown.value = currentCentreId;
        if (mobileDropdown) mobileDropdown.value = currentCentreId;

        // Desktop change
        centreDropdown.onchange = function () {
            currentCentreId = this.value;
            loadDevices(this.value);
        };

        // 🔥 Mobile change
        if (mobileDropdown) {
            mobileDropdown.onchange = function () {
                currentCentreId = this.value;
                loadDevices(this.value);
            };
        }

    } else {

        centreText.style.display = "inline";
        centreDropdown.style.display = "none";

        if (mobileDropdown) {
            mobileDropdown.style.display = "none";
        }
    }
}



/* ============================================================
   INITIALIZE DASHBOARD
   - Load organizations
   - Apply role rules
   - Start live summary updates
   ============================================================ */


(async function(){ 
    await loadOrganizations();
    handleRoleDisable();
})();// new fast opening 2
