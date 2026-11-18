const PRESIDENT_LISTER_GWA_MINIMUM = 1.21;
const DEAN_LISTER_GWA_MINIMUM = 1.75;
const LATIN_HONOR_CUM_LAUDE_GWA_MINIMUM = 1.75;
const LATIN_HONOR_MAGNA_CUM_LAUDE_GWA_MINIMUM = 1.45;
const LATIN_HONOR_SUMMA_CUM_LAUDE_GWA_MINIMUM = 1.2;
const GGA_GRADE_MINIMUM = 2.0;
const LATIN_HONOR_GRADE_MINIMUM = 2.5;

const sum = (arr) =>
  typeof Math.sumPrecise === "function"
    ? Math.sumPrecise(arr)
    : arr.reduce((a, b) => a + b, 0);
const avg = (arr) => sum(arr) / arr.length;
const isGGAEligible = (year, yearCount) => {
  return (
    yearCount > 1 &&
    year.semesters.length === 2 &&
    +avg(year.semesters.map((s) => s.gwa)).toFixed(2) <= DEAN_LISTER_GWA_MINIMUM
  );
};

function displayCards(cardsBlock, info) {
  function createGgaCardIconSvg() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const attrs = {
      viewBox: "0 0 24 24",
      "stroke-width": "2",
      width: "24",
      height: "24",
      fill: "none",
      stroke: "currentColor",
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
      "aria-hidden": "true",
      class: "lucide lucide-award text-white mt-1 size-6 shrink-0",
    };
    for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);

    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "8");
    circle.setAttribute("r", "6");

    const path = document.createElementNS(ns, "path");
    path.setAttribute(
      "d",
      "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
    );

    svg.appendChild(circle);
    svg.appendChild(path);
    return svg;
  }
  function createLatinCardIconSvg() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const attrs = {
      viewBox: "0 0 24 24",
      "stroke-width": "2",
      width: "24",
      height: "24",
      fill: "none",
      stroke: "currentColor",
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
      "aria-hidden": "true",
      class: "lucide lucide-circle-star text-white mt-1 size-6 shrink-0",
    };
    for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);

    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");

    const path = document.createElementNS(ns, "path");
    path.setAttribute(
      "d",
      "M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z",
    );

    svg.appendChild(circle);
    svg.appendChild(path);
    return svg;
  }
  async function createLogo(insert) {
    const url = new URL("/bulsu-logo.svg", location.origin).href;
    res = await fetch(url);
    content = await res.text();

    img = new DOMParser().parseFromString(
      content,
      "image/svg+xml",
    ).documentElement;
    img.setAttribute("class", "size-30 absolute -right-8 -bottom-8 opacity-50");
    // img.querySelector("rect").setAttribute("class", "size-30");

    insert(img);
  }

  const ggaCard = cardsBlock.lastChild.cloneNode(true);
  const latinCard = cardsBlock.lastChild.cloneNode(true);

  try {
    ggaCard.className += " relative";
    latinCard.className += " relative";

    ggaContent = ggaCard.querySelector('div[data-slot="card-content"]');
    latinContent = latinCard.querySelector('div[data-slot="card-content"]');

    createLogo((svg) =>
      latinContent.insertBefore(svg, latinContent.firstChild),
    );

    createLogo((svg) => ggaContent.insertBefore(svg, ggaContent.firstChild));
  } catch (err) {
    console.log(err);
  }

  const latestYear = info.yearlyData[info.yearlyData.length - 1];
  if (!latestYear) return;

  const ggaCardInfo = ggaCard.lastChild.querySelector("div > div > div > div");
  const ggaCardIcon = ggaCard.querySelector("svg");

  const latinCardInfo = latinCard.lastChild.querySelector(
    "div > div > div > div",
  );
  const latinCardIcon = latinCard.querySelector("svg");

  ggaCardIcon.parentNode.replaceChild(createGgaCardIconSvg(), ggaCardIcon);
  latinCardIcon.parentNode.replaceChild(
    createLatinCardIconSvg(),
    latinCardIcon,
  );

  const latestGwa = avg(
    latestYear.semesters.map((semester) => semester.gwa),
  ).toFixed(2);

  ggaCard.className += " bg-primary text-white";
  latinCard.className += " bg-primary text-white";

  ggaCardInfo.children[0].textContent = "Gold Gear Award";
  ggaCardInfo.children[0].className += " text-white";
  ggaCardInfo.children[2].className += " text-white";

  ggaCardInfo.children[1].textContent = latestGwa;
  if (latestYear.semesters.length > 1) {
    ggaCardInfo.children[0].textContent =
      ggaCardInfo.children[0].textContent + " | Yearly GWA";
    ggaCardInfo.children[2].textContent = latestYear.lister
      ? `Running for ${latestYear.lister}`
      : "Not eligible for an award";
  } else {
    ggaCardInfo.children[0].textContent =
      ggaCardInfo.children[0].textContent + " | Semestral GWA";
    ggaCardInfo.children[2].textContent = "No awards happening yet";
  }

  const runningGwa = avg(getRunningGrades(info));

  latinCardInfo.children[0].textContent = "Latin Honors | Total GWA";
  latinCardInfo.children[1].textContent = runningGwa.toFixed(2);

  latinCardInfo.children[0].className += " text-white";
  latinCardInfo.children[2].className += " text-white";

  latinCardInfo.children[2].textContent =
    info.latin === null
      ? "Not eligible for a Latin Honor"
      : `Running for ${info.latin}`;

  for (i = 1; i <= 2; i++) {
    cardsBlock.insertBefore(
      document.createElement("div"),
      cardsBlock.firstChild,
    );
  }

  cardsBlock.insertBefore(latinCard, cardsBlock.firstChild);
  cardsBlock.insertBefore(ggaCard, cardsBlock.firstChild);
}

