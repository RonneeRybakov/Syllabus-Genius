document.addEventListener("DOMContentLoaded", () => {
  const calendarElement = document.getElementById("calendar");
  const monthYearElement = document.getElementById("monthYear");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const viewSelector = document.getElementById("viewSelector");

  let currentDate = new Date();

  function renderCalendar(date) {
    calendarElement.innerHTML = "";
    const month = date.getMonth();
    const year = date.getFullYear();
    const today = new Date();

    // Set the month and year in the header
    monthYearElement.textContent = `${date.toLocaleString("default", {
      month: "long",
    })} ${year}`;

    // Get the first and last days of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Add day headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    dayNames.forEach((dayName) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "calendar-day";
      dayHeader.textContent = dayName;
      calendarElement.appendChild(dayHeader);
    });

    // Fill in the days
    let day = 1;
    for (let i = 0; i < 6; i++) {
      let isRowEmpty = true; // Track if the row is empty

      const rowFragment = document.createDocumentFragment(); // Create a fragment to append cells

      for (let j = 0; j < 7; j++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";

        if (
          (i === 0 && j < firstDayOfMonth.getDay()) ||
          day > lastDayOfMonth.getDate()
        ) {
          dayCell.className += " empty";
        } else {
          dayCell.setAttribute("data-date", day);
          isRowEmpty = false;

          if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
          ) {
            dayCell.classList.add("current-day");
          }

          if (j === 0) {
            dayCell.classList.add("sunday");
          } else if (j === 6) {
            dayCell.classList.add("saturday");
          }

          day++;
        }

        rowFragment.appendChild(dayCell);
      }

      // Only append the row if it's not empty
      if (!isRowEmpty) {
        calendarElement.appendChild(rowFragment);
      }
    }
  }

  function handleNavigation(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar(currentDate);
  }

  prevButton.addEventListener("click", () => handleNavigation(-1));
  nextButton.addEventListener("click", () => handleNavigation(1));

  viewSelector.addEventListener("change", () => {
    if (viewSelector.value === "monthly") {
      document.getElementById("calendar").style.gridTemplateColumns =
        "repeat(7, 1fr)";
      renderCalendar(currentDate);
    } else {
      // Handle weekly view (to be implemented)
    }
  });

  // Initial render
  renderCalendar(currentDate);
});
