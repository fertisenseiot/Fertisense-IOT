/* ============================================================
   USER DASHBOARD MAIN SCRIPT - OPTIMIZED
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
  
const BASE_URL = "https://fertisense-iot-production.up.railway.app";
// const BASE_URL ="http://127.0.0.1:8000";

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
let centreData=[], allDevices=[], allCategories=[], currentCentreId=null, currentUser=null;
let editingUserId = null;
let currentCategoryId=null, liveUpdateTimer=null;
window.currentDeviceGraphDeviceId = null;
let graphRangeMinutes = 1440;   
window.currentGraphParameterId = null;   

// 🚀 GLOBAL CACHE FOR STATIC DATA
let globalParams = [];
let globalUOMs = [];

document.addEventListener("DOMContentLoaded", function () {
    const orgLabel = document.getElementById("navbarOrgLabel");
    const centreLabel = document.getElementById("navbarCentreLabel");
    if (orgLabel) orgLabel.style.display = "none";
    if (centreLabel) centreLabel.style.display = "none";
});

/* ============================================================
   INITIALIZATION
   ============================================================ */
(async function(){ 
    await preloadMasterData();
    await loadOrganizations();
    await checkSubscriptionStatus(); 
    handleRoleDisable();
})();

// 🚀 PRELOAD MASTER DATA ONCE
async function preloadMasterData() {
    try {
        const [params, uoms] = await Promise.all([
            fetch(API.masterparameter).then(r=>r.json()),
            fetch(API.masteruom).then(r=>r.json())
        ]);
        globalParams = params || [];
        globalUOMs = uoms || [];
    } catch (err) {
        console.error("Failed to preload master data:", err);
    }
}

function getDeviceType(device){
    const category = allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID);
    const name = category?.CATEGORY_NAME?.toLowerCase() || "";
    if(name.includes("incubator") || name.includes("voc")) return "MULTI";
    if(name.includes("refricheck") || name.includes("cryo")) return "SINGLE";
    return "UNKNOWN";
}

/* ============================================================
   LOAD ORGANIZATIONS & CENTRES
   ============================================================ */
async function loadOrganizations(){
    try{
        const userRes = await fetch(BASE_URL + "/api/currentuser/", { credentials: "include" });
        currentUser = await userRes.json();
        
        if (!currentUser || !currentUser.USER_ID) {
            console.error("❌ currentUser not ready", currentUser);
            return;
        } 

        const linkRes = await fetch(API.userorganizationcentrelink, { credentials: "include" });
        const userLinks = await linkRes.json();
        
        if (!Array.isArray(userLinks)) {
            console.error("❌ userorgcentre API failed", userLinks);
            return;  
        }
        
        const allowedOrgIds = userLinks.map(l => l.ORGANIZATION_ID);
        const res = await fetch(API.masterorganizations);
        const orgs = await res.json();
        
        const orgSelect = document.getElementById("organizationSelect");
        
        // 🚀 DOM BUFFERING
        let orgHtml = '<option value="">Select Organization</option>';
        orgs.filter(o => allowedOrgIds.includes(o.ORGANIZATION_ID))
            .forEach(o => orgHtml += `<option value="${o.ORGANIZATION_ID}">${o.ORGANIZATION_NAME}</option>`);
        orgSelect.innerHTML = orgHtml;
        
        if(userLinks.length>0){
            orgSelect.value = userLinks[0].ORGANIZATION_ID;
            await loadCentres(orgSelect.value, true, userLinks[0].CENTRE_ID);
        }

        try {
            const orgLabel = document.getElementById("navbarOrgName");
            const orgWrapper = document.getElementById("navbarOrgLabel");
            if (orgWrapper) orgWrapper.style.display = "block";
            const selectedOrg = orgs.find(o => o.ORGANIZATION_ID == orgSelect.value);
            if (selectedOrg && orgLabel) {
                orgLabel.innerText = "Organization: " + selectedOrg.ORGANIZATION_NAME;
            }
        } catch(e){}

        if (userLinks.length > 0) {
            const orgName = orgs.find(o => o.ORGANIZATION_ID == userLinks[0].ORGANIZATION_ID)?.ORGANIZATION_NAME || "";
            const centreName = centreData.find(c => c.CENTRE_ID == userLinks[0].CENTRE_ID)?.CENTRE_NAME || "";
            setNavbarOrgCentre(orgName, centreName);
            applyCentreRoleUI(currentUser, centreData);
        }
    }catch(err){ console.error(err);}
}

async function loadCentres(orgId, auto = false, userCentreId = null) {
    const centreSelect = document.getElementById("centreSelect");
    if (!orgId) return;

    try {
        if (!centreData.length) {
            const res = await fetch(API.mastercentre);
            centreData = await res.json();
        }

        let filtered = centreData.filter(c => c.ORGANIZATION_ID == orgId);
        
        // 🚀 DOM BUFFERING
        let centreHtml = '<option value="">Select Centre</option>';
        filtered.forEach(c => {
            centreHtml += `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`;
        });
        centreSelect.innerHTML = centreHtml;

        if (auto && userCentreId) {
            centreSelect.value = userCentreId;
            currentCentreId = userCentreId;
            loadDevices(userCentreId);
        }

        try {
            const label = document.getElementById("navbarCentreName");
            const labelWrapper = document.getElementById("navbarCentreLabel");
            if (labelWrapper) labelWrapper.style.display = "block";

            if (label) {
                let centreObj = centreData.find(c => c.CENTRE_ID == currentCentreId) || centreData.find(c => c.CENTRE_ID == centreSelect.value);
                if (centreObj) label.innerHTML = " Centre: " + centreObj.CENTRE_NAME;
            }
        } catch (e) {}

        const orgText = document.getElementById("organizationSelect").selectedOptions[0]?.textContent || "";
        let centreText = centreSelect.value ? centreSelect.selectedOptions[0]?.textContent : (centreData.find(c => c.CENTRE_ID == userCentreId)?.CENTRE_NAME || "");

        setNavbarOrgCentre(orgText, centreText);
    } catch (err) {
        console.error(err);
    }
}

async function loadDevices(centreId){
    currentCentreId = centreId;
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

function clearFilters(){
    document.getElementById("startDateTime").value = "";
    document.getElementById("endDateTime").value = "";
    if(currentCategoryId) updateDashboardLive(currentCategoryId);
    if(window.currentDeviceGraphDeviceId){
        const d = allDevices.find(x => x.DEVICE_ID === window.currentDeviceGraphDeviceId);
        if(d) loadDeviceReadings(d);
    }
}

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
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function setGraphRange(minutes){
    graphRangeMinutes = minutes;
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
        const d = allDevices.find(x => x.DEVICE_ID === window.currentDeviceGraphDeviceId);
        if(d) loadDeviceReadings(d);
    }
}

