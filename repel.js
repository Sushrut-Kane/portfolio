const circle1 = document.getElementById("circle1");
const circle2 = document.getElementById("circle2");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function getClientPosition(e) {
  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  } else {
    return {
      x: e.clientX,
      y: e.clientY,
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
  // Fire trail effect
  const fireTrail = document.getElementById("fire-trail");
  const fire = document.createElement("div");
  fire.className = "fire-particle";
  fire.style.left = `${newX + 20}px`; // Adjust to center the trail
  fire.style.top = `${newY + 20}px`;
  fireTrail.appendChild(fire);

  // Clean up after animation
  setTimeout(() => {
    fireTrail.removeChild(fire);
  }, 600);

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

    const padding = 30; // padding from the screen edge

    repelX = Math.max(padding, Math.min(window.innerWidth - circle2.offsetWidth - padding, repelX));
    repelY = Math.max(padding, Math.min(window.innerHeight - circle2.offsetHeight - padding, repelY));
    

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

// 3d art

document.addEventListener("mousemove", (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const percentX = (e.clientX - centerX) / centerX;
  const percentY = (e.clientY - centerY) / centerY;

  const rotateY = percentX * 15; // Max 15deg rotation left/right
  const rotateX = -percentY * 15; // Max 15deg rotation up/down

  // Apply to both circles
  circle1.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  circle2.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
