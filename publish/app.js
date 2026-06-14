const rooms = [
  { code: 'CAM-01', name: '主走廊', floor: 'B1 / EAST WING', alert: 'NONE' },
  { code: 'CAM-02', name: '休息室', floor: 'B1 / SOUTH WING', alert: 'NONE' },
  { code: 'CAM-03', name: '储藏间', floor: 'B2 / STORAGE', alert: 'MOTION' },
  { code: 'CAM-04', name: '实验室', floor: 'B2 / LAB AREA', alert: 'NONE' },
  { code: 'CAM-05', name: '电力间', floor: 'B3 / POWER ROOM', alert: 'NOISE' },
  { code: 'CAM-06', name: '出口大厅', floor: 'B1 / EXIT HALL', alert: 'NONE' },
];

const els = {
  grid: document.getElementById('roomGrid'),
  panel: document.getElementById('roomPanel'),
  viewer: document.getElementById('viewer'),
  back: document.getElementById('backButton'),
  code: document.getElementById('roomCode'),
  name: document.getElementById('roomName'),
  floor: document.getElementById('roomFloor'),
  alert: document.getElementById('alertText'),
  power: document.getElementById('power'),
  signal: document.getElementById('signal'),
  time: document.getElementById('time'),
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  els.time.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function openRoom(room) {
  els.code.textContent = room.code;
  els.name.textContent = room.name;
  els.floor.textContent = room.floor;
  els.alert.textContent = room.alert;
  els.panel.style.display = 'none';
  els.viewer.classList.add('active');
}

function closeViewer() {
  els.viewer.classList.remove('active');
  els.panel.style.display = 'flex';
}

function renderRooms() {
  els.grid.innerHTML = '';
  rooms.forEach((room) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `room-card ${room.alert !== 'NONE' ? 'alert' : ''}`;
    button.innerHTML = `<b>${room.code}</b><strong>${room.name}</strong><span>${room.alert}</span>`;
    button.addEventListener('click', () => openRoom(room));
    els.grid.appendChild(button);
  });
}

function updateTelemetry() {
  els.power.textContent = `${82 + Math.floor(Math.random() * 10)}%`;
  els.signal.textContent = Math.random() > 0.2 ? 'STABLE' : 'WEAK';
}

els.back.addEventListener('click', closeViewer);
renderRooms();
updateClock();
updateTelemetry();
setInterval(updateClock, 1000);
setInterval(updateTelemetry, 2400);