function showCategoryCards(){
    document.getElementById("deviceDetailsContainer").style.display="none";
    const container = document.getElementById("deviceTypeCards");
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
   USER MANAGEMENT
   ============================================================ */
function showUserForm() {
    if(currentUser.ROLE_ID !== 2) return;
    const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
    modal.show();
    loadUserList();
    document.getElementById("userListContainer").style.display = "block";
}

async function loadUserList() {
    try {
        const res = await fetch(BASE_URL + "/api/masteruser/");
        let users = await res.json();
        users = users.filter(u => u.CREATED_BY === currentUser.USER_ID).sort((a,b)=> b.USER_ID - a.USER_ID);

        const tbody = document.getElementById("userListBody");
        
        // 🚀 DOM BUFFERING
        let rows = "";
        users.forEach((u, index) => {
            const serial = index + 1;
            const validity = `${u.VALIDITY_START || '-'} → ${u.VALIDITY_END || '-'}`;
            rows += `
                <tr>
                    <td>${serial}</td>
                    <td>${u.USERNAME}</td>
                    <td>${u.ACTUAL_NAME}</td>
                    <td>${u.EMAIL}</td>
                    <td>${u.PHONE || '-'}</td>
                    <td>${u.ROLE_ID == 2 ? "IoT Admin" : "User"}</td>
                    <td>${validity}</td>
                    <td><button class="btn btn-sm btn-warning" onclick="editUser(${u.USER_ID})">Edit</button></td>
                </tr>`;
        });
        tbody.innerHTML = rows;
    } catch (err) {
        console.error("Failed to load users:", err);
    }
}

document.getElementById("createUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const now = new Date();
    const username = document.getElementById("newUsername").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const actualName = document.getElementById("newActualName").value.trim();

    if (!username || !password || !confirmPassword || !actualName || !email) {
        alert("❌ Please fill all required fields!"); return;
    }
    if (password !== confirmPassword) {
        alert("❌ Passwords do not match!"); return;
    }

    try {
        const resUsers = await fetch(BASE_URL + "/api/masteruser/");
        const users = await resUsers.json();
        const filteredUsers = users.filter(u => u.CREATED_BY === currentUser.USER_ID);

        if (filteredUsers.some(u => u.USERNAME.toLowerCase() === username.toLowerCase())) {
            alert("❌ Username already exists!"); return;
        }
        if (filteredUsers.some(u => u.EMAIL.toLowerCase() === email.toLowerCase())) {
            alert("❌ Email already exists!"); return;
        }

        const payload = {
            USERNAME: username, PASSWORD: password, ACTUAL_NAME: actualName, EMAIL: email,
            PHONE: document.getElementById("phone").value.trim() || null,
            CREATED_BY: currentUser.USER_ID, CREATED_ON: now.toISOString().split("T")[0],
            VALIDITY_START: document.getElementById("validityStart").value || now.toISOString().split("T")[0],
            VALIDITY_END: document.getElementById("validityEnd").value || null,
            SEND_EMAIL: document.getElementById("sendEmail").checked,
            SEND_SMS: document.getElementById("sendSMS").checked,
            ROLE_ID: parseInt(document.getElementById("newUserRole").value),
            PASSWORD_RESET: false
        };

        let url = BASE_URL + "/api/masteruser/";
        let method = "POST";
        if(editingUserId){
            url = BASE_URL + "/api/masteruser/" + editingUserId + "/";
            method = "PUT";
        }

        const res = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

        if (res.ok) {
            alert(editingUserId ? "✅ User updated successfully!" : "✅ User created successfully!");
            document.getElementById("createUserForm").reset();
            loadUserList();
            editingUserId = null;
            document.querySelector("#createUserForm button[type='submit']").innerText = "Create";
        } else {
            const data = await res.json();
            let messages = [];
            if (data.USERNAME) messages.push("Username already exists!");
            if (data.EMAIL) messages.push("Email already exists!");
            alert(messages.length ? `❌ ${messages.join("\n")}` : "❌ Failed to create user!");
        }
    } catch (err) {
        alert("❌ Error creating user! Please try again.");
    }
});

function handleRoleDisable() {
    if (currentUser.ROLE_ID !== 2) {
        const org = document.getElementById("organizationSelect")?.parentElement;
        const centre = document.getElementById("centreSelect")?.parentElement;
        if (org) org.style.display = "none";
        if (centre) centre.style.display = "none";
        return;
    }
    const navItem = document.getElementById("userManagementNav");
    if (navItem) navItem.classList.remove("d-none");
}

function showUserOrgCentreLinkForm(){
    if(currentUser.ROLE_ID !== 2) return;
    const modal = new bootstrap.Modal(document.getElementById('userLinkModal'));
    modal.show();
    loadUsersForLink();
    loadOrganizationsForLink();
    loadUserOrgCentreLinks();
}

function togglePassword() {
    const passwordField = document.getElementById("newPassword");
    const confirmField = document.getElementById("confirmPassword");
    const checkbox = document.getElementById("showPassword");
    passwordField.type = confirmField.type = checkbox.checked ? "text" : "password";
}

function hideUserOrgCentreLinkForm(){
    document.getElementById("userOrgCentreLinkSection").style.display="none";
    document.getElementById("deviceTypeCards").style.display="flex";
}

async function loadUsersForLink() {
    try {
        const res = await fetch(BASE_URL + "/api/masteruser/");
        const users = await res.json();
        const filteredUsers = users.filter(u => u.CREATED_BY === currentUser.USER_ID);
        const select = document.getElementById("linkUserSelect");
        
        let html = '<option value="">Select User</option>';
        filteredUsers.forEach(u => html += `<option value="${u.USER_ID}">${u.ACTUAL_NAME} (${u.USERNAME})</option>`);
        select.innerHTML = html;
    } catch(err){ console.error(err); }
}

