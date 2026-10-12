/* =========================
   TAT CORE LOGIC
   Shared between index.html and tat-custom.html
   ========================= */

let pdfDoc = null;
let totalPages = 0;
let selectedPages = null;
let skipRequested = false;
let stopRequested = false;
let testRunning = false;
let testCompletedOnce = false;
let reviewMenuOpen = false;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");
const viewerMessage = document.getElementById("viewerMessage");
const statusDisplay = document.getElementById("status");
const pictureCount = document.getElementById("pictureCount");
const bigTimer = document.getElementById("bigTimer");
const reviewContainer = document.getElementById("reviewContainer");

/* =========================
   LOAD PDF (accepts URL string or File/Blob)
   ========================= */

async function loadPDF(pdfSource) {
  try {
    let loadingTask;
    if (typeof pdfSource === "string") {
      loadingTask = pdfjsLib.getDocument(pdfSource);
    } else {
      const arrayBuffer = await pdfSource.arrayBuffer();
      loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    }
    pdfDoc = await loadingTask.promise;
    totalPages = pdfDoc.numPages;
    viewerMessage.innerText = "TEST READY";
    statusDisplay.innerText = "PDF Loaded";
    return true;
  } catch (error) {
    viewerMessage.innerText = "PDF NOT FOUND";
    statusDisplay.innerText = "Missing PDF";
    console.error(error);
    return false;
  }
}

/* =========================
   BEEP
   ========================= */

function beep() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = 700;
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

/* =========================
   TIMER
   ========================= */

async function countdown(seconds) {
  skipRequested = false;
  return new Promise((resolve) => {
    function updateTimer() {
      if (stopRequested) {
        clearInterval(interval);
        resolve("stopped");
        return;
      }
      let mins = Math.floor(seconds / 60);
      let secs = seconds % 60;
      mins = mins < 10 ? "0" + mins : mins;
      secs = secs < 10 ? "0" + secs : secs;
      bigTimer.innerText = `${mins}:${secs}`;
      if (skipRequested) {
        clearInterval(interval);
        resolve("skipped");
        return;
      }
      if (seconds <= 0) {
        clearInterval(interval);
        resolve("done");
        return;
      }
      seconds--;
    }
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
  });
}

/* =========================
   PAGE SELECTION (sequential or custom ranges)
   ========================= */

let currentPageIndex = 0;

function getNextPage() {
  if (selectedPages && selectedPages.length > 0) {
    return selectedPages[currentPageIndex];
  }
  currentPageIndex++;
  return currentPageIndex;
}

function setSelectedPages(pages) {
  selectedPages = pages;
  currentPageIndex = 0;
}

window.setSelectedPages = setSelectedPages;

/* =========================
   RENDER PAGE
   ========================= */

async function renderPage(pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.7 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;
}

/* =========================
   CLEAR CANVAS
   ========================= */

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
}

/* =========================
   SAVE REVIEW
   ========================= */

async function saveReview(pageNum, picNo) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 0.5 });
  tempCanvas.width = viewport.width;
  tempCanvas.height = viewport.height;
  await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;

  const card = document.createElement("div");
  card.className = "logCard";
  const title = document.createElement("p");
  title.innerText = "Picture " + picNo;
  const img = document.createElement("img");
  img.src = tempCanvas.toDataURL();
  img.className = "log-image";
  img.addEventListener("click", async () => {
    if (testRunning) return;
    viewerMessage.style.display = "none";
    await renderPage(pageNum);
    statusDisplay.innerText = "Reviewing Picture " + picNo;
    pictureCount.innerText = `Picture ${picNo} / 12`;
  });
  card.appendChild(title);
  card.appendChild(img);
  reviewContainer.appendChild(card);
}

/* =========================
   REVIEW MENU
   ========================= */