function fixFirstCard(cardsBlock) {
  try {
    const card = cardsBlock.firstChild;

    card.className = card.className
      .replace("bg-primary", "")
      .replace("text-white", "");
    lastChild = card.querySelector("div > div > p:last-child");
    lastChild.textContent = "Subjects taken so far";
    img = card.querySelector("img");
    img.parentNode.removeChild(img);
  } catch (err) {
    console.log(err);
  }
}

function displaySemestralGWAToCardSummary(semesterBlock, gwa) {
  const summaryCard = semesterBlock.querySelector(
    'div[data-slot="card-content"]',
  );
  const metricsPanel = summaryCard.querySelector(
    "div:last-child > div:last-child > div:last-child",
  );

  const gwaMetric =
    metricsPanel.children[metricsPanel.children.length - 1].cloneNode(true);
  gwaMetric.className += ` col-span-2 ${gwaMetric.className.replace("border/70", "primary")}`;

  gwaMetric.querySelector("div").querySelector("p:first-child").textContent =
    "Computed GWA";
  gwaMetric.querySelector("div").querySelector("p:last-child").textContent =
    gwa.toFixed(2);
  gwaMetric.querySelector("div").querySelector("p:last-child").className +=
    " text-primary";

  metricsPanel.appendChild(gwaMetric);
}

function getSemesterBlockWeightedGrades(semesterBlock) {
  const table = semesterBlock.querySelector("table");
  const headers = Array.from(table.querySelectorAll("thead th"));
  const gradeColIdx =
    headers.findIndex((h) => h.textContent.trim() === "Grade") + 1;

  if (gradeColIdx === 0) {
    console.log(
      "Unable to find grade column. Returning a blank list of weighted grades...",
    );
    return [];
  }

  return Array.from(table.querySelectorAll("tbody tr"))
    .map((row) =>
      parseFloat(
        row
          .querySelector(`td:nth-child(${gradeColIdx})`)
          .textContent.trim()
          .split(" ")[0], // Grade cell may contain remarks like INC and such
      ),
    )
    .filter((g) => !Number.isNaN(g));
}

function getRunningGrades(info) {
  const allGrades = info.yearlyData.flatMap((yearData) =>
    yearData.semesters.flatMap((semester) => semester.weightedGrades),
  );

  return allGrades;
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timed out waiting for ${selector}`));
    }, timeout);
  });
}

function glance(cardsBlock, semestersBlock, semesterBlockSelector) {
  const isSemesterBlockLocked = (semesterBlock) =>
    semesterBlock.querySelector('div[aria-hidden="true"]') != null;

  const info = {
    latin: "Cum Laude",
    yearlyData: [],
  };

  const disqualifiedYearsForGGA = new Set();
  let semesterCount = 0;

  blocks = Array.from(
    semestersBlock.querySelectorAll(semesterBlockSelector),
  ).reverse();

  console.log("Retrived semesters' blocks");

  blocks.forEach((semesterBlock) => {
    if (isSemesterBlockLocked(semesterBlock)) {
      console.log("Semester grades are locked. Skipping...");
      return;
    }

    console.log(`Processing semester ${semesterCount + 1}!`);

    if (semesterCount % 2 === 0) {
      // Means that it has been a full year

      const runningGwa = avg(getRunningGrades(info));

      info.latin =
        runningGwa <= LATIN_HONOR_SUMMA_CUM_LAUDE_GWA_MINIMUM
          ? "Summa Cum Laude"
          : runningGwa <= LATIN_HONOR_MAGNA_CUM_LAUDE_GWA_MINIMUM
            ? "Magna Cum Laude"
            : "Cum Laude";

      info.yearlyData.push({ lister: null, semesters: [] });
    }

    weightedGrades = getSemesterBlockWeightedGrades(semesterBlock);

    if (!weightedGrades.length) {
      console.log("No grades were retrieved. Skipping...");
      return;
    }

    console.log("Retrieved computed weighted grades!");

    const gwa = avg(weightedGrades);

    const yearIdx = info.yearlyData.length - 1;
    const yearData = info.yearlyData[yearIdx];

    weightedGrades.forEach((weightedGrade) => {
      if (weightedGrade > LATIN_HONOR_GRADE_MINIMUM) info.latin = null;
      if (weightedGrade > GGA_GRADE_MINIMUM)
        disqualifiedYearsForGGA.add(yearIdx);
    });

    yearData.semesters.push({ weightedGrades, gwa });

    console.log(`Registered semester!`);

    const yearGwa = +avg(
      yearData.semesters.map((semester) => semester.gwa),
    ).toFixed(2);

    yearData.lister =
      !disqualifiedYearsForGGA.has(yearIdx) &&
      isGGAEligible(yearData, info.yearlyData.length)
        ? yearGwa <= PRESIDENT_LISTER_GWA_MINIMUM
          ? "President's Lister"
          : "Dean's Lister"
        : null;

    console.log(`Updated semester details for lister!`);

    semesterCount++;
    displaySemestralGWAToCardSummary(semesterBlock, gwa);
  });

  fixFirstCard(cardsBlock);
  displayCards(cardsBlock, info);
}

browser.runtime.onMessage.addListener(async (data) => {
  const { cardsBlockSelector, semesterBlockSelector, semestersBlockSelector } =
    data;

  const semestersBlock = await waitForElement(semestersBlockSelector);
  const cardsBlock = await waitForElement(cardsBlockSelector);

  if (cardsBlock.dataset.glanceGwa === "loaded") {
    console.log("Extension effect already present!");
    return;
  }

  cardsBlock.dataset.glanceGwa = "loaded";

  console.log("All checks passed!");

  glance(cardsBlock, semestersBlock, semesterBlockSelector);
});
