
async function getoccupieddates(arg) {
  try {
    const newdate = new Date(arg.date);

    // Convert to ISO 8601 format
    let isoString = newdate.toISOString();

    // Now, isoString will look like this: "2025-01-26T00:00:00.000Z"

    // Remove the trailing 'Z' and adjust for +00:00 timezone
    isoString = isoString.replace('Z', '+00:00');

    const response = await fetch(`/attendance/get-dates/${isoString}`); // Modify URL as necessary
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data === true) {
      arg.el.style.backgroundColor = '#c1dfe7'; // Yellow background
    }
  }
  catch (error) {
    console.error('Failed to change backgroud colour:', error);
  }
}
async function handleOnClick(date) {
  try {
    const response = await fetch(`/attendance/check-date/${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success == false) {

      window.location.href = `/attendance/${data.churchId}/${date}/attendancePage`;
    }
    else {
      window.location.href = `/attendance/${data.attendanceId}/readAttendance`;
    }

  } catch (error) {}
}

document.addEventListener('DOMContentLoaded', function () {

  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: '',
      center: 'title',
      right: 'today prevYear,prev,next,nextYear'
    },
    dateClick: async function (info) {
      handleOnClick(info.dateStr)
    },
    dayCellDidMount: function (arg) {
      getoccupieddates(arg)
    }
  });
  calendar.render();
});