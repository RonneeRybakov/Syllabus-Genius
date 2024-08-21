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

  let eventFormContainer = null; // Track the currently open event form

  function openEventForm(date, dayIndex, hour) {
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
    form.appendChild(titleLabel);
    form.appendChild(titleInput);

    // Create input for start time
    const startTimeLabel = document.createElement("label");
    startTimeLabel.textContent = "Start Time (0-23):";
    const startTimeInput = document.createElement("input");
    startTimeInput.type = "number";
    startTimeInput.min = "0";
    startTimeInput.max = "23";
    startTimeInput.required = true;
    form.appendChild(startTimeLabel);
    form.appendChild(startTimeInput);

    // Create input for end time
    const endTimeLabel = document.createElement("label");
    endTimeLabel.textContent = "End Time (0-23):";
    const endTimeInput = document.createElement("input");
    endTimeInput.type = "number";
    endTimeInput.min = "0";
    endTimeInput.max = "23";
    endTimeInput.required = true;
    form.appendChild(endTimeLabel);
    form.appendChild(endTimeInput);

    // Create a color picker for event color
    const colorLabel = document.createElement("label");
    colorLabel.textContent = "Event Color:";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = "#ff0000"; // Default color (red)
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

    // Add Event button
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.textContent = "Add Event";
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
      const startTime = parseInt(startTimeInput.value);
      const endTime = parseInt(endTimeInput.value);
      const eventColor = colorInput.value;

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

      for (let h = startTime; h < endTime; h++) {
        const eventDate = new Date(date);
        eventDate.setDate(date.getDate() - date.getDay() + dayIndex);
        eventDate.setHours(h);

        const event = {
          title: eventTitle,
          date: eventDate,
          startTime,
          endTime,
          color: eventColor,
        };

        displayEvent(event, dayIndex, h);
      }

      // Remove the form after submission
      document.body.removeChild(eventFormContainer);
      eventFormContainer = null; // Reset the form container tracker
    });

    // Handle cancel button click
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(eventFormContainer);
      eventFormContainer = null; // Reset the form container tracker
    });
  }

  // Function to display events on the calendar
  function displayEvent(event, dayIndex, hour) {
    events.push(event);

    // Find the cells to highlight
    const cells = document.querySelectorAll(".calendar-day");
    const startIndex = dayIndex + (hour + 1) * 7; // Adjusted index for the correct row

    // Display event title only in the starting cell
    if (cells[startIndex]) {
      const eventElement = document.createElement("div");
      eventElement.className = "calendar-event";
      eventElement.textContent = event.title;
      eventElement.style.backgroundColor = event.color; // Apply color to event title
      eventElement.style.color = "#fff"; // White text for contrast

      // Add click event listener to open edit form
      eventElement.addEventListener("click", () => {
        openEditForm(event, startIndex, dayIndex, hour);
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
        openEditForm(event, startIndex, dayIndex, hour);
      });

      // Append buttons to the event element
      eventElement.appendChild(deleteButton);
      eventElement.appendChild(editButton);

      // Add title only to the starting block
      cells[startIndex].appendChild(eventElement);

      // Highlight all relevant cells without titles
      for (let h = event.startTime; h < event.endTime; h++) {
        const highlightIndex = dayIndex + (h + 1) * 7;
        if (cells[highlightIndex]) {
          cells[highlightIndex].style.backgroundColor = event.color;
          cells[highlightIndex].style.color = "#fff"; // Optional: change text color for better visibility

          // Optionally, you might want to add some visual indication that these cells are part of the event
          // For example, you can add a class to highlight these cells
          cells[highlightIndex].classList.add("highlighted-event-cell");
        }
      }
    }
  }

  function openEditForm(event, startIndex, dayIndex, hour) {
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
    titleInput.value = event.title; // Pre-fill with current title
    titleInput.required = true;
    form.appendChild(titleLabel);
    form.appendChild(titleInput);

    // Create input for start time
    const startTimeLabel = document.createElement("label");
    startTimeLabel.textContent = "Start Time (0-23):";
    const startTimeInput = document.createElement("input");
    startTimeInput.type = "number";
    startTimeInput.min = "0";
    startTimeInput.max = "23";
    startTimeInput.value = event.startTime; // Pre-fill with current start time
    startTimeInput.required = true;
    form.appendChild(startTimeLabel);
    form.appendChild(startTimeInput);

    // Create input for end time
    const endTimeLabel = document.createElement("label");
    endTimeLabel.textContent = "End Time (0-23):";
    const endTimeInput = document.createElement("input");
    endTimeInput.type = "number";
    endTimeInput.min = "0";
    endTimeInput.max = "23";
    endTimeInput.value = event.endTime; // Pre-fill with current end time
    endTimeInput.required = true;
    form.appendChild(endTimeLabel);
    form.appendChild(endTimeInput);

    // Create a color picker for event color
    const colorLabel = document.createElement("label");
    colorLabel.textContent = "Event Color:";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = event.color; // Pre-fill with current color
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

    // Update button
    const updateButton = document.createElement("button");
    updateButton.type = "submit";
    updateButton.textContent = "Update Event";
    updateButton.className = "update-button";
    buttonContainer.appendChild(updateButton);

    form.appendChild(buttonContainer);
    eventFormContainer.appendChild(form);
    document.body.appendChild(eventFormContainer);

    // Position the form near the clicked cell
    eventFormContainer.style.position = "absolute";
    eventFormContainer.style.left = `${event.clientX}px`;
    eventFormContainer.style.top = `${event.clientY}px`;

    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const eventTitle = titleInput.value;
      const startTime = parseInt(startTimeInput.value);
      const endTime = parseInt(endTimeInput.value);
      const eventColor = colorInput.value;

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

      // Update event properties
      event.title = eventTitle;
      event.startTime = startTime;
      event.endTime = endTime;
      event.color = eventColor;

      // Re-render the calendar to reflect changes
      renderCalendar(currentDate, viewSelector.value);

      // Remove the form after submission
      document.body.removeChild(eventFormContainer);
      eventFormContainer = null; // Reset the form container tracker
    });

    // Handle cancel button click
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(eventFormContainer);
      eventFormContainer = null; // Reset the form container tracker
    });
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
