// ---- Floor data -------------------------------------------------------------
const FLOORS = {
  2: {
    title: "2nd Floor Map",
    rooms: [
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "210",
      "211",
      "212",
    ],
    large: new Set(["212"]),
  },
  3: {
    title: "3rd Floor Map",
    rooms: [
      "301",
      "302",
      "303",
      "304",
      "305",
      "306",
      "307",
      "308",
      "309",
      "310",
      "311",
      "312",
      "314",
    ],
    large: new Set(["301", "303", "306", "309", "312", "314"]),
  },
  4: {
    title: "4th Floor Map",
    rooms: [
      "401",
      "402",
      "403",
      "404",
      "405",
      "406",
      "407",
      "408",
      "409",
      "410",
      "411",
    ],
    large: new Set(["401", "403", "406", "409"]),
  },
  5: {
    title: "5th Floor Map",
    rooms: [
      "501A",
      "501B",
      "502",
      "503",
      "504",
      "505",
      "506",
      "507",
      "508",
      "509",
      "509U",
    ],
    large: new Set(["502", "505", "506", "508", "509"]),
  },
  6: {
    title: "6th Floor Map",
    rooms: [
      "601",
      "602",
      "603",
      "604",
      "605",
      "606",
      "607",
      "608",
      "609",
      "611",
    ],
    large: new Set(["604", "608", "611"]),
  },
};

// ---- Capacity & thresholds --------------------------------------------------
const MAX_CAP = 15; // limit for Join/Add

function categoryFromCount(c) {
  if (c >= MAX_CAP) return "full";
  if (c >= 11) return "busy";
  if (c >= 6) return "moderate";
  if (c >= 1) return "less";
  return "empty";
}
const CATEGORY_LABEL = {
  empty: "Empty",
  less: "Less busy",
  moderate: "Moderate",
  busy: "Busy",
  full: "Full",
};

// Live counts per room (in-memory)
const counts = {};

// Tooltip text — includes capacity (20/40) AND live count (x/15)
function toolText(el) {
  const roomId = el.dataset.roomId;
  const c = counts[roomId] || 0;
  const cat = categoryFromCount(c);
  const capVis = Number(el.dataset.cap); // 20 or 40 (visual room size)
  return `Room ${roomId} - Capacity ${capVis} - ${CATEGORY_LABEL[cat]} (${c}/${MAX_CAP})`;
}

function applyStatusClass(el, roomId) {
  el.classList.remove("empty", "less", "moderate", "busy", "full");
  const c = counts[roomId] || 0;
  el.classList.add(categoryFromCount(c));
}

// ---- Build maps -------------------------------------------------------------
const root = document.getElementById("maps-root");

