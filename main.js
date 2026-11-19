const PRESIDENT_LISTER_GWA_MINIMUM = 1.21;
const DEAN_LISTER_GWA_MINIMUM = 1.75;
const GGA_GRADE_MINIMUM = 2.0;

const CUM_LAUDE_GWA_MINIMUM = 1.75;
const MAGNA_CUM_LAUDE_GWA_MINIMUM = 1.45;
const SUMMA_CUM_LAUDE_GWA_MINIMUM = 1.2;
const LATIN_HONOR_GRADE_MINIMUM = 2.5;

const EXCLUDED_COURSES = ["NSTP"];

browser.runtime.onMessage.addListener(async () => {
  await main();
});

async function main() {
  const isSemesterBlockLocked = (block) =>
    block.querySelector('div[aria-hidden="true"]') != null;

  const parentSelector = "#app main > div";
  const cardsBlockSelector = `${parentSelector} header ~ div > div:first-child`;
  const semesterBlockSelector = 'section[aria-label$="Semester"]';
  const semestersBlockSelector = `${parentSelector} div > div:has(> ${semesterBlockSelector})`;
  const gradesBlockSelector = `${parentSelector} header ~ div > div:last-child`;
  const alertCardSelector = `${cardsBlockSelector} ~ div[role="alert"]`;

  const semestersBlock = await waitForElement(semestersBlockSelector);
  const cardsBlock = await waitForElement(cardsBlockSelector);
  const gradesBlock = await waitForElement(gradesBlockSelector);
  const alertCard = await waitForElement(alertCardSelector);

  if (cardsBlock.dataset.glanceGwa === "loaded") {
    console.log("Extension effect already present!");
    return;
  }

  cardsBlock.dataset.glanceGwa = "loaded";

  const user = {
    latinAward: { award: null, error: null },
    latinGwa: 0,
    data: [],
  };

  const semesterBlocks = Array.from(
    semestersBlock.querySelectorAll(semesterBlockSelector),
  ).reverse();

  let semesterCount = 1;

  semesterBlocks.forEach((block) => {
    console.log(`Looping over Semester ${semesterCount}`);

    if (isSemesterBlockLocked(block)) {
      console.warn(`Semester ${semesterCount} is locked. Skipping...`);
      return;
    }

    const courseData = getCourseData(block);

    if (!courseData.length) {
      console.warn(
        `Semester ${semesterCount} course data not found. Skipping...`,
      );
      return;
    }

    const semesterData = createSemester(courseData, EXCLUDED_COURSES);

    let yearData = null;

    if (semesterCount % 2 === 0) {
      // When semester is the final semester (year has passed), update the last year data to include this semester to the computation.

      try {
        const lastYearData = user.data[user.data.length - 1];

        user.data[user.data.length - 1] = createYear(
          user.data.length,
          [lastYearData.data[0], semesterData],
          EXCLUDED_COURSES,
        );
      } catch (e) {
        console.error(e);
        return;
      }
    } else {
      yearData = createYear(user.data.length, [semesterData], EXCLUDED_COURSES);
      user.data.push(yearData);

      const filteredDataList = filterExcludedCourses(
        user.data.flatMap((year) =>
          year.data.flatMap((semester) => semester.data),
        ),
        EXCLUDED_COURSES,
      );

      user.latinAward = latinAward(user.data.length, filteredDataList);
      user.latinGwa = computeLatinAverage(
        filteredDataList,
        filteredDataList.map((course) => course.units),
      );
    }

    semesterCount++;
    showSemesterDataCard(block, semesterData);
  });

  const firstHeader = cardsBlock.firstChild.cloneNode(true);

  removeSubjectCardStyle(cardsBlock.firstChild);
  createHeaderSpace(cardsBlock, 2);

  const latestYearData = user.data[user.data.length - 1];

  createHeaderCard(
    cardsBlock,
    "Gold Gear Award | Yearly GWA",
    gwaFormat(latestYearData.honorGwa),
    latestYearData.ggaAward.error != null
      ? "Not eligible for award"
      : `Running for ${latestYearData.ggaAward.award}`,
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvZyBwcmV2aWV3LWljb24iPjxwYXRoIGQ9Ik0xMSAxMC4yNyA3IDMuMzQiLz48cGF0aCBkPSJtMTEgMTMuNzMtNCA2LjkzIi8+PHBhdGggZD0iTTEyIDIydi0yIi8+PHBhdGggZD0iTTEyIDJ2MiIvPjxwYXRoIGQ9Ik0xNCAxMmg4Ii8+PHBhdGggZD0ibTE3IDIwLjY2LTEtMS43MyIvPjxwYXRoIGQ9Im0xNyAzLjM0LTEgMS43MyIvPjxwYXRoIGQ9Ik0yIDEyaDIiLz48cGF0aCBkPSJtMjAuNjYgMTctMS43My0xIi8+PHBhdGggZD0ibTIwLjY2IDctMS43MyAxIi8+PHBhdGggZD0ibTMuMzQgMTcgMS43My0xIi8+PHBhdGggZD0ibTMuMzQgNyAxLjczIDEiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjwvc3ZnPg==",
    firstHeader,
  );
  createHeaderCard(
    cardsBlock,
    "Latin Honor | Overall GWA",
    gwaFormat(user.latinGwa),
    user.latinAward.error != null
      ? "Not eligible for award"
      : `Running for ${user.latinAward.award}`,
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1lZGFsIHByZXZpZXctaWNvbiI+PHBhdGggZD0iTTcuMjEgMTUgMi42NiA3LjE0YTIgMiAwIDAgMSAuMTMtMi4yTDQuNCAyLjhBMiAyIDAgMCAxIDYgMmgxMmEyIDIgMCAwIDEgMS42LjhsMS42IDIuMTRhMiAyIDAgMCAxIC4xNCAyLjJMMTYuNzkgMTUiLz48cGF0aCBkPSJNMTEgMTIgNS4xMiAyLjIiLz48cGF0aCBkPSJtMTMgMTIgNS44OC05LjgiLz48cGF0aCBkPSJNOCA3aDgiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE3IiByPSI1Ii8+PHBhdGggZD0iTTEyIDE4di0yaC0uNSIvPjwvc3ZnPg==",
    firstHeader,
  );
  try {
    console.log(user.latinAward, user.data[user.data.length - 1].ggaAward);
    createAwardGuideCard(
      gradesBlock,
      alertCard.cloneNode(true),
      user.latinAward,
      user.data[user.data.length - 1].ggaAward,
    );
  } catch (e) {
    console.error(e);
  }
}