async function loadOrganizationsForLink() {
    try{
        const linkRes = await fetch(API.userorganizationcentrelink, { credentials: "include" });
        const links = await linkRes.json();
        if (!Array.isArray(links)) return;
        
        const allowedOrgIds = [...new Set(links.map(l=>l.ORGANIZATION_ID))];
        const resOrgs = await fetch(API.masterorganizations);
        const orgs = await resOrgs.json();
        const select = document.getElementById("linkOrgSelect");
        
        let html = '<option value="">Select Organization</option>';
        orgs.filter(o=>allowedOrgIds.includes(o.ORGANIZATION_ID))
            .forEach(o => html += `<option value="${o.ORGANIZATION_ID}">${o.ORGANIZATION_NAME}</option>`);
        select.innerHTML = html;
        select.addEventListener("change", e=>loadCentresForLink(e.target.value));
    }catch(err){ console.error(err); }
}

async function loadCentresForLink(orgId){
    const select = document.getElementById("linkCentreSelect");
    if(!orgId) {
        select.innerHTML = '<option value="">Select Centre</option>';
        return;
    }
    try{
        const resCentres = await fetch(API.mastercentre);
        const centres = await resCentres.json();
        let html = '<option value="">Select Centre</option>';
        centres.filter(c => c.ORGANIZATION_ID == orgId).forEach(c=> html += `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`);
        select.innerHTML = html;
    }catch(err){ console.error(err); }
}

