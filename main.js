const PRESIDENT_LISTER_GWA_MINIMUM = 1.21;
const DEAN_LISTER_GWA_MINIMUM = 1.75;
const LATIN_HONOR_CUM_LAUDE_GWA_MINIMUM = 1.75;
const LATIN_HONOR_MAGNA_CUM_LAUDE_GWA_MINIMUM = 1.45;
const LATIN_HONOR_SUMMA_CUM_LAUDE_GWA_MINIMUM = 1.2;
const GGA_GRADE_MINIMUM = 2.0;
const LATIN_HONOR_GRADE_MINIMUM = 2.5;

const EXCLUDED_COURSES = ["NSTP"];

const sum = (arr) =>
  typeof Math.sumPrecise === "function"
    ? Math.sumPrecise(arr)
    : arr.reduce((a, b) => a + b, 0);
const avg = (arr) => sum(arr) / arr.length;
const gwa = (arr) => {
  let raw = avg(arr);
  let rawSplit = String(raw).split(".");
  raw = parseFloat(`${rawSplit[0]}.${rawSplit[1].substring(0, 3)}`);

  return raw.toFixed(2); // Cuts off at the 3rd fp and then rounds off to 2 fp
};

const isPresidentLister = (gwa) => {
  return gwa <= PRESIDENT_LISTER_GWA_MINIMUM;
};

const isGGA = (currentYear) => {
  return currentYear.semesters.length === 2;
};

const isGGAEligible = (yearlyData) => {
  return yearlyData.length >= 2;
};

const isLatinHonorEligible = (yearlyData) =>
  yearlyData.length > 2 && // Second Year
  all(yearlyData, "grade").every((grade) => grade <= LATIN_HONOR_GRADE_MINIMUM); // Every grade is above 2.5 (automatically checks if passed)

const all = (yearlyData, key) =>
  yearlyData.flatMap((yearData) =>
    yearData.semesters.flatMap((semester) =>
      semester.data.flatMap((data) => data[key]),
    ),
  );

const allGrades = (yearlyData) => all(yearlyData, "grade");
const allUnits = (yearlyData) => all(yearlyData, "units");
const allGradePoints = (yearlyData) =>
  yearlyData.flatMap((yearData) =>
    yearData.semesters.flatMap((semester) =>
      semester.data.flatMap((data) => data.units * data.grade),
    ),
  );

const totalUnits = (yearlyData) => sum(allUnits(yearlyData));
const totalGradePoints = (yearlyData) => {
  let raw = sum(allGradePoints(yearlyData)) / totalUnits(yearlyData);
  let rawSplit = String(raw).split(".");
  raw = parseFloat(`${rawSplit[0]}.${rawSplit[1].substring(0, 3)}`);

  return raw.toFixed(2); // Cuts off at the 3rd fp and then rounds off to 2 fp
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
    const res = await fetch(url);
    const content = await res.text();

    const img = new DOMParser().parseFromString(
      content,
      "image/svg+xml",
    ).documentElement;
    img.setAttribute("class", "size-30 absolute -right-8 -bottom-8 opacity-50");
    // img.querySelector("rect").setAttribute("class", "size-30");

    insert(img);
  }

  try {
    const ggaCard = cardsBlock.lastChild.cloneNode(true);
    const latinCard = cardsBlock.lastChild.cloneNode(true);

    ggaCard.className += " relative";
    latinCard.className += " relative";

    const ggaContent = ggaCard.querySelector('div[data-slot="card-content"]');
    const latinContent = latinCard.querySelector(
      'div[data-slot="card-content"]',
    );

    createLogo((svg) =>
      latinContent.insertBefore(svg, latinContent.firstChild),
    );
    createLogo((svg) => ggaContent.insertBefore(svg, ggaContent.firstChild));

    const ggaCardInfo = ggaCard.lastChild.querySelector(
      "div > div > div > div",
    );
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

    ggaCard.className += " bg-primary text-white";
    latinCard.className += " bg-primary text-white";

    ggaCardInfo.children[0].textContent = "Gold Gear Award";
    ggaCardInfo.children[0].className += " text-white";
    ggaCardInfo.children[2].className += " text-white";

    const yearIndex = info.yearlyData.length - 1;
    const yearData = info.yearlyData[yearIndex];

    ggaCardInfo.children[1].textContent = gwa(allGrades([yearData]));
    if (isGGA(yearData)) {
      ggaCardInfo.children[0].textContent =
        ggaCardInfo.children[0].textContent + " | Yearly GWA";
      ggaCardInfo.children[2].textContent = yearData.award
        ? `Running for ${yearData.award}`
        : "Not eligible for an award";
    } else {
      ggaCardInfo.children[0].textContent =
        ggaCardInfo.children[0].textContent + " | Semestral GWA";
      ggaCardInfo.children[2].textContent = "No Gold Gear Awards yet";
    }

    latinCardInfo.children[0].textContent = "Latin Honors | Total GWA";
    latinCardInfo.children[1].textContent = totalGradePoints(info.yearlyData);

    latinCardInfo.children[0].className += " text-white";
    latinCardInfo.children[2].className += " text-white";

    latinCardInfo.children[2].textContent = info.honor
      ? `Running for ${info.honor}`
      : "Not eligible for a Latin Honor";

    // Spacer columns
    for (let i = 1; i <= 2; i++) {
      cardsBlock.insertBefore(
        document.createElement("div"),
        cardsBlock.firstChild,
      );
    }

    cardsBlock.insertBefore(ggaCard, cardsBlock.firstChild);
    cardsBlock.insertBefore(latinCard, cardsBlock.firstChild);
  } catch (e) {
    console.error(e);
  }
}