const ggaAward = (gwa, yearCount, dataList) => {
  const result = {
    award: null,
    error: null,
  };

  if (!dataList.every((course) => course.grade <= GGA_GRADE_MINIMUM)) {
    result.error = "grade";
  }
  if (yearCount < 2) {
    result.error += " year";
  }
  if (gwa > DEAN_LISTER_GWA_MINIMUM) {
    result.error += " gwa";
  } else if (result.error == null && gwa > PRESIDENT_LISTER_GWA_MINIMUM) {
    result.award = "Dean's Lister";
  } else if (result.error == null && gwa <= PRESIDENT_LISTER_GWA_MINIMUM) {
    result.award = "President's Lister";
  }

  return result;
};

const latinAward = (yearCount, dataList) => {
  const result = {
    award: null,
    error: null,
  };

  const gwa = computeLatinAverage(
    dataList,
    dataList.map((course) => course.units),
  );

  if (!dataList.every((course) => course.grade <= LATIN_HONOR_GRADE_MINIMUM)) {
    result.error = "grade";
  }
  if (yearCount < 2) {
    result.error += " year";
  } else if (gwa > CUM_LAUDE_GWA_MINIMUM) {
    result.error += " gwa";
  } else if (result.error == null && gwa > MAGNA_CUM_LAUDE_GWA_MINIMUM) {
    result.award = "Cum Laude";
  } else if (result.error == null && gwa > SUMMA_CUM_LAUDE_GWA_MINIMUM) {
    result.award = "Magna Cum Laude";
  } else if (result.error == null && gwa <= SUMMA_CUM_LAUDE_GWA_MINIMUM) {
    result.award = "Summa Cum Laude";
  }

  return result;
};