document.getElementById("saveUserLinkBtn").addEventListener("click", async () => {
    const userId = document.getElementById("linkUserSelect").value;
    const orgId = document.getElementById("linkOrgSelect").value;
    const centreId = document.getElementById("linkCentreSelect").value;

    if (!userId || !orgId || !centreId) { alert("Select all fields!"); return; }

    try {
        const resUsers = await fetch(BASE_URL + "/api/masteruser/");
        const users = await resUsers.json();
        const user = users.find(u => u.USER_ID == userId);
        if (!user || user.CREATED_BY != currentUser.USER_ID) {
            alert("❌ You can only link users you have created!"); return;
        }

        const payload = { USER_ID: parseInt(userId), ORGANIZATION_ID: parseInt(orgId), CENTRE_ID: parseInt(centreId), created_by: parseInt(currentUser.USER_ID) };
        const res = await fetch(API.userorganizationcentrelinks, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

        if (res.ok) { 
            alert("✅ Link saved!"); 
            await loadUserOrgCentreLinks(); 
        } else {
            alert("❌ Failed to save link! Check console for details.");
        }
    } catch (err) {
        alert("❌ Error saving link!");
    }
});

async function loadUserOrgCentreLinks() {
    try {
        const res = await fetch(API.userorganizationcentrelinks, { credentials: "include" });
        let links = await res.json();

        const [usersRes, orgsRes, centresRes] = await Promise.all([
            fetch(API.createuser), fetch(API.masterorganizations), fetch(API.mastercentre)
        ]);

        const users = await usersRes.json();
        const orgs = await orgsRes.json();
        const centres = await centresRes.json();

        links = links.filter(l => l.created_by === currentUser.USER_ID).sort((a,b)=> (b.LINK_ID || 0) - (a.LINK_ID || 0));
        const tbody = document.getElementById("userOrgCentreLinksBody");
        
        let rows = "";
        links.forEach((l, index) => {
            const userName = users.find(u => u.USER_ID === l.USER_ID)?.ACTUAL_NAME || '-';
            const orgName = orgs.find(o => o.ORGANIZATION_ID === l.ORGANIZATION_ID)?.ORGANIZATION_NAME || '-';
            const centreName = centres.find(c => c.CENTRE_ID === l.CENTRE_ID)?.CENTRE_NAME || '-';
            rows += `<tr><td>${index + 1}</td><td>${userName}</td><td>${orgName}</td><td>${centreName}</td></tr>`;
        });
        tbody.innerHTML = rows;
    } catch (err) {
        console.error("Failed to load user-org-centre links:", err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const startInput = document.getElementById('validityStart');
    const endInput = document.getElementById('validityEnd');
    
    const today = new Date();
    startInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const endDateObj = new Date(today);
    endDateObj.setFullYear(endDateObj.getFullYear() + 1);
    endInput.value = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
});

function backToDashboard(){ 
    showCategoryCards(); 
    if(liveUpdateTimer) clearTimeout(liveUpdateTimer);
    window.currentDeviceGraphDeviceId = null;
}

function logout(){
    localStorage.removeItem("ORG_NAME");
    localStorage.removeItem("CENTRE_NAME");
    localStorage.removeItem("lastRefreshTime");
    fetch('/logout/', { credentials: "include" }).then(()=>window.location='/login/');
}

/* ============================================================
   LIVE UPDATES & GRAPHING (OPTIMIZED)
   ============================================================ */
function startLiveUpdates(categoryId){
    // Removed setInterval to prevent overlap. Used manual updates per original intent.
    updateDashboardLive(categoryId);
}

function manualRefresh(){
    if(currentCategoryId) updateDashboardLive(currentCategoryId);
    if(window.currentDeviceGraphDeviceId){
        const currentDevice = allDevices.find(d => d.DEVICE_ID === window.currentDeviceGraphDeviceId);
        if(currentDevice) loadDeviceReadings(currentDevice);
    }
    updateLastRefreshTime();
}

function applyDateFilter(){
    const startInput = document.getElementById("startDateTime").value;
    const endInput   = document.getElementById("endDateTime").value;

    if(!startInput || !endInput){ alert("Please select both start and end date."); return; }
    if(new Date(endInput) < new Date(startInput)){ alert("End date must be after Start date."); return; }
    if((new Date(endInput) - new Date(startInput)) / (1000 * 60 * 60 * 24) > 3){ alert("⚠ You can view data for maximum 3 days only."); return; }

    if(currentCategoryId) updateDashboardLive(currentCategoryId);
    if(window.currentDeviceGraphDeviceId){
        const d = allDevices.find(x => x.DEVICE_ID === window.currentDeviceGraphDeviceId);
        if(d) loadDeviceReadings(d);
    }
}

async function updateDashboardLive(categoryId){
    if(!currentCentreId) return;

    const devices = allDevices.filter(d => d.CATEGORY_ID === categoryId);
    
    // 🚀 BATCH FETCH & TIME CALCULATION
    const readingsDataRaw = await (await fetch(API.devicereadinglog + `?centre=${currentCentreId}&category=${categoryId}`)).json();
    readingsDataRaw.forEach(r => r.timeMs = new Date(r.READING_DATE + 'T' + r.READING_TIME).getTime());
    
    const nowMs = Date.now();

    devices.forEach(device => {
        // 🚀 FASTER SORTING USING CACHED TIMESTAMP
        const deviceReadings = readingsDataRaw
            .filter(r => r.DEVICE_ID === device.DEVICE_ID)
            .sort((a,b)=> a.timeMs - b.timeMs);

        let status = "offline", displayVal = "Offline";

        if (deviceReadings.length > 0) {
            const category = allCategories.find(c=>c.CATEGORY_ID===device.CATEGORY_ID);
            const isVOC = category?.CATEGORY_NAME?.toLowerCase().includes("voc");

            let filteredReadings = deviceReadings;
            if(isVOC){
                filteredReadings = deviceReadings.filter(r=>{
                    const param = globalParams.find(p=>p.PARAMETER_ID==r.PARAMETER_ID);
                    return param?.PARAMETER_NAME?.toLowerCase().includes("voc");
                });
            }

            const latestReading = filteredReadings[filteredReadings.length - 1] || deviceReadings[deviceReadings.length - 1];

            if (nowMs - latestReading.timeMs <= 10 * 60 * 1000) {
                status = "active";
                const param = globalParams.find(p => String(p.PARAMETER_ID) === String(latestReading.PARAMETER_ID));
                const uom = (param ? globalUOMs.find(u => String(u.UOM_ID) === String(param.UOM_ID)) : null)?.UOM_NAME || '';
                displayVal = Math.round(parseFloat(latestReading.READING)) + ' ' + uom;
            }
        }

        device.status = status;
        const el = document.getElementById(`currentTemp_${device.DEVICE_ID}`);
        if(el) {
            const latest = deviceReadings[deviceReadings.length - 1];
            if(!latest){
                el.innerText = "Offline";
            } else {
                const param = globalParams.find(p => String(p.PARAMETER_ID) === String(latest.PARAMETER_ID));
                const uom = (param ? globalUOMs.find(u => String(u.UOM_ID) === String(param.UOM_ID)) : null)?.UOM_NAME || "";
                el.innerHTML = `<div style="font-size:10px;">${param?.PARAMETER_NAME || "Reading"}</div><div style="font-size:16px;font-weight:600;">${Math.round(parseFloat(latest.READING))} ${uom}</div>`;
            }
        }
        
        const card = document.getElementById(`card_${device.DEVICE_ID}`);
        if(card){
            card.className = status==="active" ? "device-card bg-success" : "device-card bg-secondary";
        }
    });

    updateSummary();
}

async function openDeviceDashboard(categoryId){
    currentCategoryId = categoryId;
    window.currentGraphParameterId = null;

    document.getElementById("deviceTypeCards").innerHTML="";
    document.getElementById("deviceDetailsContainer").style.display="block";

    const category = allCategories.find(c=>c.CATEGORY_ID===categoryId);
    document.getElementById("deviceTypeTitle").textContent = category?.CATEGORY_NAME || categoryId;

    const devices = allDevices.filter(d=>d.CATEGORY_ID===categoryId);
    const deviceList = document.getElementById("deviceList");
    deviceList.innerHTML = "";

    devices.forEach(device=>{
        const div = document.createElement("div");
        div.className = "device-card bg-secondary";
        div.style.cursor = "pointer";
        div.id = `card_${device.DEVICE_ID}`;
        const isMultiParam = getDeviceType(device) === "MULTI";

        if(isMultiParam){
            div.innerHTML = `<h6>${device.DEVICE_NAME}</h6><div id="param1_${device.DEVICE_ID}" class="device-reading">Loading...</div><div id="param2_${device.DEVICE_ID}" class="device-reading"></div><div id="param3_${device.DEVICE_ID}" class="device-reading"></div><div class="device-hint"></div>`;
        }else{
            div.innerHTML = `<h6>${device.DEVICE_NAME}</h6><p id="currentTemp_${device.DEVICE_ID}" style="font-weight:600;">Loading...</p><div class="device-hint"></div>`;
        }
        div.addEventListener("click",()=>loadDeviceReadings(device));
        deviceList.appendChild(div);
    });

    // 🚀 FETCH READINGS ONCE FOR FAST CARD LOADS
    let readingsDataRaw = await fetch(API.devicereadinglog + `?centre=${currentCentreId}`).then(r=>r.json());
    readingsDataRaw.forEach(r => r.timeMs = new Date(r.READING_DATE + "T" + r.READING_TIME).getTime());

    devices.forEach(device=>{
        loadCardReadingFast(device, readingsDataRaw);
    });

    updateDashboardLive(categoryId);
}

// 🚀 REFACTORED TO ACCEPT PRE-FETCHED DATA
async function loadCardReadingFast(device, readingsDataRaw){
    const cardEl = document.getElementById(`card_${device.DEVICE_ID}`);
    const category = allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID);
    const isMultiParam = getDeviceType(device) === "MULTI";

    if (isMultiParam) {
        const p1 = document.getElementById(`param1_${device.DEVICE_ID}`);
        const p2 = document.getElementById(`param2_${device.DEVICE_ID}`);
        const p3 = document.getElementById(`param3_${device.DEVICE_ID}`);

        try{
            const ownReadings = readingsDataRaw.filter(r => r.DEVICE_ID == device.DEVICE_ID).sort((a,b)=> a.timeMs - b.timeMs);

            if(!ownReadings.length){
                p1.innerText = "Offline"; p2.innerText = ""; p3.innerText = "";
                cardEl.className = "device-card bg-secondary"; return;
            }

            let grouped = {};
            ownReadings.forEach(r => {
                if (!grouped[r.PARAMETER_ID]) grouped[r.PARAMETER_ID] = [];
                grouped[r.PARAMETER_ID].push(r);
            });

            let keys = globalParams.filter(p => grouped[p.PARAMETER_ID]).map(p => p.PARAMETER_ID).slice(0,3);
            let displayTargets = [p1, p2, p3];

            keys.forEach((k, idx) => {
                const last = grouped[k][grouped[k].length - 1];
                if (Date.now() - last.timeMs > 10 * 60 * 1000) {
                    p1.innerText = "Offline"; p2.innerText = ""; p3.innerText = "";
                    cardEl.className = "device-card bg-secondary"; return;
                }

                const param = globalParams.find(mp => mp.PARAMETER_ID == k);
                const uomObj = globalUOMs.find(u => u.UOM_ID == param?.UOM_ID);
                const readingVal = parseFloat(last.READING);
                const lower = parseFloat(param.LOWER_THRESHOLD || 0);
                const upper = parseFloat(param.UPPER_THRESHOLD || 0);
                let btnColor = "btn-light", indicator = "";

                if (upper && readingVal > upper) { btnColor = "btn-danger"; indicator = " ↑"; }
                else if (lower && readingVal < lower) { btnColor = "btn-danger"; indicator = " ↓"; }

                displayTargets[idx].innerHTML = `
                  <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:6px;">
                      <span>${param.PARAMETER_NAME}: ${Math.round(readingVal)} ${uomObj?.UOM_NAME || ''}</span>
                      <button class="btn btn-sm ${btnColor}" style="font-size:10px;padding:2px 8px;" data-param="${param.PARAMETER_ID}">View${indicator}</button>
                  </div>`;

                displayTargets[idx].querySelector("button").onclick = (e) => {
                    e.stopPropagation();
                    window.currentGraphParameterId = param.PARAMETER_ID;
                    window.manualGraphLock = true;   
                    loadDeviceReadings(device);
                    setTimeout(() => window.manualGraphLock = false, 1000);
                };
            });

            let latestTime = null;
            keys.forEach(k => {
                const last = grouped[k][grouped[k].length - 1];
                if (!latestTime || last.timeMs > latestTime) latestTime = last.timeMs;
            });

            cardEl.className = (!latestTime || (Date.now() - latestTime) > 10 * 60 * 1000) ? "device-card bg-secondary" : "device-card bg-success";
        } catch(err){
            p1.innerText = "Offline"; p2.innerText = ""; p3.innerText = "";
            cardEl.className = "device-card bg-secondary";
        }
        return;   
    }

    // ORIGINAL LOGIC FOR NORMAL DEVICES
    const valueEl = document.getElementById(`currentTemp_${device.DEVICE_ID}`);
    if (!valueEl) return;

    try {
        const ownReadings = readingsDataRaw.filter(r => r.DEVICE_ID == device.DEVICE_ID).sort((a,b)=> a.timeMs - b.timeMs);
        if (!ownReadings.length) {
            valueEl.innerText = "Offline"; cardEl.className = "device-card bg-secondary"; return;
        }

        const last = ownReadings[ownReadings.length - 1];
        if (Date.now() - last.timeMs > 10 * 60 * 1000) {
            valueEl.innerText = "Offline"; cardEl.className = "device-card bg-secondary"; return;
        }

        const param = globalParams.find(p => p.PARAMETER_ID == last.PARAMETER_ID);
        const uom = globalUOMs.find(u => u.UOM_ID == param?.UOM_ID)?.UOM_NAME || "";
        valueEl.innerText = Math.round(last.READING) + " " + uom;
        cardEl.className = "device-card bg-success";
    } catch (err) {
        valueEl.innerText = "Offline"; cardEl.className = "device-card bg-secondary";
    }
}

function groupByMinute(points, mode="average") {
    const map = new Map();
    points.forEach(p => {
        const d = p.x;
        const key = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0") + "T" + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0") + ":00";
        if(!map.has(key)) map.set(key, []);
        map.get(key).push(p.y);
    });

    const result = [];
    map.forEach((values, key) => {
        let value = mode==="average" ? values.reduce((a,b)=>a+b,0)/values.length : values[values.length-1];
        const base = Math.round(value);
        const lifted = points.length > 1 ? base + (Math.random() * 0.08 - 0.04) : base;
        result.push({ x: new Date(key), y: lifted });
    });
    result.sort((a,b)=>a.x-b.x);
    return result;
}

