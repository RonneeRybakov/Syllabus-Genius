document.addEventListener("DOMContentLoaded", () => {
  // Get references to the calendar elements
  const calendarElement = document.getElementById("calendar");
  const monthYearElement = document.getElementById("monthYear");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const viewSelector = document.getElementById("viewSelector");

  // Initialize the current date
  let currentDate = new Date();
  const events = []; //array to store events

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

        // Create a time slot cell header which is the time basically
        const timeSlot = document.createElement("div");
        timeSlot.className = "time-slot";
        timeSlot.textContent = formatTime(hour);
        rowFragment.appendChild(timeSlot);

        // Create cells for each day of the week
        for (let j = 0; j < 7; j++) {
          const dayCell = document.createElement("div");
          dayCell.className = "calendar-day";

          //click event listener to each day cell for adding events
          dayCell.addEventListener("click", () => {
            openEventForm(date, j, hour);
          });

          rowFragment.appendChild(dayCell);
        }

        calendarElement.appendChild(rowFragment);
      }

      // Manually opens the weekly view to 8 AM cell
      setTimeout(() => {
        const eightAMCellIndex = 7; // index starts at 0
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

  let eventFormContainer = null; // Track the currently open event form

  function openEventForm(date, dayIndex, hour, eventToEdit = null) {
    // Close the existing form if it exists
    if (eventFormContainer) {
      document.body.removeChild(eventFormContainer);
      eventFormContainer = null;
    }

    // Create the form container
    eventFormContainer = document.createElement("div");
    eventFormContainer.className = "event-form-container";

    // Create the form
    const form = document.createElement("form");
    form.className = "event-form";

    // Create input for event title
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Event Title:";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.required = true;
    titleInput.value = eventToEdit ? eventToEdit.title : ""; // Prefill if editing
    form.appendChild(titleLabel);
    form.appendChild(titleInput);

    // Create input for start time
    const startTimeLabel = document.createElement("label");
    startTimeLabel.textContent = "Start Time:";
    const startHourInput = document.createElement("input");
    startHourInput.type = "number";
    startHourInput.min = "1";
    startHourInput.max = "12";
    startHourInput.required = true;
    startHourInput.value = eventToEdit ? eventToEdit.startTime : ""; // Prefill if editing
    const startPeriodInput = document.createElement("select");
    const amOption = document.createElement("option");
    amOption.value = "AM";
    amOption.textContent = "AM";
    const pmOption = document.createElement("option");
    pmOption.value = "PM";
    pmOption.textContent = "PM";
    startPeriodInput.appendChild(amOption);
    startPeriodInput.appendChild(pmOption);
    startPeriodInput.required = true;
    form.appendChild(startTimeLabel);
    form.appendChild(startHourInput);
    form.appendChild(startPeriodInput);

    // Create input for end time
    const endTimeLabel = document.createElement("label");
    endTimeLabel.textContent = "End Time:";
    const endHourInput = document.createElement("input");
    endHourInput.type = "number";
    endHourInput.min = "1";
    endHourInput.max = "12";
    endHourInput.required = true;
    endHourInput.value = eventToEdit ? eventToEdit.endTime : ""; // Prefill if editing
    const endPeriodInput = document.createElement("select");
    endPeriodInput.appendChild(amOption.cloneNode(true)); // Clone AM option
    endPeriodInput.appendChild(pmOption.cloneNode(true)); // Clone PM option
    endPeriodInput.required = true;
    form.appendChild(endTimeLabel);
    form.appendChild(endHourInput);
    form.appendChild(endPeriodInput);

    // Create a color picker for event color
    const colorLabel = document.createElement("label");
    colorLabel.textContent = "Event Color:";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = eventToEdit ? eventToEdit.color : "#ff0000"; // Default color or prefill if editing
    form.appendChild(colorLabel);
    form.appendChild(colorInput);

    // Create buttons for submit and cancel
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel-button";
    buttonContainer.appendChild(cancelButton);

    form.appendChild(buttonContainer);
    eventFormContainer.appendChild(form);
    document.body.appendChild(eventFormContainer);

    // Add Submit button
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.textContent = eventToEdit ? "Save Changes" : "Add Event"; // Change button text if editing
    addButton.className = "add-button";
    buttonContainer.appendChild(addButton);

    // Center the form in the viewport
    eventFormContainer.style.position = "fixed";
    eventFormContainer.style.top = "50%";
    eventFormContainer.style.left = "50%";
    eventFormContainer.style.transform = "translate(-50%, -50%)";

    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const eventTitle = titleInput.value;
      const startHour = parseInt(startHourInput.value);
      const startPeriod = startPeriodInput.value;
      const endHour = parseInt(endHourInput.value);
      const endPeriod = endPeriodInput.value;
      const eventColor = colorInput.value;

      // Convert 12-hour time to 24-hour time
      const startTime =
        startPeriod === "PM" ? (startHour % 12) + 12 : startHour % 12;
      const endTime = endPeriod === "PM" ? (endHour % 12) + 12 : endHour % 12;

      if (
        isNaN(startTime) ||
        isNaN(endTime) ||
        startTime < 0 ||
        endTime > 23 ||
        startTime >= endTime
      ) {
        alert("Invalid time range. Please try again.");
        return;
      }

      if (eventToEdit) {
        eventToEdit.title = eventTitle;
        eventToEdit.startTime = startTime;
        eventToEdit.endTime = endTime;
        eventToEdit.color = eventColor;
        updateEventDisplay(eventToEdit);
      } else {
        const event = {
          title: eventTitle,
          date: date,
          startTime,
          endTime,
          color: eventColor,
          startPeriod,
          endPeriod,
        };
        displayEvent(event, dayIndex, hour);
      }

      document.body.removeChild(eventFormContainer);
      eventFormContainer = null;
    });

    cancelButton.addEventListener("click", () => {
      document.body.removeChild(eventFormContainer);
      eventFormContainer = null;
    });
  }

  function updateEventDisplay(updatedEvent) {
    const dayCells = document.querySelectorAll(".calendar-day");

    // Clear old event highlights
    dayCells.forEach((cell) => {
      const eventElement = cell.querySelector(".calendar-event");
      if (eventElement && eventElement.textContent === updatedEvent.title) {
        cell.style.backgroundColor = ""; // Reset background color
        cell.style.color = ""; // Reset text color
        cell.classList.remove("highlighted-event-cell"); // Remove highlight class
        cell.removeChild(eventElement); // Remove the old event element
      }
    });

    // Add updated event
    addEventToCalendar(updatedEvent);
  }

  function addEventToCalendar(event) {
    console.log("Event for Adding:", event); // Log the event object

    const { startTime, endTime, color, title, date } = event;
    const dayCells = document.querySelectorAll(".calendar-day");
    const dayIndex = date.getDay();

    // Calculate start and end indices using the adjusted function
    const startIndex = calculateStartIndex(dayIndex, startTime);
    const endIndex = calculateStartIndex(dayIndex, endTime);

    console.log(`Adding event: ${title}`);
    console.log(`Start Time: ${startTime}`);
    console.log(`End Time: ${endTime}`);
    console.log(`Day Index: ${dayIndex}`);
    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);

    // Add title to start index cell
    const startCell = dayCells[startIndex];
    if (startCell) {
      const eventElement = document.createElement("div");
      eventElement.className = "calendar-event";
      eventElement.textContent = title;
      eventElement.style.backgroundColor = color;
      eventElement.style.color = "#fff";
      startCell.appendChild(eventElement);
    }

    // Highlight cells for event duration
    for (let i = startIndex; i <= endIndex; i++) {
      const cell = dayCells[i];
      if (cell) {
        cell.style.backgroundColor = color;
        cell.classList.add("highlighted-event-cell");
      }
    }
  }

  // Function to display events on the calendar
  function displayEvent(event, dayIndex, hour) {
    events.push(event);

    // Convert event start time to 24-hour format
    let startHour24 = event.startTime;
    if (event.startTimePeriod === "PM" && startHour24 !== 12) {
      startHour24 += 12; // Convert PM hours to 24-hour format, except for 12 PM
    } else if (event.startTimePeriod === "AM" && startHour24 === 12) {
      startHour24 = 0; // Convert 12 AM to 0 hour in 24-hour format
    }

    // Convert event end time to 24-hour format
    let endHour24 = event.endTime;
    if (event.endTimePeriod === "PM" && endHour24 !== 12) {
      endHour24 += 12; // Convert PM hours to 24-hour format, except for 12 PM
    } else if (event.endTimePeriod === "AM" && endHour24 === 12) {
      endHour24 = 0; // Convert 12 AM to 0 hour in 24-hour format
    }

    // Find the cells to highlight
    const cells = document.querySelectorAll(".calendar-day");

    // Calculate startIndex for the event title
    const startIndex = dayIndex + (startHour24 + 1) * 7;

    // Ensure the startIndex is within bounds
    if (startIndex < 0 || startIndex >= cells.length) {
      console.error(`Invalid startIndex: ${startIndex}`);
      return;
    }

    // Place the title and buttons in the correct starting cell
    if (cells[startIndex]) {
      const eventElement = document.createElement("div");
      eventElement.className = "calendar-event";
      eventElement.textContent = event.title;
      eventElement.style.backgroundColor = event.color; // Apply color to event title
      eventElement.style.color = "#fff"; // White text for contrast

      // Add click event listener to open edit form
      eventElement.addEventListener("click", () => {
        openEventForm(event.date, dayIndex, startHour24, event);
      });

      // Add delete button to the event element
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "event-delete-button";
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteEvent(event);
      });

      // Add edit button to the event element
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "event-edit-button";
      editButton.addEventListener("click", (e) => {
        e.stopPropagation();
        openEventForm(event.date, dayIndex, startHour24, event);
      });

      // Append buttons to the event element
      eventElement.appendChild(deleteButton);
      eventElement.appendChild(editButton);

      // Add title to the correct starting block
      cells[startIndex].appendChild(eventElement);
    }

    // Highlight all relevant cells based on start and end times
    for (let h = startHour24; h < endHour24; h++) {
      const highlightIndex = dayIndex + (h + 1) * 7;

      // Ensure the highlightIndex is within bounds
      if (highlightIndex >= 0 && highlightIndex < cells.length) {
        cells[highlightIndex].style.backgroundColor = event.color;
        cells[highlightIndex].style.color = "#fff"; // Optional: change text color for better visibility
        cells[highlightIndex].classList.add("highlighted-event-cell");
      }
    }
  }

  function deleteEvent(eventToDelete) {
    // Remove event from the events array
    const index = events.indexOf(eventToDelete);
    if (index > -1) {
      events.splice(index, 1);
    }

    // Re-render the calendar to reflect changes
    renderCalendar(currentDate, viewSelector.value);
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