const gwaFormat = (number) => {
  const numSplit = String(number).split(".");
  return parseFloat(
    parseFloat(`${numSplit[0]}.${numSplit[1].substring(0, 3)}`).toFixed(2),
  );
};

const computeAverage = (dataList) =>
  Math.sumPrecise(dataList.map((course) => course.grade)) / dataList.length;

const computeLatinAverage = (dataList, unitsList) =>
  computeGradePoints(dataList) / Math.sumPrecise(unitsList);

const computeGradePoints = (dataList) =>
  Math.sumPrecise(dataList.map((course) => course.units * course.grade));

const filterExcludedCourses = (dataList, excludedCourses = []) => {
  return dataList.filter((course) => !excludedCourses.includes(course.subject));
  // Only exclude the grade from computation but include the unit:
  // dataList.map((course) => {subject: course.subject, units: course.units, grade: 0.0})
};

function createSemester(dataList, excludedCourses = []) {
  let filteredDataList = [];
  if (excludedCourses.length) {
    filteredDataList = filterExcludedCourses(dataList, excludedCourses);
  }

  const rawGwa = computeAverage(dataList);
  const rawGp = computeGradePoints(dataList);

  return {
    data: dataList,
    rawGwa,
    awardGwa: filteredDataList.length
      ? computeAverage(filteredDataList)
      : rawGwa,
    rawGp,
    awardGp: filteredDataList.length
      ? computeGradePoints(filteredDataList)
      : rawGp,
  };
}

function createYear(yearCount, dataList, excludedCourses = []) {
  const flatCourseData = dataList.flatMap((year) => year.data);
  const honorGwa = computeAverage(
    filterExcludedCourses(flatCourseData, excludedCourses),
  );

  return {
    data: dataList,
    rawGwa: computeAverage(flatCourseData),
    honorGwa,
    ggaAward: ggaAward(honorGwa, yearCount, flatCourseData),
  };
}