function downsample(points, max = 120) {
    if (points.length <= max) return points;
    const step = Math.ceil(points.length / max);
    return points.filter((_, i) => i % step === 0);
}

// Ensure loadDeviceReadings relies on globalParams instead of fetching.
async function loadDeviceReadings(device){
    window.currentDeviceGraphDeviceId = device.DEVICE_ID;
    if (typeof window.graphRangeInitialized === "undefined") {
        graphRangeMinutes = 10; markActiveRange(10); window.graphRangeInitialized = true;
    }
    if (window.manualGraphLock && !window.currentGraphParameterId) return;

    const startInput = document.getElementById("startDateTime").value;
    const endInput = document.getElementById("endDateTime").value;
    let now = new Date(), start, end;

    if(startInput && endInput){ start = new Date(startInput); end = new Date(endInput); }
    else{ start = new Date(now.getTime() - graphRangeMinutes * 60 * 1000); end = now; }

    const readingsDataRaw = await fetch(API.devicereadinglog + `?centre=${currentCentreId}`).then(r => r.json());
    
    if (!window.currentGraphParameterId && readingsDataRaw.length) {
        const firstReading = readingsDataRaw.find(r => r.DEVICE_ID === device.DEVICE_ID);
        if (firstReading) window.currentGraphParameterId = firstReading.PARAMETER_ID;
    }

    let dataPoints = readingsDataRaw
        .filter(r => r.DEVICE_ID === device.DEVICE_ID)
        .map(r => ({ x: new Date(r.READING_DATE + "T" + r.READING_TIME), y: parseFloat(r.READING), paramId: r.PARAMETER_ID }))
        .filter(p => p.x >= start && p.x <= end)
        .sort((a, b) => a.x.getTime() - b.x.getTime()); // 🔥 FIX: Properly sort by Time

    if (window.currentGraphParameterId) dataPoints = dataPoints.filter(p => String(p.paramId) === String(window.currentGraphParameterId));

    if (!dataPoints.length && getDeviceType(device) === "MULTI") {
        dataPoints = readingsDataRaw.filter(r => r.DEVICE_ID === device.DEVICE_ID)
            .map(r => ({ x: new Date(r.READING_DATE + "T" + r.READING_TIME), y: parseFloat(r.READING), paramId: r.PARAMETER_ID }))
            .sort((a, b) => a.x.getTime() - b.x.getTime()); // 🔥 FIX: Sort here as well

        if (window.currentGraphParameterId) dataPoints = dataPoints.filter(p => String(p.paramId) === String(window.currentGraphParameterId));
    }

    if (!dataPoints.length && !allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID)?.CATEGORY_NAME?.toLowerCase().includes("incubator")) {
        document.getElementById("avgBox").innerText = "Avg: --"; return;
    }

    let param = window.currentGraphParameterId ? globalParams.find(p => String(p.PARAMETER_ID) === String(window.currentGraphParameterId)) : (dataPoints.length ? globalParams.find(p => String(p.PARAMETER_ID) === String(dataPoints[0].paramId)) : null);
    
    const grouped = groupByMinute(dataPoints.map(p => ({ x: p.x, y: p.y })), "average");
    const dataToPlot = downsample(grouped, graphRangeMinutes <= 60 ? 60 : 120);

    const alarmsRaw = await fetch(API.devicealarmlog + `?centre=${currentCentreId}&category=${currentCategoryId}`).then(r=>r.json());
    const statusAlarmsRaw = await fetch(API.devicestatusalarmlog + `?device=${device.DEVICE_ID}`).then(r=>r.json());

    let offlinePeriods = [];
    statusAlarmsRaw.forEach(s => {
        if (s.DEVICE_ID !== device.DEVICE_ID) return;
        let startTime = new Date(s.CREATED_ON_DATE + "T" + s.CREATED_ON_TIME);
        let endTime = s.IS_ACTIVE === 0 ? new Date(s.UPDATED_ON_DATE + "T" + s.UPDATED_ON_TIME) : new Date();
        if (endTime < start || startTime > end) return;
        if (startTime < start) startTime = start;
        if (endTime > end) endTime = end;
        offlinePeriods.push({ start: startTime, end: endTime });
    });

    offlinePeriods.forEach(p => {
        dataToPlot.forEach(point => { if (point.x >= p.start && point.x <= p.end) point.y = 0; });
    });

    const offlineLineData = [];
    if (dataToPlot.length) {
        offlinePeriods.forEach(p => {
            offlineLineData.push(
                { x: p.start, y: 0, offlineStart: p.start, offlineEnd: p.end },
                { x: p.end, y: 0, offlineStart: p.start, offlineEnd: p.end },
                { x: null, y: null }
            );
        });
    }

    const alarmPoints = [];
    alarmsRaw.forEach(a => {
        if (a.DEVICE_ID !== device.DEVICE_ID) return;
        if (window.currentGraphParameterId && String(a.PARAMETER_ID) !== String(window.currentGraphParameterId)) return;
        const alarmTime = new Date((a.ALARM_DATE || a.CREATED_DATE || a.DATE) + "T" + (a.ALARM_TIME || a.CREATED_TIME));
        const closest = dataToPlot.find(p => Math.abs(new Date(p.x) - alarmTime) < 60000);
        if (closest) alarmPoints.push({ x: closest.x, y: closest.y });
    });

    updateAverageBox(dataToPlot, param, globalUOMs);

    let totalOffline = 0;
    offlinePeriods.forEach(p => totalOffline += (p.end - p.start));
    const totalMinutes = Math.round(totalOffline / 60000);
    const badge = document.getElementById("offlineBadge");
    if(totalMinutes > 0){
        badge.style.display = "inline-block";
        badge.innerText = `Offline: ${Math.floor(totalMinutes/60)}h ${totalMinutes % 60}m`;
    } else {
        badge.style.display = "none";
    }

    const latest = dataPoints[dataPoints.length - 1];
    const isIncubator = allCategories.find(c => c.CATEGORY_ID === device.CATEGORY_ID)?.CATEGORY_NAME?.toLowerCase().includes("incubator");
    
    if (latest) {
        const uom = param ? globalUOMs.find(u => String(u.UOM_ID) === String(param.UOM_ID))?.UOM_NAME || '' : '';
        const readingVal = parseFloat(latest.y);
        let colorClass = "bg-success";
        if (!isNaN(readingVal)) {
            if (param?.UPPER_THRESHOLD && readingVal > param.UPPER_THRESHOLD) colorClass = "bg-danger";
            else if (param?.LOWER_THRESHOLD && readingVal < param.LOWER_THRESHOLD) colorClass = "bg-warning";
        }
        if (!isIncubator) {
            const el = document.getElementById(`currentTemp_${device.DEVICE_ID}`);
            if (el) {
                if(window.currentDeviceGraphDeviceId === device.DEVICE_ID){
                    el.innerHTML = `<span class="device-reading">${param.PARAMETER_NAME.toUpperCase()}: ${Math.round(readingVal)} ${uom}</span>`;
                } else {
                    el.innerHTML = `${Math.round(readingVal)} ${uom}`;
                }
                el.parentElement.className = `device-card ${colorClass}`;
            }
        }
    }

    const step5TicksPlugin = {
        id: 'step5Ticks',
        afterBuildTicks(scale) {
            if (scale.axis !== 'y') return;
            const step = 5;
            const start = Math.floor(scale.min / step) * step;
            const end   = Math.ceil(scale.max / step) * step;
            const ticks = [];
            for (let v = start; v <= end; v += step) ticks.push({ value: v });
            scale.ticks = ticks;
        }
    };

    const ctx = document.getElementById("deviceGraph").getContext('2d');
    if (window.deviceChart) window.deviceChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(13,110,253,.35)");
    gradient.addColorStop(1, "rgba(13,110,253,0)");

    window.deviceChart = new Chart(ctx,{
        type: "line",
        data: {
            datasets: [
                { label: "Offline", data: offlineLineData, borderColor: "#555", borderWidth: 2, tension: 0, fill: false, pointRadius: 0 },
                { label: device.DEVICE_NAME, data: dataToPlot, borderColor: "#0d6efd", backgroundColor: gradient, fill: false, tension: 0.25, spanGaps: true, cubicInterpolationMode: 'monotone', borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4, hitRadius: 15 },
                { label: "Alarms", data: alarmPoints, showLine: false, pointBackgroundColor: "red", pointBorderColor: "white", pointRadius: 5, pointHoverRadius: 7 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx){
                            if(ctx.dataset.label === "Offline"){
                                const durationMs = new Date(ctx.raw.offlineEnd) - new Date(ctx.raw.offlineStart);
                                return ["DEVICE OFFLINE", "From: " + new Date(ctx.raw.offlineStart).toLocaleString("en-GB"), "To: " + new Date(ctx.raw.offlineEnd).toLocaleString("en-GB"), "Duration: " + Math.floor(durationMs / 3600000) + "h " + Math.floor((durationMs % 3600000) / 60000) + "m"];
                            }
                            return "Reading: " + Math.round(ctx.raw.y);
                        }
                    }
                }
            },
            scales: {
                x: { type: "time", grid: { display: false } },
                y: { beginAtZero: true, min:0, grid: { color: "rgba(0,0,0,0.06)" }, ticks: { autoSkip: true, maxTicksLimit: graphRangeMinutes <= 60 ? 5 : 8, precision: 0, padding: 6 } }
            }
        },
        plugins: [step5TicksPlugin]
    });

    document.getElementById("lastRefreshText").style.display = "inline";
    updateLastRefreshTime();

    let alarms = alarmsRaw.filter(a => {
        if (a.DEVICE_ID !== device.DEVICE_ID) return false;
        const alarmTime = new Date((a.ALARM_DATE || a.CREATED_DATE || a.DATE || '') + "T" + (a.ALARM_TIME || a.CREATED_TIME || ''));
        return !isNaN(alarmTime) && (now - alarmTime) <= (24 * 60 * 60 * 1000);
    });

    if(getDeviceType(device) === "MULTI" && window.currentGraphParameterId){
        alarms = alarms.filter(a => String(a.PARAMETER_ID) === String(window.currentGraphParameterId));
    }

    let activeCount = 0;
    const alarmBody = document.getElementById("alarmLog");
    
    // 🚀 DOM BUFFERING FOR ALARMS
    let alarmRowsHtml = "";

    const deviceStatusAlarm = statusAlarmsRaw
      .filter(s => {
        if (s.DEVICE_ID !== device.DEVICE_ID) return false;
        return (now - new Date(s.CREATED_ON_DATE + "T" + s.CREATED_ON_TIME)) <= (24 * 60 * 60 * 1000);
      })
      .sort((a,b)=> new Date(b.CREATED_ON_DATE + "T" + b.CREATED_ON_TIME) - new Date(a.CREATED_ON_DATE + "T" + a.CREATED_ON_TIME))[0];

    if (deviceStatusAlarm) {
      alarmRowsHtml += `<tr><td data-label="Device">${device.DEVICE_NAME}</td><td data-label="Alarm">DEVICE OFFLINE</td><td data-label="Raised Time">${formatDateTimeDDMMYY(deviceStatusAlarm.CREATED_ON_DATE, deviceStatusAlarm.CREATED_ON_TIME)}</td><td data-label="Resolution Time">${deviceStatusAlarm.IS_ACTIVE === 0 ? formatDateTimeDDMMYY(deviceStatusAlarm.UPDATED_ON_DATE, deviceStatusAlarm.UPDATED_ON_TIME) : "-"}</td><td data-label="Status"><span class="badge ${deviceStatusAlarm.IS_ACTIVE ? "bg-danger" : "bg-success"}">${deviceStatusAlarm.IS_ACTIVE ? "Active" : "Resolved"}</span></td></tr>`;
    }

    alarms.sort((a, b) => new Date((b.ALARM_DATE || b.CREATED_DATE || '') + " " + (b.ALARM_TIME || b.CREATED_TIME || '')) - new Date((a.ALARM_DATE || a.CREATED_DATE || '') + " " + (a.ALARM_TIME || a.CREATED_TIME || ''))).forEach(a => {
        const isActive = a.IS_ACTIVE === 1;
        if (isActive) activeCount++;
        const param = a.PARAMETER_ID ? globalParams.find(p => p.PARAMETER_ID == a.PARAMETER_ID) : null;
        alarmRowsHtml += `<tr><td data-label="Device">${device.DEVICE_NAME}</td><td data-label="Alarm">${a.ALARM_TEXT ? a.ALARM_TEXT : (isIncubator ? (param?.PARAMETER_NAME || "Unknown") + " → " : "") + (a.READING !== null ? Math.round(a.READING) + " " + (globalUOMs.find(u => u.UOM_ID == param?.UOM_ID)?.UOM_NAME || "") : "-")}</td><td data-label="Raised Time">${formatDateTimeDDMMYY(a.ALARM_DATE, a.ALARM_TIME)}</td><td data-label="Resolution Time">${!isActive ? formatDateTimeDDMMYY(a.RESOLVED_DATE || a.NORMALIZED_DATE || a.ALARM_DATE, a.RESOLVED_TIME || a.NORMALIZED_TIME || a.ALARM_TIME) : "-"}</td><td data-label="Status"><span class="badge ${isActive ? 'bg-danger' : 'bg-success'}">${isActive ? 'Active' : 'Resolved'}</span></td></tr>`;
    });
    
    alarmBody.innerHTML = alarmRowsHtml;

    document.getElementById("alarm24h").textContent = alarms.length;
    document.getElementById("activeAlarmCount").textContent = activeCount;

    updateSummary();
}