function buildMap(floorKey) {
  const { title, rooms, large } = FLOORS[floorKey];

  const container = document.createElement("section");
  container.className = "map-container";
  container.id = `map${floorKey}F`;

  const h2 = document.createElement("h2");
  h2.textContent = title;
  container.appendChild(h2);

  const grid = document.createElement("div");
  grid.className = "building";

  rooms.forEach((roomId) => {
    const sizeClass = large.has(roomId) ? "large" : "small";
    const capVis = large.has(roomId) ? 40 : 20; // just for display in tooltip

    const div = document.createElement("div");
    div.className = `room ${sizeClass} empty`;
    div.dataset.roomId = roomId;
    div.dataset.cap = String(capVis); // store capacity on the element

    div.textContent = roomId;

    const tip = document.createElement("div");
    tip.className = "tooltip";
    tip.textContent = toolText(div);
    div.appendChild(tip);

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      openPopover(div);
    });

    grid.appendChild(div);
  });

  container.appendChild(grid);

  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <div><span class="empty"></span> Empty</div>
    <div><span class="less"></span> Less busy</div>
    <div><span class="moderate"></span> Moderate</div>
    <div><span class="busy"></span> Busy</div>
    <div><span class="full"></span> Full</div>
  `;
  container.appendChild(legend);

  root.appendChild(container);
}

Object.keys(FLOORS).forEach(buildMap);

// ---- Show/hide floors -------------------------------------------------------
const floorButtons = document.querySelectorAll(".floor-selector button");

function show(floorKey) {
  document
    .querySelectorAll(".map-container")
    .forEach((el) => (el.style.display = "none"));
  if (floorKey === "all") {
    document
      .querySelectorAll(".map-container")
      .forEach((el) => (el.style.display = "flex"));
  } else {
    const el = document.getElementById(`map${floorKey}F`);
    if (el) el.style.display = "flex";
  }
}
floorButtons.forEach((btn) =>
  btn.addEventListener("click", () => show(btn.dataset.floor))
);

// ✅ default to ALL floors on refresh
show("all");

// ---- Popover (Join/Leave + quick-set status) --------------------------------
let popoverEl = null,
  backdropEl = null;

function closePopover() {
  popoverEl?.remove();
  backdropEl?.remove();
  popoverEl = null;
  backdropEl = null;
}

function openPopover(anchorEl) {
  closePopover();

  // clickable backdrop (works across floors)
  backdropEl = document.createElement("div");
  backdropEl.className = "popover-backdrop";
  backdropEl.addEventListener("click", closePopover);
  document.body.appendChild(backdropEl);

  popoverEl = document.createElement("div");
  popoverEl.className = "popover";

  const roomId = anchorEl.dataset.roomId;
  const cur = counts[roomId] || 0;
  const capVis = Number(anchorEl.dataset.cap);

  popoverEl.innerHTML = `
    <h3>Room ${roomId}</h3>
    <div class="meta">Seats: <strong>${capVis}</strong> &nbsp;|&nbsp; Using now: <strong id="pv-count">${cur}</strong> / ${MAX_CAP}</div>
    <div class="actions">
      <button class="btn-join" id="pv-join">Join</button>
      <button class="btn-leave" id="pv-leave">Leave</button>
      <button class="btn-close" id="pv-close">Close</button>
    </div>
    <div class="hr"></div>
    <div class="meta">Quick set status</div>
    <div class="actions">
      <button data-cat="empty">Empty</button>
      <button data-cat="less">Less busy</button>
      <button data-cat="moderate">Moderate</button>
      <button data-cat="busy">Busy</button>
      <button data-cat="full">Full</button>
    </div>
  `;
  document.body.appendChild(popoverEl);

  // position beside the clicked room
  const r = anchorEl.getBoundingClientRect();
  const top = Math.max(12, r.top + window.scrollY - 10);
  const left = Math.min(
    window.scrollX + r.left + r.width + 10,
    window.scrollX +
      document.documentElement.clientWidth -
      popoverEl.offsetWidth -
      12
  );
  popoverEl.style.top = `${top}px`;
  popoverEl.style.left = `${left}px`;

  const joinBtn = popoverEl.querySelector("#pv-join");
  const leaveBtn = popoverEl.querySelector("#pv-leave");
  const closeBtn = popoverEl.querySelector("#pv-close");
  const quickBtns = popoverEl.querySelectorAll("[data-cat]");
  const countSpan = popoverEl.querySelector("#pv-count");

  function refreshButtons() {
    const c = counts[roomId] || 0;
    joinBtn.disabled = c >= MAX_CAP;
    leaveBtn.disabled = c <= 0;
    countSpan.textContent = c;
  }

  function updateRoom() {
    // update tooltip + border
    anchorEl.querySelector(".tooltip").textContent = toolText(anchorEl);
    applyStatusClass(anchorEl, roomId);
    refreshButtons();
  }

  joinBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    counts[roomId] = Math.min(MAX_CAP, (counts[roomId] || 0) + 1);
    updateRoom();
  });

  leaveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    counts[roomId] = Math.max(0, (counts[roomId] || 0) - 1);
    updateRoom();
  });

  const REP = { empty: 0, less: 1, moderate: 6, busy: 11, full: 15 };
  quickBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      counts[roomId] = REP[btn.dataset.cat];
      updateRoom();
    });
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closePopover();
  });

  refreshButtons();
}