async function waitForElement(selector, timeout = 10000) {
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

function getCourseData(block) {
  const table = block.querySelector("table");

  const headers = Array.from(table.querySelectorAll("thead th"));

  const subjectColIdx =
    headers.findIndex((h) => h.textContent.trim() === "Subject") + 1;
  const gradeColIdx =
    headers.findIndex((h) => h.textContent.trim() === "Grade") + 1;
  const unitColIdx = gradeColIdx - 1;

  if (gradeColIdx === -1 || subjectColIdx === -1) {
    console.log("Unable to find necessary columns. Returning blank data...");
    return [{}];
  }

  return Array.from(table.querySelectorAll("tbody tr"))
    .map((row) => {
      return {
        subject: row
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
    .filter((data) => {
      const res = !Number.isNaN(data.grade);

      if (!res) {
        console.warn(
          `Found an invalid grade data! Course Name: ${data.subject} Units: ${data.units} Grade: ${data.grade}`,
        );
      }
      return res;
    });
}

function showSemesterDataCard(block, semesterData) {
  try {
    let { rawGwa, rawGp, awardGwa, awardGp } = semesterData;

    rawGwa = gwaFormat(rawGwa);
    rawGp = gwaFormat(rawGp);
    awardGwa = gwaFormat(awardGwa);
    awardGp = gwaFormat(awardGp);

    const summaryCard = block.querySelector(
      'div[data-slot="card"]:first-child',
    );

    const metricsCard = summaryCard.cloneNode(true);

    const metricsContent = metricsCard.querySelector(
      'div[data-slot="card-content"]',
    );
    const metricsHeader = metricsContent.querySelector("div:first-child");
    const metricsBody = metricsContent.querySelector("div:last-child");

    metricsHeader.className += " bg-primary";

    metricsHeader.removeChild(metricsHeader.querySelector("span"));
    const metricsHeaderBody = metricsHeader.querySelector("div");
    metricsHeaderBody.removeChild(metricsHeaderBody.querySelector("p"));

    const metricsHeaderLabel = metricsHeaderBody.querySelector("h3");
    metricsHeaderLabel.textContent = "GWA & Grade Points Summary";

    metricsBody.removeChild(metricsBody.firstChild.nextSibling);
    metricsBody.removeChild(metricsBody.firstChild);

    const newSummaryCard = document.createElement("div");
    newSummaryCard.className = "flex flex-col gap-4";

    newSummaryCard.appendChild(summaryCard);
    newSummaryCard.appendChild(metricsCard);

    let idx = 0;
    [rawGwa, awardGwa, rawGp, awardGp].forEach((metric) => {
      const metricCard = metricsBody.firstChild.children[idx];

      metricCard
        .querySelector("div")
        .querySelector("p:first-child").textContent =
        `${(idx % 2 == 0 ? "Raw " : "Award ") + (idx < 2 ? "GWA" : "GP")}`;
      metricCard
        .querySelector("div")
        .querySelector("p:last-child").textContent = metric;
      idx++;
    });

    block.firstChild.insertBefore(newSummaryCard, block.firstChild.firstChild);
  } catch (e) {
    console.error(e);
    return;
  }
}

function createHeaderCard(
  block,
  title,
  body,
  footer,
  iconUrl = "",
  clone = null,
) {
  const card = (clone ? clone : block.firstChild).cloneNode(true);

  const cardContent = card.querySelector('div[data-slot="card-content"]');
  const cardContentInfo = card.lastChild.querySelector("div > div > div > div");
  const cardContentIcon = cardContent.querySelector("svg");

  cardContentInfo.children[0].textContent = title;
  cardContentInfo.children[1].textContent = body;
  cardContentInfo.children[2].textContent = footer;

  createIcon(
    new URL(iconUrl),
    "lucide lucide-award text-white mt-1 size-6 shrink-0",
    (icon) => {
      cardContentIcon.parentNode.replaceChild(icon, cardContentIcon);
    },
  );

  block.insertBefore(card, block.firstChild);
}

function createHeaderSpace(block, space = 1) {
  for (let i = 0; i < space; i++) {
    block.insertBefore(document.createElement("div"), block.firstChild);
  }
}

function createAwardGuideCard(block, alertCard, latinAward, ggaAward) {
  const ineligibleAwardAlertCard = (alertCard, title, error) => {
    const awardCard = alertCard.cloneNode(true);
    const awardCardIcon = awardCard.querySelector("span");
    const awardCardBody = awardCard.querySelector("div");
    const awardCardTitle = awardCardBody.querySelector(
      'div[data-slot="alert-title"]',
    );
    const awardCardContent = awardCardBody.querySelector(
      'div[data-slot="alert-description"]',
    );

    awardCard.className = awardCard.className.replaceAll("amber", "red");

    createIcon(
      new URL(
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJhbiBwcmV2aWV3LWljb24iPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0iTTQuOTI5IDQuOTI5IDE5LjA3IDE5LjA3MSIvPjwvc3ZnPg==",
      ),
      "lucide lucide-ban",
      (icon) => {
        awardCardIcon.replaceChild(icon, awardCardIcon.firstChild);
      },
    );

    awardCardTitle.textContent = title;
    awardCardContent.textContent =
      error
        .split(" ")
        .slice(1)
        .map((e) =>
          e === "grade"
            ? "You have course grade(s) lower than the minimum grade"
            : e === "year"
              ? "You haven't been a student for long enough"
              : e === "gwa"
                ? "Your GWA does not meet the minimum GWA"
                : "You have unmet requirements",
        )
        .join(". ") + ".";

    return awardCard;
  };

  block.className = "grid gap-4 lg:grid-cols-2";

  block.firstChild.className = block.firstChild.className.replace(
    "max-w-xl",
    "",
  );

  const card = block.firstChild.cloneNode(true);
  const cardHeader = card.firstChild;
  const cardContent = card.lastChild;
  cardContent.className +=
    " flex flex-col gap-(--card-spacing) py-(--card-spacing)";

  card.firstChild.className = card.firstChild.className.replace("max-w-xl", "");

  cardHeader.firstChild.textContent = "Gold Gear Awards and Latin Honor Guide";
  cardHeader.lastChild.textContent =
    "Grade computation conditions for award qualifications.";

  alertCard.className = alertCard.className
    .replace("text-foreground", "text-amber-950")
    .replace("text-muted-foreground", "text-amber-900")
    .replace("border-border", "border-amber-300")
    .replace("bg-muted/40", "bg-amber-50");

  const alertCardIcon = alertCard.querySelector("span");
  const alertCardBody = alertCard.querySelector("div");
  const alertCardTitle = alertCardBody.querySelector(
    'div[data-slot="alert-title"]',
  );
  const alertCardContent = alertCardBody.querySelector(
    'div[data-slot="alert-description"]',
  );

  createIcon(
    new URL(
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1leGNsYW1hdGlvbi1wb2ludCBwcmV2aWV3LWljb24iPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGxpbmUgeDE9IjEyIiB4Mj0iMTIiIHkxPSI4IiB5Mj0iMTIiLz48bGluZSB4MT0iMTIiIHgyPSIxMi4wMSIgeTE9IjE2IiB5Mj0iMTYiLz48L3N2Zz4=",
    ),
    "lucide lucide-circle-exclamation-point",
    (icon) => {
      alertCardIcon.replaceChild(icon, alertCardIcon.firstChild);
    },
  );

  alertCardTitle.textContent = "Guide Computations";
  alertCardContent.textContent =
    "Information below may only serve as guide and should not be taken as factual over the actual calculations performed by the Registrar.";

  const computationSection = document.createElement("p");
  computationSection.textContent =
    "To compute your Grade Points, get the product of a course's Units and Grade. To compute the final GWA (per semester, yearly, or overall), sum up every Grade Points divided by the total number of Units. Use your GWA with up to 3 decimal places and round off at the 3rd decimal place.";

  const latinHonorSection = document.createElement("p");
  latinHonorSection.textContent =
    "Latin Honors are awarded based on your cumulative GWA. To qualify for the award, you must be a student for at least 2 years in the University. You also must be enrolled in at least 15 units prescribed in the curriculum. This may be excused if the required unit of the curriculum is less than 15 units or the courses need to meet 15 units are not offered. Cum Laude requires a GWA within 1.46 - 1.75 with no grade lower than 2.50. Magna Cum Laude requires a GWA within 1.21 - 1.45 with no grade lower than 2.25. Summa Cum Laude requires a GWA within 1.00 - 1.20 with no grade lower than 2.0.";

  const listerSection = document.createElement("p");
  listerSection.textContent =
    "Gold Gear Awards are a yearly recognition, making you either a President's Lister or a Dean's Lister when requirements are met. You are awarded based on your two preceding semester's GWAs. To qualify for the award, you must be a 2nd year student. To qualify for the Gold Gear Awards, your GWA must be within 1.00 - 1.75 with no grade lower than 2.0. Dean's Lister requires a GWA within 1.22 - 1.75. President's Lister requires a GWA within 1.00 - 1.21.";

  cardContent.insertBefore(alertCard, cardContent.firstChild);
  cardContent.removeChild(cardContent.lastChild);

  cardContent.appendChild(computationSection);
  cardContent.appendChild(latinHonorSection);
  cardContent.appendChild(listerSection);

  block.insertBefore(card, block.firstChild);

  let idx = 0;
  [ggaAward.error, latinAward.error].forEach((e) => {
    if (e == null) return;

    cardContent.insertBefore(
      ineligibleAwardAlertCard(
        alertCard,
        `You are not eligible for ${
          idx < 1 ? "Gold Gear Awards..." : "a Latin Honor..."
        }`,
        e,
      ),
      cardContent.firstChild,
    );
    idx++;
  });
}

function removeSubjectCardStyle(card) {
  card.className = card.className
    .replace("bg-primary", "")
    .replace("text-white", "");
  const lastChild = card.querySelector("div > div > p:last-child");
  lastChild.textContent = "Total subjects taken";
  const img = card.querySelector("img");
  img.parentNode.removeChild(img);
}

async function createIcon(urlResource, className, insertFunc) {
  const res = await fetch(urlResource.href);
  const content = await res.text();

  const icon = new DOMParser().parseFromString(
    content,
    "image/svg+xml",
  ).documentElement;
  icon.setAttribute("class", className);

  insertFunc(icon);
}