document.getElementById("toggleLogBtn").addEventListener("click", () => {
  if (!testCompletedOnce) {
    alert("Complete at least one test to unlock Review Menu");
    return;
  }
  if (testRunning) {
    alert("Review Menu Locked During Test");
    return;
  }
  const btn = document.getElementById("toggleLogBtn");
  if (reviewMenuOpen) {
    reviewContainer.style.display = "none";
    reviewMenuOpen = false;
    btn.innerText = "Open Review Menu";
  } else {
    reviewContainer.style.display = "flex";
    reviewMenuOpen = true;
    btn.innerText = "Close Review Menu";
  }
});

/* =========================
   SKIP BUTTON
   ========================= */

document.getElementById("skipBtn").addEventListener("click", () => {
  skipRequested = true;
});

/* =========================
   STOP BUTTON
   ========================= */

document.getElementById("stopBtn").addEventListener("click", () => {
  if (!testRunning) return;
  stopRequested = true;
});

/* =========================
   START TEST
   ========================= */

document.getElementById("startBtn").addEventListener("click", async () => {
  if (!pdfDoc) {
    alert("PDF NOT LOADED");
    return;
  }
  document.documentElement.requestFullscreen();
  testRunning = true;
  stopRequested = false;
  currentPageIndex = 0;
  reviewContainer.innerHTML = "";
  reviewContainer.style.display = "none";
  reviewMenuOpen = false;
  document.getElementById("toggleLogBtn").innerText = "Open Review Menu";
  pictureCount.innerText = "Picture 1 / 12";
  statusDisplay.innerText = "Get Ready";
  viewerMessage.style.display = "flex";
  viewerMessage.innerText = "GET READY";
  clearCanvas();
  let result = await countdown(5);
  if (result === "stopped") {
    stopTest();
    return;
  }
  for (let i = 1; i <= 11; i++) {
    pictureCount.innerText = `Picture ${i} / 12`;
    const pageNum = getNextPage();
    beep();
    viewerMessage.style.display = "none";
    await renderPage(pageNum);
    await saveReview(pageNum, i);
    statusDisplay.innerText = "Observe Picture";
    result = await countdown(30);
    if (result === "stopped") {
      stopTest();
      return;
    }
    clearCanvas();
    viewerMessage.style.display = "flex";
    viewerMessage.innerText = "WRITE YOUR STORY";
    statusDisplay.innerText = "Write Story";
    result = await countdown(240);
    if (result === "stopped") {
      stopTest();
      return;
    }
  }
  pictureCount.innerText = "Picture 12 / 12";
  clearCanvas();
  beep();
  viewerMessage.style.display = "flex";
  viewerMessage.innerText = "BLANK SLIDE";
  statusDisplay.innerText = "Blank Slide";
  result = await countdown(30);
  if (result === "stopped") {
    stopTest();
    return;
  }
  viewerMessage.innerText = "WRITE YOUR STORY";
  statusDisplay.innerText = "Write Story";
  result = await countdown(240);
  if (result === "stopped") {
    stopTest();
    return;
  }
  viewerMessage.innerText = "TAT COMPLETED";
  statusDisplay.innerText = "Completed";
  bigTimer.innerText = "DONE";
  testRunning = false;
  testCompletedOnce = true;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
});

/* =========================
   STOP TEST
   ========================= */

function stopTest() {
  testRunning = false;
  testCompletedOnce = true;
  reviewContainer.style.display = "none";
  reviewMenuOpen = false;
  document.getElementById("toggleLogBtn").innerText = "Open Review Menu";
  clearCanvas();
  viewerMessage.style.display = "flex";
  viewerMessage.innerText = "TEST STOPPED";
  statusDisplay.innerText = "Test Stopped";
  bigTimer.innerText = "STOP";
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

/* =========================
   PUBLIC INIT
   Call this after PDF.js loads
   ========================= */

async function initTAT(pdfSource) {
  const ok = await loadPDF(pdfSource);
  if (!ok) return false;
  // UI is ready — main screen already visible in index.html
  // In tat-custom.html, caller hides upload screen after this resolves
  return true;
}

// Expose for tat-custom.html
window.initTAT = initTAT;