document.querySelector('.navbar-toggler').addEventListener('click', () => { document.querySelector('.sidebar').classList.toggle('active'); });
document.addEventListener("click", function(e){
    const sidebar = document.querySelector(".sidebar");
    const toggle = document.querySelector(".navbar-toggler");
    if(!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove("active");
});

document.getElementById("organizationSelect").addEventListener("change",e=>loadCentres(e.target.value));
document.getElementById("centreSelect").addEventListener("change",e=>loadDevices(e.target.value));

function filterAlarmTableLast24h() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    document.querySelectorAll("#alarmLog tr").forEach(row => {
        const dt = new Date(row.cells[2].innerText.trim().replace(" ", "T"));
        row.style.display = dt < cutoff ? "none" : "";
    });
}

function updateLastRefreshTime() {
    const now = new Date();
    localStorage.setItem("lastRefreshTime", now.toString());
    document.getElementById("lastRefreshText").innerText = "Last refreshed: " + now.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

window.addEventListener("load", function () {
    const centreLbl = document.getElementById("navbarCentreLabel");
    if (centreLbl) centreLbl.style.display = "block";
    const orgLbl = document.getElementById("navbarOrgLabel");
    if (orgLbl) orgLbl.style.display = "block";

    const saved = localStorage.getItem("lastRefreshTime");
    document.getElementById("lastRefreshText").innerText = saved ? "Last refreshed: " + new Date(saved).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Last refreshed: never";
});

function updateAverageBox(dataPoints, param, masteruom) {
    const avgBox = document.getElementById("avgBox");
    if (!dataPoints.length || !param) {
        avgBox.innerText = "Avg: --"; avgBox.style.background = "#e9ecef"; avgBox.style.color = "#000"; return;
    }

    const avg = dataPoints.reduce((a,b)=>a + b.y, 0) / dataPoints.length;
    const uom = masteruom.find(u => String(u.UOM_ID) === String(param.UOM_ID))?.UOM_NAME || "";
    const lower = parseFloat(param.LOWER_THRESHOLD || 0);
    const upper = parseFloat(param.UPPER_THRESHOLD || 0);
    let status = "Normal", bg = "#28a745"; 

    if (upper && avg > upper) { status = "High"; bg = "#dc3545"; }
    else if (lower && avg < lower) { status = "Low"; bg = "#ffc107"; }

    avgBox.innerText = `Avg: ${avg.toFixed(2)} ${uom} (${status})`;
    avgBox.style.background = bg; avgBox.style.color = "#fff";
}

let avgRangeIndex = 0;
const avgRanges = [10, 60, 1440];
function cycleAvgRange(){ setGraphRange(avgRanges[(avgRangeIndex = (avgRangeIndex + 1) % avgRanges.length)]); }

function validateDateRangeLive(){
    const startVal = document.getElementById("startDateTime").value;
    const endVal   = document.getElementById("endDateTime").value;
    if(!startVal || !endVal) return;
    if(new Date(endVal) < new Date(startVal)){ alert("End date must be after start date"); document.getElementById("endDateTime").value = ""; return; }
    if((new Date(endVal) - new Date(startVal)) / 86400000 > 3){ alert("⚠ You can select maximum 3 days only"); document.getElementById("endDateTime").value = ""; }
}

document.getElementById("startDateTime").addEventListener("change", validateDateRangeLive);
document.getElementById("endDateTime").addEventListener("change", validateDateRangeLive);

function markActiveRange(mins){
    document.querySelectorAll(".range-btn").forEach(b=>b.classList.replace("btn-primary", "btn-outline-primary"));
    document.querySelector(`[data-min='${mins}']`)?.classList.replace("btn-outline-primary", "btn-primary");
}

function setNavbarOrgCentre(orgName, centreName){
    document.getElementById("navbarOrgName").innerText = orgName || "-";
    document.getElementById("navbarCentreName").innerText = centreName || "-";
    localStorage.setItem("ORG_NAME", orgName || ""); localStorage.setItem("CENTRE_NAME", centreName || "");
    if(document.getElementById("mobileOrgName")) document.getElementById("mobileOrgName").innerText = orgName || "-";
    if(document.getElementById("mobileCentreName")) document.getElementById("mobileCentreName").innerText = centreName || "-";
}

async function updateSummaryLive(){
    if(!currentCentreId) return;
    try{
        const readingsDataRaw = await fetch(API.devicereadinglog + `?centre=${currentCentreId}`).then(r => r.json());
        const nowMs = Date.now();

        allDevices.forEach(device=>{
            const latest = readingsDataRaw.filter(r => r.DEVICE_ID === device.DEVICE_ID)
                .sort((a,b)=> new Date(a.READING_DATE+'T'+a.READING_TIME).getTime() - new Date(b.READING_DATE+'T'+b.READING_TIME).getTime()).pop();
            
            let status = "offline", displayVal = "Offline";
            if(latest && (nowMs - new Date(latest.READING_DATE + "T" + latest.READING_TIME).getTime() <= 10*60*1000)){
                status = "active"; displayVal = Math.round(latest.READING);
            }
            device.status = status;
            
            const el = document.getElementById(`currentTemp_${device.DEVICE_ID}`);
            if(el) {
                el.innerText = displayVal;
                const card = document.getElementById(`card_${device.DEVICE_ID}`);
                if(card) card.className = status === "active" ? "device-card bg-success" : "device-card bg-secondary";
            }
        });
        updateSummary();
    } catch(err){}
}

function editUser(userId){
    fetch(BASE_URL + "/api/masteruser/").then(res => res.json()).then(users => {
        const user = users.find(u => u.USER_ID == userId);
        if(!user){ alert("User not found"); return; }
        editingUserId = user.USER_ID;
        document.getElementById("newActualName").value = user.ACTUAL_NAME || "";
        document.getElementById("newUsername").value = user.USERNAME || "";
        document.getElementById("email").value = user.EMAIL || "";
        document.getElementById("phone").value = user.PHONE || "";
        document.getElementById("validityStart").value = user.VALIDITY_START || "";
        document.getElementById("validityEnd").value = user.VALIDITY_END || "";
        document.getElementById("newUserRole").value = user.ROLE_ID;
        document.querySelector("#createUserForm button[type='submit']").innerText = "Update";
        new bootstrap.Modal(document.getElementById('createUserModal')).show();
    });
}

function applyCentreRoleUI(user, centres) {
    const centreText = document.getElementById("navbarCentreName");
    const centreDropdown = document.getElementById("adminCentreDropdown");
    const mobileDropdown = document.getElementById("mobileAdminCentreDropdown");
    if (!centreText || !centreDropdown) return;

    if (user.ROLE_ID == 2) {
        centreText.style.display = "none"; centreDropdown.style.display = "inline-block";
        if (mobileDropdown) mobileDropdown.style.display = "block";
        centreDropdown.innerHTML = ""; if (mobileDropdown) mobileDropdown.innerHTML = "";

        const orgId = document.getElementById("organizationSelect").value;
        centres.filter(c => String(c.ORGANIZATION_ID) === String(orgId)).forEach(c => {
            centreDropdown.innerHTML += `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`;
            if (mobileDropdown) mobileDropdown.innerHTML += `<option value="${c.CENTRE_ID}">${c.CENTRE_NAME}</option>`;
        });

        centreDropdown.value = currentCentreId; if (mobileDropdown) mobileDropdown.value = currentCentreId;
        centreDropdown.onchange = function () { currentCentreId = this.value; loadDevices(this.value); };
        if (mobileDropdown) mobileDropdown.onchange = function () { currentCentreId = this.value; loadDevices(this.value); };
    } else {
        centreText.style.display = "inline"; centreDropdown.style.display = "none";
        if (mobileDropdown) mobileDropdown.style.display = "none";
    }
}

async function checkSubscriptionStatus() {
    try {
        const res = await fetch(BASE_URL + "/api/subscription-status/", { credentials: "include" });
        const data = await res.json();
        if (data.expiring_soon && data.remaining_days !== null) {
            showSubscriptionModal("Subscription Expiring Soon", `Your subscription will expire in ${data.remaining_days} day(s). Please contact fertisensellp to renew.`);
        }
    } catch (err) {}
}

function showSubscriptionModal(title, message) {
    if (document.getElementById("subWarningModal")) return;
    document.body.insertAdjacentHTML("beforeend", `<div class="modal fade show" id="subWarningModal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.6);" data-bs-backdrop="static"><div class="modal-dialog modal-dialog-centered"><div class="modal-content text-center p-4"><h4 class="text-warning mb-3">${title}</h4><p>${message}</p><button class="btn btn-primary mt-3" onclick="document.getElementById('subWarningModal').remove()">OK</button></div></div></div>`);
}
