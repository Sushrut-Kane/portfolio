const circle1 = document.getElementById("circle1");
const circle2 = document.getElementById("circle2");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function getClientPosition(e) {
  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  } else {
    return {
      x: e.clientX,
      y: e.clientY
    };
  }
}

function startDrag(e) {
  const pos = getClientPosition(e);
  offsetX = pos.x - circle1.offsetLeft;
  offsetY = pos.y - circle1.offsetTop;
  isDragging = true;
  circle1.style.cursor = "grabbing";
  e.preventDefault();
}

function stopDrag() {
  isDragging = false;
  circle1.style.cursor = "grab";
}

function onMove(e) {
  if (!isDragging) return;

  const pos = getClientPosition(e);
  let newX = pos.x - offsetX;
  let newY = pos.y - offsetY;

  // Bound within screen
  const maxX = window.innerWidth - circle1.offsetWidth;
  const maxY = window.innerHeight - circle1.offsetHeight;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  circle1.style.left = `${newX}px`;
  circle1.style.top = `${newY}px`;

  // Repel logic
  const dx = circle2.offsetLeft - newX;
  const dy = circle2.offsetTop - newY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const repelDistance = 120;

  if (distance < repelDistance) {
    const angle = Math.atan2(dy, dx);
    const force = (repelDistance - distance) * 1.5;

    let repelX = circle2.offsetLeft + Math.cos(angle) * force;
    let repelY = circle2.offsetTop + Math.sin(angle) * force;

    repelX = Math.max(0, Math.min(window.innerWidth - circle2.offsetWidth, repelX));
    repelY = Math.max(0, Math.min(window.innerHeight - circle2.offsetHeight, repelY));

    circle2.style.left = `${repelX}px`;
    circle2.style.top = `${repelY}px`;
  }
}

// Desktop
circle1.addEventListener("mousedown", startDrag);
document.addEventListener("mousemove", onMove);
document.addEventListener("mouseup", stopDrag);

// Mobile
circle1.addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("touchmove", onMove, { passive: false });
document.addEventListener("touchend", stopDrag);
