document.addEventListener("DOMContentLoaded", () => {
  // Get references to the calendar elements
  const calendarElement = document.getElementById("calendar");
  const monthYearElement = document.getElementById("monthYear");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const viewSelector = document.getElementById("viewSelector");

  // Initialize the current date
  let currentDate = new Date();

  // Function to format time in 12-hour format with AM/PM
  function formatTime(hour) {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${formattedHour}${period}`;
  }

  // Function to render the calendar based on the view (monthly or weekly)
  function renderCalendar(date, view = "monthly") {
    calendarElement.innerHTML = "";
    const month = date.getMonth();
    const year = date.getFullYear();
    const today = currentDate;

    if (view === "monthly") {
      // Display the month and year at the top
      monthYearElement.textContent = `${date.toLocaleString("default", {
        month: "long",
      })} ${year}`;

      // Get the first and last day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Create headers for the days of the week
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      dayNames.forEach((dayName) => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day";
        dayHeader.textContent = dayName;
        calendarElement.appendChild(dayHeader);
      });

      // Fill in the days of the month
      let day = 1;
      for (let i = 0; i < 6; i++) {
        //Up to 6 rows (weeks) in a month
        let isRowEmpty = true; // Track if the row is empty
        const rowFragment = document.createDocumentFragment(); // Create fragment to append cells

        for (let j = 0; j < 7; j++) {
          //7 columns (days) per row
          const dayCell = document.createElement("div");
          dayCell.className = "calendar-day";

          if (
            (i === 0 && j < firstDayOfMonth.getDay()) || // Empty cells before the 1st of the month
            day > lastDayOfMonth.getDate() // Empty cells after the last day of the month
          ) {
            dayCell.className += " empty"; //Add "empty" class to these cells
          } else {
            dayCell.setAttribute("data-date", day); //Set the date as a data attribute
            isRowEmpty = false; //Row has a valid day so its not empty

            //Highlight the current day
            if (
              year === today.getFullYear() &&
              month === today.getMonth() &&
              day === today.getDate()
            ) {
              dayCell.classList.add("current-day");
            }

            //Add specific classes for Sun and Sat
            if (j === 0) {
              dayCell.classList.add("sunday");
            } else if (j === 6) {
              dayCell.classList.add("saturday");
            }

            day++;
          }

          rowFragment.appendChild(dayCell); //Add the cell to the fragment
        }

        // Only append the row if it's not empty
        if (!isRowEmpty) {
          calendarElement.appendChild(rowFragment);
        }
      }
    } else if (view === "weekly") {
      //Set the week range in the header for weekly view
      monthYearElement.textContent = `Week of ${date.toLocaleDateString(
        "default",
        { month: "long", day: "numeric", year: "numeric" }
      )}`;

      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay()); // Sets it to Sunday

      // Create the time header
      const timeHeader = document.createElement("div");
      timeHeader.className = "calendar-time-header";
      calendarElement.appendChild(timeHeader);

      // Create headers for the days of the week with dates (Sun 1, Mon 2...)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      dayNames.forEach((dayName, index) => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day calendar-day-header";
        dayHeader.textContent = `${dayName} ${new Date(startOfWeek).getDate()}`;
        if (
          new Date().toDateString() === new Date(startOfWeek).toDateString()
        ) {
          dayHeader.classList.add("current-day"); // Highlight current day in weekly view
        }
        startOfWeek.setDate(startOfWeek.getDate() + 1); //Move to the next day
        calendarElement.appendChild(dayHeader);
      });

      //Hourly time slots
      for (let hour = 0; hour < 24; hour++) {
        const rowFragment = document.createDocumentFragment();

        // Create a time slot header
        const timeSlot = document.createElement("div");
        timeSlot.className = "time-slot";
        timeSlot.textContent = formatTime(hour);
        rowFragment.appendChild(timeSlot);

        // Create cells for each day of the week
        for (let j = 0; j < 7; j++) {
          const dayCell = document.createElement("div");
          dayCell.className = "calendar-day";
          rowFragment.appendChild(dayCell);
        }

        calendarElement.appendChild(rowFragment);
      }

      // Manually opens the weekly view to 8 AM cell
      setTimeout(() => {
        const eightAMCellIndex = 6; // idk how it worked but 6 makes the calendar open at 8am
        const timeSlots = document.querySelectorAll(".time-slot");
        if (timeSlots.length > eightAMCellIndex) {
          const eightAMCell = timeSlots[eightAMCellIndex];
          calendarElement.scrollTop =
            eightAMCell.offsetTop -
            calendarElement.offsetHeight / 2 +
            eightAMCell.offsetHeight / 2;
        }
      }, 10); // Adjust delay if needed
    }
  }

  //Function to handle navigation between months or weeks
  function handleNavigation(step) {
    if (viewSelector.value === "monthly") {
      //Adjust month by step (-1 or +1) for monthly view
      currentDate.setMonth(currentDate.getMonth() + step);
    } else {
      //Adjust the date by 7 days (1 week) for weekly view
      currentDate.setDate(currentDate.getDate() + step * 7);
    }
    renderCalendar(currentDate, viewSelector.value); //Re-render the calendar
  }

  //Event listeners for prev and next buttons
  prevButton.addEventListener("click", () => handleNavigation(-1));
  nextButton.addEventListener("click", () => handleNavigation(1));

  //Event listeners for changing between monthly and weekly views
  viewSelector.addEventListener("change", () => {
    if (viewSelector.value === "monthly") {
      //Set up calendar grid for monthly view
      document.getElementById("calendar").style.gridTemplateColumns =
        "repeat(7, 1fr)";
      renderCalendar(currentDate, "monthly"); //Render monthly view
    } else {
      //Set up calendar grid for weekly view

      document.getElementById("calendar").style.gridTemplateColumns =
        "auto repeat(7, 1fr)";
      renderCalendar(currentDate, "weekly"); //Render weekly view
    }
  });

  // Initial render of the calendar with selected view (default is monthly)
  renderCalendar(currentDate, viewSelector.value);
});