function fixFirstCard(cardsBlock) {
  const card = cardsBlock.firstChild;

  card.className = card.className
    .replace("bg-primary", "")
    .replace("text-white", "");
  const lastChild = card.querySelector("div > div > p:last-child");
  lastChild.textContent = "Subjects taken so far";
  const img = card.querySelector("img");
  img.parentNode.removeChild(img);
}

function displaySemestralGWA(semesterBlock, semester) {
  const { rawGwa, filteredGwa } = semester;
  const summaryCard = semesterBlock.querySelector(
    'div[data-slot="card-content"]',
  );
  const metricsPanel = summaryCard.querySelector(
    "div:last-child > div:last-child > div:last-child",
  );

  let idx = 0;
  [rawGwa, filteredGwa].forEach((metric) => {
    const metricCard =
      metricsPanel.children[metricsPanel.children.length - 1].cloneNode(true);
    metricCard.className += ` ${metricCard.className.replace("border/70", "primary")}`;

    metricCard.querySelector("div").querySelector("p:first-child").textContent =
      `${idx < 1 ? "Raw" : "Honor"} GWA`;
    metricCard.querySelector("div").querySelector("p:last-child").textContent =
      metric;
    metricCard.querySelector("div").querySelector("p:last-child").className +=
      " text-primary";

    metricsPanel.appendChild(metricCard);
    idx++;
  });
}

function getSemesterBlockData(semesterBlock) {
  const table = semesterBlock.querySelector("table");
  const headers = Array.from(table.querySelectorAll("thead th"));
  const subjectColIdx =
    headers.findIndex((h) => h.textContent.trim() === "Subject") + 1;
  const gradeColIdx =
    headers.findIndex((h) => h.textContent.trim() === "Grade") + 1;
  const unitColIdx = gradeColIdx - 1;

  if (gradeColIdx === -1 || subjectColIdx === -1 || unitColIdx === 1) {
    console.log("Unable to find necessary columns. Returning blank data...");
    return {};
  }

  return Array.from(table.querySelectorAll("tbody tr"))
    .map((row) => {
      return {
        sub: row
          .querySelector(`td:nth-child(${subjectColIdx}) > div > p:first-child`)
          .textContent.trim()
          .split(" ")[0],
        units: +row
          .querySelector(`td:nth-child(${unitColIdx})`)
          .textContent.trim(),
        grade: parseFloat(
          row
            .querySelector(`td:nth-child(${gradeColIdx})`)
            .textContent.trim()
            .split(" ")[0], // Grade cell may contain remarks like INC and such
        ),
      };
    })
    .filter((data) => !Number.isNaN(data.grade));
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

function glance(info, cardsBlock, semestersBlock, semesterBlockSelector) {
  const isSemesterBlockLocked = (semesterBlock) =>
    semesterBlock.querySelector('div[aria-hidden="true"]') != null;

  let semesterCount = 0;

  const blocks = Array.from(
    semestersBlock.querySelectorAll(semesterBlockSelector),
  ).toReversed();

  blocks.forEach((semesterBlock) => {
    console.log(`Scraping semester ${semesterCount + 1}`);

    if (isSemesterBlockLocked(semesterBlock)) {
      console.log("Semester grades are locked. Skipping...");
      return;
    }

    const dataSet = getSemesterBlockData(semesterBlock);

    if (!dataSet.length) {
      console.log("No data for semester were retrieved. Skipping...");
      return;
    }

    if (semesterCount % 2 == 0) {
      try {
        if (!isLatinHonorEligible(info.yearlyData)) {
          info.honor = null;
        } else {
          let runningGwa = parseFloat(totalGradePoints(info.yearlyData));
          info.honor =
            (runningGwa <= LATIN_HONOR_SUMMA_CUM_LAUDE_GWA_MINIMUM
              ? "Summa "
              : runningGwa <= LATIN_HONOR_MAGNA_CUM_LAUDE_GWA_MINIMUM
                ? "Magna "
                : "") + "Cum Laude";
        }
      } catch (e) {
        console.trace(e);
      }

      info.yearlyData.push({ award: null, semesters: [] });
    }

    const yearIndex = info.yearlyData.length - 1;
    const yearData = info.yearlyData[yearIndex];

    const semester = {
      data: dataSet,
      rawGwa: gwa(dataSet.map((data) => data.grade)),
      filteredGwa: gwa(
        dataSet.map((data) =>
          !EXCLUDED_COURSES.includes(data.sub) ? data.grade : 0,
        ),
      ),
    };

    yearData.semesters.push(semester);

    try {
      yearData.award = isGGAEligible(info)
        ? isPresidentLister(
            +gwa(allGrades([info.yearlyData[yearIndex - 1], yearData])),
          )
          ? "President's Lister"
          : "Dean's Lister"
        : null;
    } catch (e) {
      console.trace(e);
    }

    semesterCount++;
    displaySemestralGWA(semesterBlock, semester);
  });

  fixFirstCard(cardsBlock);

  try {
    displayCards(cardsBlock, info);
  } catch (e) {
    console.error(e);
  }
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

  glance(info, cardsBlock, semestersBlock, semesterBlockSelector);
});

const info = {
  honor: null,
  yearlyData: [],
};
