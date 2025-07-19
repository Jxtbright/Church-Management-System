const Attendance = require('../models/attendance');
const SpecialService = require('../models/specialService');
const Offering = require('../models/offering');
const Church = require('../models/churches');
const Group = require('../models/groups');
const { calGeneralAverages } = require("../functions/calGeneralReport")

const puppeteer = require('puppeteer');
const fs = require('fs');

const checkDate = async (req, res) => {
  try {
    const date = req.params.date;

    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      checkdate(req.session.attendanceChurchId);
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      checkdate(req.session.churchId);
    }

    async function checkdate(churchId) {
      const results = await Attendance.findOne({ $and: [{ churchId }, { date }] });
      // const offerings = await Offering.findOne({ $and: [{ churchId }, { date }] });

      if (results == null) {
        res.json({
          success: false,
          churchId: churchId
        });
      }
      else {
        res.json({
          success: true,
          attendanceId: results._id
        });
      }
    }
  }
  catch (e) {
    res.status(500).send('Something went wrong, please try again later.');
  }
}

const getDates = async (req, res) => {
  try {
    const date = req.params.date;
    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      getdates(req.session.attendanceChurchId);
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      getdates(req.session.churchId);
    }

    async function getdates(churchId) {
      const results = await Attendance.findOne({ $and: [{ churchId }, { date }] });
      if (results == null) {
        res.json(false);
      }
      else {
        res.json(true);
      }
    }
  }
  catch (e) {
    res.status(500).send('Something went wrong, please try again later.');
  }
}

const showSpecialServicePage = async (req, res) => {
  if (req.session.status === 'manager') {
    const churches = await Church.find({});
    return res.render('attendanceCrud/specialService', { churches, req });
  } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const churches = await Church.find({ groupId: req.session.groupId });
    return res.render('attendanceCrud/specialService', { churches, req });
  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    return res.render('attendanceCrud/specialService', { req });
  } else {

  }
};

const saveSpecialService = async (req, res) => {
  if (req.session.status === 'pastor' || req.session.status === 'admin') {
    const churchId = req.session.churchId;
    const church = await Church.findById(churchId);
    const specialService = new SpecialService({ ...req.body, churchId, groupId: church.groupId });
    await specialService.save();
  }
  else if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const church = await Church.findById(req.body.churchId);
    const specialService = new SpecialService({ ...req.body, groupId: church.groupId });
    await specialService.save();
  }

  req.flash('success', 'Special Service successfully added.');
  return res.redirect('/attendance/specialService');
}

const SpecialServiceTable = async (req, res) => {
  if (req.session.status === 'manager') {
    const services = await SpecialService.find({});
    return res.render('attendanceCrud/specialservicetable', { services, req });
  } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const services = await SpecialService.find({ groupId: req.session.groupId });
    return res.render('attendanceCrud/specialservicetable', { services, req });
  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    const services = await SpecialService.find({ churchId: req.session.churchId });
    return res.render('attendanceCrud/specialservicetable', { services, req });
  } else {

  }
};

const EditSpecialServicePage = async (req, res) => {
  const service = await SpecialService.findById(req.params.id);
  return res.render('attendanceCrud/specialserviceedit', { service, req });
};

const updatespecialservice = async (req, res) => {
  await SpecialService.findByIdAndUpdate(req.params.id, { ...req.body });
  req.flash('success', 'Special service details successfully updated.');
  return res.redirect('/attendance/specialservicetable');
};

const deletespecialservice = async (req, res) => {
  await SpecialService.findByIdAndDelete(req.params.id);
  req.flash('success', 'Service deleted.');
  return res.redirect('/attendance/specialservicetable');
};

const setChurchId = async (req, res) => {
  req.session.attendanceChurchId = req.params.id;
  if (req.session.status === 'manager') {
    const churches = await Church.find({});
    return res.render('attendanceCrud/calendar', { churches, req });
  } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const churches = await Church.find({ groupId: req.session.groupId });
    return res.render('attendanceCrud/calendar', { churches, req });
  }
}

const showcalendar = async (req, res) => {
  try {
    if (req.session.status === 'manager') {
      const churches = await Church.find({});
      return res.render('attendanceCrud/calendar', { churches, req });
    } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      const churches = await Church.find({ groupId: req.session.groupId });
      return res.render('attendanceCrud/calendar', { churches, req });
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      return res.render('attendanceCrud/calendar', { req });
    }
  } catch (err) {
    res.status(500).send('Something went wrong, please try again later.');
  }
};

const addAttendancePage = async (req, res) => {

  const churchId = req.params.id;
  const date = req.params.date;

  const dateStr = new Date(date);

  // Get the day of the month
  const day = dateStr.getDate();

  // Get the month name using `Intl.DateTimeFormat`
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateStr);

  // Get the year
  const year = dateStr.getFullYear();

  // Get the day name using `Intl.DateTimeFormat`
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateStr);

  // Format the date as "Day Name Day Month, Year"
  const formattedDate = `${day} ${monthName}, ${year}`;

  res.render('attendanceCrud/addAttendancePage', { churchId, date, formattedDate, dayName, req });

}

const saveattendanceandoffering = async (req, res) => {
  const date = req.params.date;
  const dateStr = new Date(date);
  // Get the day name using `Intl.DateTimeFormat`
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateStr);

  if (req.session.status === 'pastor' || req.session.status === 'admin') {
    const churchId = req.session.churchId;
    const church = await Church.findById(churchId);
    if (req.body.attendance.reason) {
      const attendance = new Attendance({ churchId, date, reason: req.body.attendance.reason, groupId: church.groupId, dayName });
      await attendance.save();
      const offering = new Offering({ firstoffering: 0, secondoffering: 0, churchId, attendanceId: attendance._id, date, groupId: church.groupId, dayName });
      await offering.save();
    }
    else {
      const attendance = new Attendance({ ...req.body.attendance, date, churchId, groupId: church.groupId, dayName });
      await attendance.save();

      const offering = new Offering({ ...req.body.attendance, churchId, attendanceId: attendance._id, date, groupId: church.groupId, dayName });
      await offering.save();
    }
  }
  else if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const churchId = req.session.attendanceChurchId;
    const church = await Church.findById(churchId);
    if (req.body.attendance.reason) {
      const attendance = new Attendance({ churchId, date, reason: req.body.attendance.reason, groupId: church.groupId, dayName });
      await attendance.save();
      const offering = new Offering({ firstoffering: 0, secondoffering: 0, churchId, attendanceId: attendance._id, date, groupId: church.groupId, dayName });
      await offering.save();
    }
    else {
      const attendance = new Attendance({ ...req.body.attendance, date, churchId, groupId: church.groupId, dayName });
      await attendance.save();

      const offering = new Offering({ ...req.body.attendance, churchId, attendanceId: attendance._id, date, groupId: church.groupId, dayName });
      await offering.save();
    }
  }

  req.flash('success', 'Attendance successfully added.');
  return res.redirect('/attendance/calendar');
}




const readAttendance = async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  const dateStr = new Date(attendance.date);

  // Get the day of the month
  const day = dateStr.getDate();

  // Get the month name using `Intl.DateTimeFormat`
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateStr);

  // Get the year
  const year = dateStr.getFullYear();

  // Get the day name using `Intl.DateTimeFormat`
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateStr);

  // Format the date as "Day Name Day Month, Year"
  const formattedDate = `${day} ${monthName}, ${year}`;

  const totalAttendance = attendance.adultmale + attendance.adultfemale
    + attendance.youthmale + attendance.youthfemale + attendance.childrenmale
    + attendance.childrenfemale + attendance.newcomersmales + attendance.newcomersmales;

  if (attendance.reason) {
    return res.render('attendanceCrud/readAttendance2', { attendance, totalAttendance, dayName, formattedDate, req });
  }
  else {
    const offering = await Offering.findOne({ attendanceId: attendance._id });
    return res.render('attendanceCrud/readAttendance2', { attendance, totalAttendance, offering, dayName, formattedDate, req });

  }
}

const updatepage = async (req, res) => {

  const attendance = await Attendance.findById(req.params.id);

  const date = attendance.date;

  const dateStr = new Date(date);

  // Get the day of the month
  const day = dateStr.getDate();

  // Get the month name using `Intl.DateTimeFormat`
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateStr);

  // Get the year
  const year = dateStr.getFullYear();

  // Get the day name using `Intl.DateTimeFormat`
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateStr);

  // Format the date as "Day Name Day Month, Year"
  const formattedDate = `${day} ${monthName}, ${year}`;

  if (!attendance.reason) {
    const offering = await Offering.findOne({ attendanceId: attendance._id });

    return res.render('attendanceCrud/editAttendancePage', { attendance, offering, dayName, formattedDate, req });
  }
  else {
    return res.render('attendanceCrud/editAttendancePage', { attendance, dayName, formattedDate, req });
  }

}

const update = async (req, res) => {
  const offering = await Offering.findOne({ attendanceId: req.params.id });
  if (req.body.attendance.reason) {
    await Attendance.findByIdAndUpdate(req.params.id, { reason: req.body.attendance.reason });
    await Offering.findByIdAndUpdate(offering._id, { firstoffering: 0, secondoffering: 0 });
  }
  else {
    await Attendance.findByIdAndUpdate(req.params.id, { ...req.body.attendance });
    await Offering.findByIdAndUpdate(offering._id, { ...req.body.attendance });
  }
  req.flash('success', 'Attendance details successfully updated.');
  return res.redirect('/attendance/calendar')
};

const deleteattendance = async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  await Attendance.findByIdAndDelete(req.params.id);

  const offering = await Offering.findOne({ attendanceId: req.params.id });
  await Offering.findByIdAndDelete(offering._id)
  req.flash('success', 'Attendance deleted.');
  return res.redirect('/attendance/calendar');
};

const searchattendance = async (req, res) => {
  const churchId = req.params.id;
  const { startdate, enddate } = req.body;
  const attendances = await Attendance.find({ $and: [{ churchId }, { date: { $lte: enddate } }, { date: { $gte: startdate } }] });
  const offerings = await Offering.find({ $and: [{ churchId }, { date: { $lte: enddate } }, { date: { $gte: startdate } }] });
  res.render('attendanceCrud/readAttendance', { attendances, offerings, churchId });
};

const generateReportPage = async (req, res) => {
  if (req.session.status === 'manager') {
    const churches = await Church.find({});
    const groups = await Group.find({});
    return res.render('attendanceCrud/generateReportPage', { req, churches, groups });
  } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const churches = await Church.find({ groupId: req.session.groupId });
    return res.render('attendanceCrud/generateReportPage', { req, churches });
  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    return res.render('attendanceCrud/generateReportPage', { req });
  } else {

  }
};

const generateMonthlyPage = async (req, res) => {
  if (req.session.status === 'manager') {
    const churches = await Church.find({});
    const groups = await Group.find({});
    return res.render('attendanceCrud/generateMonthly', { req, churches, groups });
  } else if (req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    const churches = await Church.find({ groupId: req.session.groupId });
    return res.render('attendanceCrud/generateMonthly', { req, churches });
  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    return res.render('attendanceCrud/generateMonthly', { req });
  } else {

  }
};


const attendancereport_monthly = async (req, res) => {
  req.session.attendancedetails = req.body;

  const getGroupName = async (id) => {
    const group = await Group.findById(id);
    req.session.groupAttendance = true;
    req.session.churchAttendance = false;
    req.session.groupName = group.name;
  }

  const getChurchName = async (id) => {
    const church = await Church.findById(id).populate('groupId');
    req.session.churchAttendance = true;
    req.session.groupAttendance = false;
    req.session.churchName = church.churchname;
    req.session.groupName = church.groupId.name;
  }

  const getdate = async (date) => {
    const dateStr = new Date(date);

    // Get the month name using `Intl.DateTimeFormat`
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateStr);

    // Get the year
    const year = dateStr.getFullYear();

    // Format the date as "Day Name Day Month, Year"
    const formattedDate = `${monthName}, ${year}`;
    return formattedDate;
  }

  req.session.date = await getdate(req.body.monthly.month);

  const [year, month] = req.body.monthly.month.split('-').map(Number);

  // Start date: first day of the month at 00:00:00.000
  const startdate = new Date(year, month - 1, 1);

  // End date: last day of the month at 23:59:59.999
  const enddate = new Date(year, month, 0); // Last day of current month
  enddate.setHours(23, 59, 59, 999);

  const getNthWeekday = (occurrence, targetDay) => {
    // Clone the start date to avoid mutation
    const date = new Date(startdate);

    // Validate occurrence (1-5)
    if (occurrence < 1 || occurrence > 5) {
      throw new Error('Occurrence must be between 1 and 5');
    }

    // Calculate days to first occurrence
    const diff = (targetDay - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + diff);

    // Add weeks for subsequent occurrences
    if (occurrence > 1) {
      date.setDate(date.getDate() + (occurrence - 1) * 7);
    }

    // Check if the date is still within the month
    return date <= enddate ? date : null;
  };

  const attendances = [];

  if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    if (!req.body.monthly.groupId) {
      if (req.body.monthly.churchId !== 'group') {
        const arr = await Attendance.find({
          $and: [{ churchId: req.body.monthly.churchId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        attendances.push(...arr);
        await getChurchName(req.body.monthly.churchId);
      } else {
        const arr = await Attendance.find({
          $and: [{ groupId: req.session.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        attendances.push(...arr);
        await getGroupName(req.session.groupId);
      }
    } else {
      const arr = await Attendance.find({
        $and: [{ groupId: req.body.monthly.groupId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      });
      attendances.push(...arr);
      await getGroupName(req.body.monthly.groupId);
    }

  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    const arr = await Attendance.find({
      $and: [{ churchId: req.session.churchId },
      { date: { $lte: enddate } }, { date: { $gte: startdate } }]
    });
    attendances.push(...arr);
    await getChurchName(req.session.churchId);
  }

  const week1 = [];
  const week2 = [];
  const week3 = [];
  const week4 = [];
  const week5 = [];

  for (let j = 1; j <= 5; j++) {
    for (let i = 0; i <= 4; i++) {
      if (i === 0 || i === 1 || i === 4) {
        for (attendance of attendances) {
          const date = getNthWeekday(j, i);
          const date1 = new Date(date);
          const date2 = new Date(attendance.date);
          if (date1.getTime() === date2.getTime()) {
            if (j === 1) {
              week1.push(attendance)
            }
            else if (j === 2) {
              week2.push(attendance)
            }
            else if (j === 3) {
              week3.push(attendance)
            }
            else if (j === 4) {
              week4.push(attendance)
            }
            else if (j === 5) {
              week5.push(attendance)
            }
          }
        }
      }
    }
  }

  const attendanceArray = [];

  const weeks = [week1, week2, week3, week4, week5];

  for (const week of weeks) {
    const grouped = {};

    // Group entries by dayName
    for (const entry of week) {
      const day = entry.dayName;

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(entry);
    }

    const result = [];

    for (const day in grouped) {
      const entries = grouped[day];

      // Check if all entries have only "reason" (i.e., no attendance data)
      const allHaveReasonOnly = entries.every(e =>
        e.reason &&
        !e.adultmale && !e.adultfemale &&
        !e.youthmale && !e.youthfemale &&
        !e.childrenmale && !e.childrenfemale &&
        !e.newcomersmales && !e.newcomersfemales
      );

      if (allHaveReasonOnly) {
        result.push({
          dayName: day,
          reason: entries[entries.length - 1].reason // use the last one's reason
        });
      } else {
        // Sum up attendance data
        const total = {
          dayName: day,
          adultmale: 0,
          adultfemale: 0,
          youthmale: 0,
          youthfemale: 0,
          childrenmale: 0,
          childrenfemale: 0,
          newcomersmales: 0,
          newcomersfemales: 0
        };

        for (const entry of entries) {
          total.adultmale += entry.adultmale || 0;
          total.adultfemale += entry.adultfemale || 0;
          total.youthmale += entry.youthmale || 0;
          total.youthfemale += entry.youthfemale || 0;
          total.childrenmale += entry.childrenmale || 0;
          total.childrenfemale += entry.childrenfemale || 0;
          total.newcomersmales += entry.newcomersmales || 0;
          total.newcomersfemales += entry.newcomersfemales || 0;
        }

        result.push(total);
      }
    }

    attendanceArray.push(result);
  }



  const offerings = [];

  if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    if (!req.body.monthly.groupId) {
      if (req.body.monthly.churchId !== 'group') {
        const arr = await Offering.find({
          $and: [{ churchId: req.body.monthly.churchId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        offerings.push(...arr);
      } else {
        const arr = await Offering.find({
          $and: [{ groupId: req.session.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        offerings.push(...arr);
      }
    } else {
      const arr = await Offering.find({
        $and: [{ groupId: req.body.monthly.groupId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      });
      offerings.push(...arr);
    }
  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    const arr = await Offering.find({
      $and: [{ churchId: req.session.churchId },
      { date: { $lte: enddate } }, { date: { $gte: startdate } }]
    });
    offerings.push(...arr);
  }

  const week1Offering = [];
  const week2Offering = [];
  const week3Offering = [];
  const week4Offering = [];
  const week5Offering = [];

  for (let j = 1; j <= 5; j++) {
    for (let i = 0; i <= 4; i++) {
      if (i === 0 || i === 1 || i === 4) {
        for (offering of offerings) {
          const date = getNthWeekday(j, i);
          const date1 = new Date(date);
          const date2 = new Date(offering.date);
          if (date1.getTime() === date2.getTime()) {
            if (j === 1) {
              week1Offering.push(offering)
            }
            else if (j === 2) {
              week2Offering.push(offering)
            }
            else if (j === 3) {
              week3Offering.push(offering)
            }
            else if (j === 4) {
              week4Offering.push(offering)
            }
            else if (j === 5) {
              week5Offering.push(offering)
            }
          }
        }
      }
    }
  }

  const weeksOffering = [week1Offering, week2Offering, week3Offering, week4Offering, week5Offering];

  const groupedWeekArrays = []; // Will temporarily hold the grouped data

  for (const week of weeksOffering) {
    const grouped = {};

    week.forEach(entry => {
      const day = entry.dayName;

      if (!grouped[day]) {
        grouped[day] = {
          dayName: day,
          firstoffering: 0,
          secondoffering: 0
        };
      }

      grouped[day].firstoffering += entry.firstoffering || 0;
      grouped[day].secondoffering += entry.secondoffering || 0;
    });

    groupedWeekArrays.push(Object.values(grouped));
  }

  // Destructure into the named arrays you want
  const [
    week1OfferingArray,
    week2OfferingArray,
    week3OfferingArray,
    week4OfferingArray,
    week5OfferingArray
  ] = groupedWeekArrays;




  const special_services = [];

  if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
    if (!req.body.monthly.groupId) {
      if (req.body.monthly.churchId !== 'group') {
        const arr = await SpecialService.find({
          $and: [{ churchId: req.body.monthly.churchId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        special_services.push(...arr);
      } else {
        const arr = await SpecialService.find({
          $and: [{ groupId: req.session.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        special_services.push(...arr);
      }
    } else {
      const arr = await SpecialService.find({
        $and: [{ groupId: req.body.monthly.groupId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      });
      special_services.push(...arr);
    }
  } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
    const arr = await SpecialService.find({
      $and: [{ churchId: req.session.churchId },
      { date: { $lte: enddate } }, { date: { $gte: startdate } }]
    });
    special_services.push(...arr);
  }

  const gck = [];
  const homeCaringFellowship = [];
  const seminarArray = [];

  for (service of special_services) {
    if (service.category === "GCK") {
      gck.push(service)
    }
    else if (service.category === "Home Caring Fellowship") {
      homeCaringFellowship.push(service)
    }
    else if (service.category === "Seminar") {
      seminarArray.push(service)
    }
  }

  function groupAndSumByDate(entries) {
    const grouped = {};

    for (const entry of entries) {
      const dateStr = new Date(entry.date).toISOString().split('T')[0];

      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: new Date(dateStr),
          adults: 0,
          youths: 0,
          children: 0
        };
      }

      grouped[dateStr].adults += entry.adults || 0;
      grouped[dateStr].youths += entry.youths || 0;
      grouped[dateStr].children += entry.children || 0;
    }

    return Object.values(grouped);
  }

  const gckArray = groupAndSumByDate(gck);
  const homeCaringFellowshipArray = groupAndSumByDate(homeCaringFellowship);


  return res.render('attendanceCrud/report_table_monthly', {
    churchId: req.params.id,
    req, attendanceArray, week1OfferingArray, week2OfferingArray, week3OfferingArray,
    week4OfferingArray, week5OfferingArray, gckArray, homeCaringFellowshipArray, seminarArray
  })
};


const attendancereport_general = async (req, res) => {
  req.session.attendancedetails = req.body;

  const getGroupName = async (id) => {
    const group = await Group.findById(id);
    req.session.groupAttendance = true;
    req.session.churchAttendance = false;
    req.session.groupName = group.name;
  }

  const getChurchName = async (id) => {
    const church = await Church.findById(id).populate('groupId');
    req.session.churchAttendance = true;
    req.session.groupAttendance = false;
    req.session.churchName = church.churchname;
    req.session.groupName = church.groupId.name;
  }

  const { startdate, enddate } = req.body;
  const getdate = (date) => {
    const dateStr = new Date(date);

    // Get the day of the month
    const day = dateStr.getDate();

    // Get the month name using `Intl.DateTimeFormat`
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateStr);

    // Get the year
    const year = dateStr.getFullYear();

    // Format the date as "Day Name Day Month, Year"
    const formattedDate = `${day} ${monthName}, ${year}`;
    return formattedDate;
  }

  req.session.startdate = getdate(startdate);
  req.session.enddate = getdate(enddate);

  if (startdate >= enddate) {
    req.flash('error', 'Invalid date format');
    return res.redirect('/attendance/report')
  }
  else {
    const offerings = [];

    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      if (!req.body.groupId) {
        if (req.body.churchId !== 'group') {
          const arr = await Offering.find({
            $and: [{ churchId: req.body.churchId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          }).populate('attendanceId');
          offerings.push(...arr);
          await getChurchName(req.body.churchId);
        } else {
          const arr = await Offering.find({
            $and: [{ groupId: req.session.groupId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          }).populate('attendanceId');
          offerings.push(...arr);
          await getGroupName(req.session.groupId);
        }
      } else {
        const arr = await Offering.find({
          $and: [{ groupId: req.body.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        }).populate('attendanceId');
        offerings.push(...arr);
        await getGroupName(req.body.groupId);
      }
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      const arr = await Offering.find({
        $and: [{ churchId: req.session.churchId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      }).populate('attendanceId');
      offerings.push(...arr);
      await getChurchName(req.session.churchId);
    }

    const sundaysOfferingArray = [];
    const mondaysOfferingArray = [];
    const thursdaysOfferingArray = [];

    for (offering of offerings) {
      const date = offering.date;
      const dateStr = new Date(date);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateStr);
      if (dayName == "Sunday") {
        sundaysOfferingArray.push(offering)
      }
      else if (dayName == "Monday") {
        mondaysOfferingArray.push(offering)
      }
      else if (dayName == "Thursday") {
        thursdaysOfferingArray.push(offering)
      }
    }

    const special_services = [];

    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      if (!req.body.groupId) {
        if (req.body.churchId !== 'group') {
          const arr = await SpecialService.find({
            $and: [{ churchId: req.body.churchId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          });
          special_services.push(...arr);
        } else {
          const arr = await SpecialService.find({
            $and: [{ groupId: req.session.groupId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          });
          special_services.push(...arr);
        }
      } else {
        const arr = await SpecialService.find({
          $and: [{ groupId: req.body.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        special_services.push(...arr);
      }
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      const arr = await SpecialService.find({
        $and: [{ churchId: req.session.churchId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      });
      special_services.push(...arr);
    }

    const gckArray = [];
    const homeCaringFellowshipArray = [];
    const seminarArray = [];

    for (service of special_services) {
      if (service.category === "GCK") {
        gckArray.push(service)
      }
      else if (service.category === "Home Caring Fellowship") {
        homeCaringFellowshipArray.push(service)
      }
      else if (service.category === "Seminar") {
        seminarArray.push(service)
      }
    }

    const [sundayValues, mondayValues, thursdayValues] = await calGeneralAverages(sundaysOfferingArray, mondaysOfferingArray, thursdaysOfferingArray);

    return res.render('attendanceCrud/report_table_general', {
      req, sundayValues, mondayValues,
      thursdayValues, gckArray, homeCaringFellowshipArray, seminarArray
    });
  }
};


async function convertHTMLToPDF(htmlContent, pdfFilePath, margins = { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }) {
  const { executablePath } = require('puppeteer');

  const browser = await puppeteer.launch({
    timeout: 60000,
    headless: true,
    executablePath: executablePath(), // resolves to the downloaded chrome
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  // await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.04638.69 Safari/537.36");
  // set page content
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  // Generate PDF
  const pdfBuffer = await page.pdf({ path: pdfFilePath, format: 'A4', margin: margins, landscape: false, printBackground: true })
  // Open the generated PDF file in the default PDF viewer
  const open = await import('open');
  await open.default(pdfFilePath);
  // Close the browser
  await browser.close();
};


const generateattendancereport_monthly = async (req, res) => {
  const generate = async (arg) => {
    const [year, month] = arg.monthly.month.split('-').map(Number);
    // Start date: first day of the month at 00:00:00.000
    const startdate = new Date(year, month - 1, 1);
    // End date: last day of the month at 23:59:59.999
    const enddate = new Date(year, month, 0); // Last day of current month
    enddate.setHours(23, 59, 59, 999);

    const getNthWeekday = (occurrence, targetDay) => {
      // Clone the start date to avoid mutation
      const date = new Date(startdate);
      // Validate occurrence (1-5)
      if (occurrence < 1 || occurrence > 5) {
        throw new Error('Occurrence must be between 1 and 5');
      }
      // Calculate days to first occurrence
      const diff = (targetDay - date.getDay() + 7) % 7;
      date.setDate(date.getDate() + diff);
      // Add weeks for subsequent occurrences
      if (occurrence > 1) {
        date.setDate(date.getDate() + (occurrence - 1) * 7);
      }
      // Check if the date is still within the month
      return date <= enddate ? date : null;
    };

    const offerings = [];
    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      if (!arg.monthly.groupId) {
        if (arg.monthly.churchId !== 'group') {
          const arr = await Offering.find({
            $and: [{ churchId: arg.monthly.churchId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          }).populate('attendanceId');
          offerings.push(...arr);
        } else {
          const arr = await Offering.find({
            $and: [{ groupId: req.session.groupId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          }).populate('attendanceId');
          offerings.push(...arr);
        }
      } else {
        const arr = await Offering.find({
          $and: [{ groupId: arg.monthly.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        }).populate('attendanceId');
        offerings.push(...arr);
      }
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      const arr = await Offering.find({
        $and: [{ churchId: req.session.churchId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      }).populate('attendanceId');
      offerings.push(...arr);
    }

    // const sundaysOfferingArray = [];
    // const mondaysOfferingArray = [];
    // const thursdaysOfferingArray = [];

    const sundaysOffering = [];
    const mondaysOffering = [];
    const thursdaysOffering = [];

    for (let i = 0; i <= 4; i++) {
      if (i === 0 || i === 1 || i === 4) {
        for (let j = 1; j <= 5; j++) {
          for (offering of offerings) {
            const date = getNthWeekday(j, i);
            const date1 = new Date(date);
            const date2 = new Date(offering.date);
            if (date1.getTime() === date2.getTime()) {
              if (i == 0) {
                sundaysOffering.push(offering)
              }
              else if (i == 1) {
                mondaysOffering.push(offering)
              }
              else if (i == 4) {
                thursdaysOffering.push(offering)
              }
            }
          }
        }
      }
    }

    function hasAttendanceData(att) {
      return (
        att.adultmale || att.adultfemale ||
        att.youthmale || att.youthfemale ||
        att.childrenmale || att.childrenfemale ||
        att.newcomersmales || att.newcomersfemales
      );
    }

    const inputs = {
      sundaysOffering,
      mondaysOffering,
      thursdaysOffering
    };

    const results = {};

    for (const [key, data] of Object.entries(inputs)) {
      const grouped = {};

      for (const entry of data) {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];

        if (!grouped[dateStr]) {
          grouped[dateStr] = {
            date: new Date(dateStr),
            dayName: entry.dayName,
            firstoffering: 0,
            secondoffering: 0,
            attendanceId: {
              adultmale: 0,
              adultfemale: 0,
              youthmale: 0,
              youthfemale: 0,
              childrenmale: 0,
              childrenfemale: 0,
              newcomersmales: 0,
              newcomersfemales: 0,
              reason: null
            },
            allReasonsOnly: true
          };
        }

        grouped[dateStr].firstoffering += entry.firstoffering || 0;
        grouped[dateStr].secondoffering += entry.secondoffering || 0;

        const att = entry.attendanceId || {};

        if (att.reason && !hasAttendanceData(att)) {
          grouped[dateStr].attendanceId.reason = att.reason;
        } else {
          grouped[dateStr].allReasonsOnly = false;
          grouped[dateStr].attendanceId.adultmale += att.adultmale || 0;
          grouped[dateStr].attendanceId.adultfemale += att.adultfemale || 0;
          grouped[dateStr].attendanceId.youthmale += att.youthmale || 0;
          grouped[dateStr].attendanceId.youthfemale += att.youthfemale || 0;
          grouped[dateStr].attendanceId.childrenmale += att.childrenmale || 0;
          grouped[dateStr].attendanceId.childrenfemale += att.childrenfemale || 0;
          grouped[dateStr].attendanceId.newcomersmales += att.newcomersmales || 0;
          grouped[dateStr].attendanceId.newcomersfemales += att.newcomersfemales || 0;
        }
      }

      results[key + 'Array'] = Object.values(grouped).map(entry => {
        if (!entry.allReasonsOnly) {
          delete entry.attendanceId.reason;
        }
        delete entry.allReasonsOnly;
        return entry;
      });
    }

    // Access the arrays:
    const sundaysOfferingArray = results.sundaysOfferingArray;
    const mondaysOfferingArray = results.mondaysOfferingArray;
    const thursdaysOfferingArray = results.thursdaysOfferingArray;

    console.log(sundaysOfferingArray)
    console.log(mondaysOfferingArray)
    console.log(thursdaysOfferingArray)


    const special_services = [];
    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      if (!arg.monthly.groupId) {
        if (arg.monthly.churchId !== 'group') {
          const arr = await SpecialService.find({
            $and: [{ churchId: arg.monthly.churchId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          });
          special_services.push(...arr);
        } else {
          const arr = await SpecialService.find({
            $and: [{ groupId: req.session.groupId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          });
          special_services.push(...arr);
        }
      } else {
        const arr = await SpecialService.find({
          $and: [{ groupId: arg.monthly.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        special_services.push(...arr);
      }
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      const arr = await SpecialService.find({
        $and: [{ churchId: req.session.churchId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      });
      special_services.push(...arr);
    }

    const gck = [];
    const homeCaringFellowship = [];
    const seminarArray = [];

    for (service of special_services) {
      if (service.category === "GCK") {
        gck.push(service)
      }
      else if (service.category === "Home Caring Fellowship") {
        homeCaringFellowship.push(service)
      }
      else if (service.category === "Seminar") {
        seminarArray.push(service)
      }
    }

    function groupAndSumByDate(entries) {
      const grouped = {};

      for (const entry of entries) {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];

        if (!grouped[dateStr]) {
          grouped[dateStr] = {
            date: new Date(dateStr),
            adults: 0,
            youths: 0,
            children: 0
          };
        }

        grouped[dateStr].adults += entry.adults || 0;
        grouped[dateStr].youths += entry.youths || 0;
        grouped[dateStr].children += entry.children || 0;
      }

      return Object.values(grouped);
    }

    const gckArray = groupAndSumByDate(gck);
    const homeCaringFellowshipArray = groupAndSumByDate(homeCaringFellowship);

    return { sundaysOfferingArray, mondaysOfferingArray, thursdaysOfferingArray, gckArray, homeCaringFellowshipArray, seminarArray };
  }
  const {
    sundaysOfferingArray,
    mondaysOfferingArray,
    thursdaysOfferingArray,
    gckArray,
    homeCaringFellowshipArray,
    seminarArray } = await generate(req.session.attendancedetails);

  // Convert image to base64
  const imagePath = './public/images/logo3b.png';
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataURI = `data:image/png;base64,${base64Image}`;

  let html = ''

  html += `
          <style>
    @media print {
      body::before {
        content: "";
        position: fixed;
        top: 50%;
        left: 50%;
        width: 1000px;
        height: 1000px;
        background-image: url(${dataURI});
        background-repeat: no-repeat;
        background-position: center;
        background-size: 2500px;
        transform: translate(-50%, -50%);
        opacity: 0.15;
        z-index: -1;
      }
    }

    body {
      position: relative;
      margin: 0;
      padding: 2cm;
      font-family: Arial, sans-serif;
    }
  </style>
  <body>`;


  let church_name_title = '';
  let group_name = '';

  if (req.session.churchAttendance) {
    church_name_title = `${req.session.churchName} Church`
    group_name = `${req.session.groupName} Group`
  } else if (req.session.groupAttendance) {
    church_name_title = `${req.session.groupName} Group`
  }

  html += `
      <div style="text-align: center;">
        <h2>Monthly Attendance Report</h2>
        <h3>${church_name_title}</h3>
      </div >
      <div>
        <h4 class=" mb-1">MONTH: ${req.session.date}</h4>
        <h4 class=" mb-1">Group : ${group_name}</h4>
      </div>`;

  html += `
    <div style="page-break-inside: avoid; margin-bottom: 40px;">
      <div>
        <h3 style="text-align: center;">Sunday Worship Service</h3>
      </div >
      <table width="100%" border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr class="text-center">
            <th rowspan="2"></th>
            <th colspan="3">ADULTS</th>
            <th colspan="3">YOUTHS</th>
            <th colspan="3">CHILDREN</th>
            <th colspan="3">NEW COMERS</th>
            <th rowspan="2">TOTAL</th>
            <th colspan="3">OFFERING</th>
          </tr>
          <tr class="text-center">
            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>1st</th>
            <th>2nd</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>`;

  let sunday_week = 1;
  let total_adultmale = 0;
  let total_adultfemale = 0;
  let total_adults = 0;
  let total_youthmale = 0;
  let total_youthfemale = 0;
  let total_youths = 0;
  let total_childrenmale = 0;
  let total_childrenfemale = 0;
  let total_children = 0;
  let total_newcomersmales = 0;
  let total_newcomersfemales = 0;
  let total_newcomers = 0;
  let total_firstoffering = 0;
  let total_secondoffering = 0;
  let total_offering = 0;

  for (attendance of sundaysOfferingArray) {
    html += `
    <tr style="text-align: center;">
    <td>Week ${sunday_week}</td>`;

    if (attendance.attendanceId.reason) {
      html += `
      <td colspan="16" class=" text-muted"><b>${attendance.attendanceId.reason}</b></td>`;
    } else {
      html += `
      <td>${attendance.attendanceId.adultmale}</td>
      <td>${attendance.attendanceId.adultfemale}</td>
      <td>${attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale}</td>
      <td>${attendance.attendanceId.youthmale}</td>
      <td>${attendance.attendanceId.youthfemale}</td>
      <td>${attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale}</td>
      <td>${attendance.attendanceId.childrenmale}</td>
      <td>${attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.attendanceId.newcomersmales}</td>
      <td>${attendance.attendanceId.newcomersfemales}</td>
      <td>${attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales}</td>
      <td>${attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale +
        attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale +
        attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.firstoffering}</td>
      <td>${attendance.secondoffering}</td>
      <td>${attendance.firstoffering + attendance.secondoffering}</td>
      </tr>`;

      total_adultmale += attendance.attendanceId.adultmale;
      total_adultfemale += attendance.attendanceId.adultfemale;
      total_adults += attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale;
      total_youthmale += attendance.attendanceId.youthmale;
      total_youthfemale += attendance.attendanceId.youthfemale;
      total_youths += attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale;
      total_childrenmale += attendance.attendanceId.childrenmale;
      total_childrenfemale += attendance.attendanceId.childrenfemale;
      total_children += attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale;
      total_newcomersmales += attendance.attendanceId.newcomersmales;
      total_newcomersfemales += attendance.attendanceId.newcomersfemales;
      total_newcomers += attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales;
      total_firstoffering += attendance.firstoffering;
      total_secondoffering += attendance.secondoffering;
      total_offering += attendance.firstoffering + attendance.secondoffering;
    };
    sunday_week++;
  };

  html += `
  <tr style="text-align: center;">
    <td>Total</td>
    <td>${total_adultmale}</td>
    <td>${total_adultfemale}</td>
    <td>${total_adults}</td>
    <td>${total_youthmale}</td>
    <td>${total_youthfemale}</td>
    <td>${total_youths}</td>
    <td>${total_childrenmale}</td>
    <td>${total_childrenfemale}</td>
    <td>${total_children}</td>
    <td>${total_newcomersmales}</td>
    <td>${total_newcomersfemales}</td>
    <td>${total_newcomers}</td>
    <td>${total_adults + total_youths + total_children}</td>
    <td>${total_firstoffering}</td>
    <td>${total_secondoffering}</td>
    <td>${total_offering}</td>
  </tr>
  </tbody >
  </table >
  </div>`;



  html += `
    <div style="page-break-inside: avoid; margin-bottom: 40px;">
      <div>
        <h3 style="text-align: center;">Monday Bible Studies</h3>
      </div >
      <table width="100%" border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr class="text-center">
            <th rowspan="2"></th>
            <th colspan="3">ADULTS</th>
            <th colspan="3">YOUTHS</th>
            <th colspan="3">CHILDREN</th>
            <th colspan="3">NEW COMERS</th>
            <th rowspan="2">TOTAL</th>
            <th colspan="3">OFFERING</th>
          </tr>
          <tr class="text-center">
            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>1st</th>
            <th>2nd</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>`;

  let monday_week = 1;
  let total_adultmale1 = 0;
  let total_adultfemale1 = 0;
  let total_adults1 = 0;
  let total_youthmale1 = 0;
  let total_youthfemale1 = 0;
  let total_youths1 = 0;
  let total_childrenmale1 = 0;
  let total_childrenfemale1 = 0;
  let total_children1 = 0;
  let total_newcomersmales1 = 0;
  let total_newcomersfemales1 = 0;
  let total_newcomers1 = 0;
  let total_firstoffering1 = 0;
  let total_secondoffering1 = 0;
  let total_offering1 = 0;

  for (attendance of mondaysOfferingArray) {
    html += `
    <tr style="text-align: center;">
    <td>Week ${monday_week}</td>`;

    if (attendance.attendanceId.reason) {
      html += `
      <td colspan="16" class=" text-muted"><b>${attendance.attendanceId.reason}</b></td>`;
    } else {
      html += `
      <td>${attendance.attendanceId.adultmale}</td>
      <td>${attendance.attendanceId.adultfemale}</td>
      <td>${attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale}</td>
      <td>${attendance.attendanceId.youthmale}</td>
      <td>${attendance.attendanceId.youthfemale}</td>
      <td>${attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale}</td>
      <td>${attendance.attendanceId.childrenmale}</td>
      <td>${attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.attendanceId.newcomersmales}</td>
      <td>${attendance.attendanceId.newcomersfemales}</td>
      <td>${attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales}</td>
      <td>${attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale +
        attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale +
        attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.firstoffering}</td>
      <td>${attendance.secondoffering}</td>
      <td>${attendance.firstoffering + attendance.secondoffering}</td>
      </tr>`;

      total_adultmale1 += attendance.attendanceId.adultmale;
      total_adultfemale1 += attendance.attendanceId.adultfemale;
      total_adults1 += attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale;
      total_youthmale1 += attendance.attendanceId.youthmale;
      total_youthfemale1 += attendance.attendanceId.youthfemale;
      total_youths1 += attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale;
      total_childrenmale1 += attendance.attendanceId.childrenmale;
      total_childrenfemale1 += attendance.attendanceId.childrenfemale;
      total_children1 += attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale;
      total_newcomersmales1 += attendance.attendanceId.newcomersmales;
      total_newcomersfemales1 += attendance.attendanceId.newcomersfemales;
      total_newcomers1 += attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales;
      total_firstoffering1 += attendance.firstoffering;
      total_secondoffering1 += attendance.secondoffering;
      total_offering1 += attendance.firstoffering + attendance.secondoffering;
    };
    monday_week++;
  };

  html += `
  <tr style="text-align: center;">
    <td>Total</td>
    <td>${total_adultmale1}</td>
    <td>${total_adultfemale1}</td>
    <td>${total_adults1}</td>
    <td>${total_youthmale1}</td>
    <td>${total_youthfemale1}</td>
    <td>${total_youths1}</td>
    <td>${total_childrenmale1}</td>
    <td>${total_childrenfemale1}</td>
    <td>${total_children1}</td>
    <td>${total_newcomersmales1}</td>
    <td>${total_newcomersfemales1}</td>
    <td>${total_newcomers1}</td>
    <td>${total_adults1 + total_youths1 + total_children1}</td>
    <td>${total_firstoffering1}</td>
    <td>${total_secondoffering1}</td>
    <td>${total_offering1}</td>
  </tr>
  </tbody >
  </table >
  </div>`;




  html += `
    <div style="page-break-inside: avoid; margin-bottom: 40px;">
      <div>
        <h3 style="text-align: center;">Thursday Revival & Evangelism Training</h3>
      </div >
      <table width="100%" border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr class="text-center">
            <th rowspan="2"></th>
            <th colspan="3">ADULTS</th>
            <th colspan="3">YOUTHS</th>
            <th colspan="3">CHILDREN</th>
            <th colspan="3">NEW COMERS</th>
            <th rowspan="2">TOTAL</th>
            <th colspan="3">OFFERING</th>
          </tr>
          <tr class="text-center">
            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>M</th>
            <th>F</th>
            <th>Total</th>

            <th>1st</th>
            <th>2nd</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>`;

  let thursday_week = 1;
  let total_adultmale2 = 0;
  let total_adultfemale2 = 0;
  let total_adults2 = 0;
  let total_youthmale2 = 0;
  let total_youthfemale2 = 0;
  let total_youths2 = 0;
  let total_childrenmale2 = 0;
  let total_childrenfemale2 = 0;
  let total_children2 = 0;
  let total_newcomersmales2 = 0;
  let total_newcomersfemales2 = 0;
  let total_newcomers2 = 0;
  let total_firstoffering2 = 0;
  let total_secondoffering2 = 0;
  let total_offering2 = 0;

  for (attendance of thursdaysOfferingArray) {
    html += `
    <tr style="text-align: center;">
    <td>Week ${thursday_week}</td>`;

    if (attendance.attendanceId.reason) {
      html += `
      <td colspan="16" class=" text-muted"><b>${attendance.attendanceId.reason}</b></td>`;
    } else {
      html += `
      <td>${attendance.attendanceId.adultmale}</td>
      <td>${attendance.attendanceId.adultfemale}</td>
      <td>${attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale}</td>
      <td>${attendance.attendanceId.youthmale}</td>
      <td>${attendance.attendanceId.youthfemale}</td>
      <td>${attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale}</td>
      <td>${attendance.attendanceId.childrenmale}</td>
      <td>${attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.attendanceId.newcomersmales}</td>
      <td>${attendance.attendanceId.newcomersfemales}</td>
      <td>${attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales}</td>
      <td>${attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale +
        attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale +
        attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale}</td>
      <td>${attendance.firstoffering}</td>
      <td>${attendance.secondoffering}</td>
      <td>${attendance.firstoffering + attendance.secondoffering}</td>
      </tr>`;

      total_adultmale2 += attendance.attendanceId.adultmale;
      total_adultfemale2 += attendance.attendanceId.adultfemale;
      total_adults2 += attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale;
      total_youthmale2 += attendance.attendanceId.youthmale;
      total_youthfemale2 += attendance.attendanceId.youthfemale;
      total_youths2 += attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale;
      total_childrenmale2 += attendance.attendanceId.childrenmale;
      total_childrenfemale2 += attendance.attendanceId.childrenfemale;
      total_children2 += attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale;
      total_newcomersmales2 += attendance.attendanceId.newcomersmales;
      total_newcomersfemales2 += attendance.attendanceId.newcomersfemales;
      total_newcomers2 += attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales;
      total_firstoffering2 += attendance.firstoffering;
      total_secondoffering2 += attendance.secondoffering;
      total_offering2 += attendance.firstoffering + attendance.secondoffering;
    };
    thursday_week++;
  };

  html += `
  <tr style="text-align: center;">
    <td>Total</td>
    <td>${total_adultmale2}</td>
    <td>${total_adultfemale2}</td>
    <td>${total_adults2}</td>
    <td>${total_youthmale2}</td>
    <td>${total_youthfemale2}</td>
    <td>${total_youths2}</td>
    <td>${total_childrenmale2}</td>
    <td>${total_childrenfemale2}</td>
    <td>${total_children2}</td>
    <td>${total_newcomersmales2}</td>
    <td>${total_newcomersfemales2}</td>
    <td>${total_newcomers2}</td>
    <td>${total_adults2 + total_youths2 + total_children2}</td>
    <td>${total_firstoffering2}</td>
    <td>${total_secondoffering2}</td>
    <td>${total_offering2}</td>
  </tr>
  </tbody >
  </table >
  </div>`;



  html += `
      <div style="page-break-inside: avoid; margin-bottom: 40px;">
        <div>
          <h3 style="text-align: center;">GCK</h3>
        </div>
        <table width="100%" border="1" cellpadding="5" cellspacing="0">
          <thead class="table-dark">
            <tr>
              <th>Date</th>
              <th>Adults</th>
              <th>Youths</th>
              <th>Children</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>`;

  let totalAdults = 0
  let totalYouths = 0
  let totalChildren = 0

  for (service of gckArray) {
    totalAdults += service.adults
    totalYouths += service.youths
    totalChildren += service.children

    html += `
            <tr>
              <td>
                ${service.date.toISOString().split('T')[0]}
              </td>
              <td>
                ${service.adults}
              </td>
              <td>
                ${service.youths}
              </td>
              <td>
                ${service.children}
              </td>
              <td>
                ${service.adults + service.youths + service.children}
              </td>
            </tr>`;
  }

  html += `
            <tr>
              <td>Total</td>
              <td>
                ${totalAdults}
              </td>
              <td>
                ${totalYouths}
              </td>
              <td>
                ${totalChildren}
              </td>
              <td>
                ${totalAdults + totalYouths + totalChildren}
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;



  html += `
      <div style="page-break-inside: avoid; margin-bottom: 40px;">
        <div>
          <h3 style="text-align: center;">Home Caring Fellowship</h3>
        </div>
        <table width="100%" border="1" cellpadding="5" cellspacing="0">
          <thead class="table-dark">
            <tr>
              <th>Date</th>
              <th>Adults</th>
              <th>Youths</th>
              <th>Children</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>`;


  let totalAdults1 = 0
  let totalYouths1 = 0
  let totalChildren1 = 0

  for (service of homeCaringFellowshipArray) {
    totalAdults1 += service.adults
    totalYouths1 += service.youths
    totalChildren1 += service.children

    html += `
            <tr>
              <td>
                ${service.date.toISOString().split('T')[0]}
              </td>
              <td>
                ${service.adults}
              </td>
              <td>
                ${service.youths}
              </td>
              <td>
                ${service.children}
              </td>
              <td>
                ${service.adults + service.youths + service.children}
              </td>
            </tr>`;
  }

  html += `
            <tr>
              <td>Total</td>
              <td>
                ${totalAdults1}
              </td>
              <td>
                ${totalYouths1}
              </td>
              <td>
                ${totalChildren1}
              </td>
              <td>
                ${totalAdults1 + totalYouths1 + totalChildren1}
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;


  html += `
      <div style="page-break-inside: avoid; margin-bottom: 40px;">
        <div>
          <h3 style="text-align: center;">Seminars</h3>
        </div>
        <table width="100%" border="1" cellpadding="5" cellspacing="0">
          <thead class="table-dark">
            <tr>
              <th>Date</th>
              <th>Adults</th>
              <th>Youths</th>
              <th>Children</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>`;

  let totalAdults2 = 0
  let totalYouths2 = 0
  let totalChildren2 = 0

  for (service of seminarArray) {
    totalAdults2 += service.adults
    totalYouths2 += service.youths
    totalChildren2 += service.children

    html += `
            <tr>
              <td>
                ${service.date.toISOString().split('T')[0]}
              </td>
              <td>
                ${service.adults}
              </td>
              <td>
                ${service.youths}
              </td>
              <td>
                ${service.children}
              </td>
              <td>
                ${service.adults + service.youths + service.children}
              </td>
            </tr>`;
  }

  html += `
            <tr>
              <td>Total</td>
              <td>
                ${totalAdults2}
              </td>
              <td>
                ${totalYouths2}
              </td>
              <td>
                ${totalChildren2}
              </td>
              <td>
                ${totalAdults2 + totalYouths2 + totalChildren2}
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;

  await convertHTMLToPDF(html, 'report.pdf');
  return res.redirect('/attendance/monthlyreport')
};










const generateattendancereport_general = async (req, res) => {

  const generate = async (arg) => {
    const { startdate, enddate } = arg;

    const offerings = [];
    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      if (!arg.groupId) {
        if (arg.churchId !== 'group') {
          const arr = await Offering.find({
            $and: [{ churchId: arg.churchId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          }).populate('attendanceId');
          offerings.push(...arr);
        } else {
          const arr = await Offering.find({
            $and: [{ groupId: req.session.groupId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          }).populate('attendanceId');
          offerings.push(...arr);
        }
      } else {
        const arr = await Offering.find({
          $and: [{ groupId: arg.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        }).populate('attendanceId');
        offerings.push(...arr);
      }
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      const arr = await Offering.find({
        $and: [{ churchId: req.session.churchId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      }).populate('attendanceId');
      offerings.push(...arr);
    }

    const sundaysOfferingArray = [];
    const mondaysOfferingArray = [];
    const thursdaysOfferingArray = [];

    for (offering of offerings) {
      const date = offering.date;
      const dateStr = new Date(date);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateStr);
      if (dayName == "Sunday") {
        sundaysOfferingArray.push(offering)
      }
      else if (dayName == "Monday") {
        mondaysOfferingArray.push(offering)
      }
      else if (dayName == "Thursday") {
        thursdaysOfferingArray.push(offering)
      }
    }

    const special_services = [];

    if (req.session.status === 'manager' || req.session.status === 'grouppastor' || req.session.status === 'groupadmin') {
      if (!arg.groupId) {
        if (arg.churchId !== 'group') {
          const arr = await SpecialService.find({
            $and: [{ churchId: arg.churchId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          });
          special_services.push(...arr);
        } else {
          const arr = await SpecialService.find({
            $and: [{ groupId: req.session.groupId },
            { date: { $lte: enddate } }, { date: { $gte: startdate } }]
          });
          special_services.push(...arr);
        }
      } else {
        const arr = await SpecialService.find({
          $and: [{ groupId: arg.groupId },
          { date: { $lte: enddate } }, { date: { $gte: startdate } }]
        });
        special_services.push(...arr);
      }
    } else if (req.session.status === 'pastor' || req.session.status === 'admin') {
      const arr = await SpecialService.find({
        $and: [{ churchId: req.session.churchId },
        { date: { $lte: enddate } }, { date: { $gte: startdate } }]
      });
      special_services.push(...arr);
    }

    const gckArray = [];
    const homeCaringFellowshipArray = [];
    const seminarArray = [];

    for (service of special_services) {
      if (service.category === "GCK") {
        gckArray.push(service)
      }
      else if (service.category === "Home Caring Fellowship") {
        homeCaringFellowshipArray.push(service)
      }
      else if (service.category === "Seminar") {
        seminarArray.push(service)
      }
    }

    const [sundayValues, mondayValues, thursdayValues] = await calGeneralAverages(sundaysOfferingArray, mondaysOfferingArray, thursdaysOfferingArray);
    return { sundayValues, mondayValues, thursdayValues, gckArray, homeCaringFellowshipArray, seminarArray };
  }

  const {
    sundayValues,
    mondayValues,
    thursdayValues,
    gckArray,
    homeCaringFellowshipArray,
    seminarArray } = await generate(req.session.attendancedetails);

  // Convert image to base64
  const imagePath = './public/images/logo3b.png';
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataURI = `data:image/png;base64,${base64Image}`;

  let html = ''

  html += `
          <style>
    @media print {
      body::before {
        content: "";
        position: fixed;
        top: 50%;
        left: 50%;
        width: 1000px;
        height: 1000px;
        background-image: url(${dataURI});
        background-repeat: no-repeat;
        background-position: center;
        background-size: 2500px;
        transform: translate(-50%, -50%);
        opacity: 0.15;
        z-index: -1;
      }
    }

    body {
      position: relative;
      margin: 0;
      padding: 2cm;
      font-family: Arial, sans-serif;
    }
  </style>
  <body>`;

  let church_name_title = '';
  let group_name = '';

  if (req.session.churchAttendance) {
    church_name_title = `${req.session.churchName} Church`
    group_name = `${req.session.groupName} Group`
  } else if (req.session.groupAttendance) {
    church_name_title = `${req.session.groupName} Group`
  }

  html += `
          <div style="text-align: center;">
            <h2>Average Attendance Report</h2>
            <h3>${church_name_title}</h3>
          </div >
          <div>
            <h4 class=" mb-1">MONTH: ${req.session.startdate} - ${req.session.enddate}</h4>
            <h4 class=" mb-1">DISTRICT : ${group_name}</h4>
          </div>`;


  html += `
          <div style="page-break-inside: avoid; margin-bottom: 40px;">
            <div>
              <h3 style="text-align: center;">Sunday Worship Service</h3>
            </div >
            <table width="100%" border="1" cellpadding="5" cellspacing="0">
              <thead>
                <tr>
                  <th></th>
                  <th>Males</th>
                  <th>Females</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody style="text-align: center;">
                <tr>
                  <td>Adults</td>
                  <td>
                    ${sundayValues.adultmaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.adultfemaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.adultsTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Youths</td>
                  <td>
                    ${sundayValues.youthmaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.youthfemaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.youthsTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Children</td>
                  <td>
                    ${sundayValues.childrenmaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.childrenfemaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.childrensTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>New Comers</td>
                  <td>
                    ${sundayValues.newcomersmaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.newcomersfemaleAvg || 0}
                  </td>
                  <td>
                    ${sundayValues.newcomerssTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Total Attendance</td>
                  <td>
                    ${(sundayValues.adultmaleAvg || 0) + (sundayValues.youthmaleAvg || 0) +
    (sundayValues.childrenmaleAvg || 0)}
                  </td>
                  <td>
                    ${(sundayValues.adultfemaleAvg || 0) + (sundayValues.youthfemaleAvg || 0) +
    (sundayValues.childrenfemaleAvg || 0)}
                  </td>
                  <td>
                    ${(sundayValues.adultsTotalAvg || 0) + (sundayValues.youthsTotalAvg || 0) +
    (sundayValues.childrensTotalAvg || 0)}
                  </td>
                </tr>
                <tr>
                  <th colspan="4" class="text-center">
                    Offering Details
                  </th>
                </tr>
                <tr>
                  <td>1st Offering</td>
                  <td colspan="3">GH₵${sundayValues.firstOfferingAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>2nd Offering</td>
                  <td colspan="3">GH₵${sundayValues.secondOfferingAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td><strong>Total Offering</strong></td>
                  <td colspan="3"><strong>GH₵${sundayValues.totalOfferingAvg || 0}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>`;


  html += `
          <div style="page-break-inside: avoid; margin-bottom: 40px;">
            <div>
              <h3 style="text-align: center;">Monday Bible Studies</h3>
            </div>
            <table width="100%" border="1" cellpadding="5" cellspacing="0">
              <thead>
                <tr>
                  <th></th>
                  <th>Males</th>
                  <th>Females</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody style="text-align: center;">
                <tr>
                  <td>Adults</td>
                  <td>
                    ${mondayValues.adultmaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.adultfemaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.adultsTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Youths</td>
                  <td>
                    ${mondayValues.youthmaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.youthfemaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.youthsTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Children</td>
                  <td>
                    ${mondayValues.childrenmaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.childrenfemaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.childrensTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>New Comers</td>
                  <td>
                    ${mondayValues.newcomersmaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.newcomersfemaleAvg || 0}
                  </td>
                  <td>
                    ${mondayValues.newcomerssTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Total Attendance</td>
                  <td>
                    ${(mondayValues.adultmaleAvg || 0) + (mondayValues.youthmaleAvg || 0) +
    (mondayValues.childrenmaleAvg || 0)}
                  </td>
                  <td>
                    ${(mondayValues.adultfemaleAvg || 0) + (mondayValues.youthfemaleAvg || 0) +
    (mondayValues.childrenfemaleAvg || 0)}
                  </td>
                  <td>
                    ${(mondayValues.adultsTotalAvg || 0) + (mondayValues.youthsTotalAvg || 0) +
    (mondayValues.childrensTotalAvg || 0)}
                  </td>
                </tr>
                <tr>
                  <th colspan="4" class="text-center">
                    Offering Details
                  </th>
                </tr>
                <tr>
                  <td>1st Offering</td>
                  <td colspan="3">GH₵${mondayValues.firstOfferingAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>2nd Offering</td>
                  <td colspan="3">GH₵${mondayValues.secondOfferingAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td><strong>Total Offering</strong></td>
                  <td colspan="3"><strong>GH₵${mondayValues.totalOfferingAvg || 0}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>`;


  html += `
          <div style="page-break-inside: avoid; margin-bottom: 40px;">
            <div>
              <h3 style="text-align: center;">Thursday Revival & Evangelism Training</h3>
            </div>
            <table width="100%" border="1" cellpadding="5" cellspacing="0">
              <thead>
                <tr>
                  <th></th>
                  <th>Males</th>
                  <th>Females</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody style="text-align: center;">
                <tr>
                  <td>Adults</td>
                  <td>
                    ${thursdayValues.adultmaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.adultfemaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.adultsTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Youths</td>
                  <td>
                    ${thursdayValues.youthmaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.youthfemaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.youthsTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Children</td>
                  <td>
                    ${thursdayValues.childrenmaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.childrenfemaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.childrensTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>New Comers</td>
                  <td>
                    ${thursdayValues.newcomersmaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.newcomersfemaleAvg || 0}
                  </td>
                  <td>
                    ${thursdayValues.newcomerssTotalAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>Total Attendance</td>
                  <td>
                    ${(thursdayValues.adultmaleAvg || 0) + (thursdayValues.youthmaleAvg || 0) +
    (thursdayValues.childrenmaleAvg || 0)}
                  </td>
                  <td>
                    ${(thursdayValues.adultfemaleAvg || 0) + (thursdayValues.youthfemaleAvg || 0) +
    (thursdayValues.childrenfemaleAvg || 0)}
                  </td>
                  <td>
                    ${(thursdayValues.adultsTotalAvg || 0) + (thursdayValues.youthsTotalAvg || 0) +
    (thursdayValues.childrensTotalAvg || 0)}
                  </td>
                </tr>
                <tr>
                  <th colspan="4" class="text-center">
                    Offering Details
                  </th>
                </tr>
                <tr>
                  <td>1st Offering</td>
                  <td colspan="3">GH₵${thursdayValues.firstOfferingAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td>2nd Offering</td>
                  <td colspan="3">GH₵${thursdayValues.secondOfferingAvg || 0}
                  </td>
                </tr>
                <tr>
                  <td><strong>Total Offering</strong></td>
                  <td colspan="3"><strong>GH₵${thursdayValues.totalOfferingAvg || 0}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>`;


  html += `
          <div style="page-break-inside: avoid; margin-bottom: 40px;">
            <div>
              <h3 style="text-align: center;">GCK</h3>
            </div>
            <table width="100%" border="1" cellpadding="5" cellspacing="0">
              <thead class="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Adults</th>
                  <th>Youths</th>
                  <th>Children</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>`;

  let totalAdults = 0
  let totalYouths = 0
  let totalChildren = 0

  for (service of gckArray) {
    totalAdults += service.adults
    totalYouths += service.youths
    totalChildren += service.children

    html += `
                <tr>
                  <td>
                    ${service.date.toISOString().split('T')[0]}
                  </td>
                  <td>
                    ${service.adults}
                  </td>
                  <td>
                    ${service.youths}
                  </td>
                  <td>
                    ${service.children}
                  </td>
                  <td>
                    ${service.adults + service.youths + service.children}
                  </td>
                </tr>`;
  }

  html += `
                <tr>
                  <td>Total</td>
                  <td>
                    ${totalAdults}
                  </td>
                  <td>
                    ${totalYouths}
                  </td>
                  <td>
                    ${totalChildren}
                  </td>
                  <td>
                    ${totalAdults + totalYouths + totalChildren}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>`;



  html += `
          <div style="page-break-inside: avoid; margin-bottom: 40px;">
            <div>
              <h3 style="text-align: center;">Home Caring Fellowship</h3>
            </div>
            <table width="100%" border="1" cellpadding="5" cellspacing="0">
              <thead class="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Adults</th>
                  <th>Youths</th>
                  <th>Children</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>`;


  let totalAdults1 = 0
  let totalYouths1 = 0
  let totalChildren1 = 0

  for (service of homeCaringFellowshipArray) {
    totalAdults1 += service.adults
    totalYouths1 += service.youths
    totalChildren1 += service.children

    html += `
                <tr>
                  <td>
                    ${service.date.toISOString().split('T')[0]}
                  </td>
                  <td>
                    ${service.adults}
                  </td>
                  <td>
                    ${service.youths}
                  </td>
                  <td>
                    ${service.children}
                  </td>
                  <td>
                    ${service.adults + service.youths + service.children}
                  </td>
                </tr>`;
  }

  html += `
                <tr>
                  <td>Total</td>
                  <td>
                    ${totalAdults1}
                  </td>
                  <td>
                    ${totalYouths1}
                  </td>
                  <td>
                    ${totalChildren1}
                  </td>
                  <td>
                    ${totalAdults1 + totalYouths1 + totalChildren1}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>`;


  html += `
          <div style="page-break-inside: avoid; margin-bottom: 40px;">
            <div>
              <h3 style="text-align: center;">Seminars</h3>
            </div>
            <table width="100%" border="1" cellpadding="5" cellspacing="0">
              <thead class="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Adults</th>
                  <th>Youths</th>
                  <th>Children</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>`;

  let totalAdults2 = 0
  let totalYouths2 = 0
  let totalChildren2 = 0

  for (service of seminarArray) {
    totalAdults2 += service.adults
    totalYouths2 += service.youths
    totalChildren2 += service.children

    html += `
                <tr>
                  <td>
                    ${service.date.toISOString().split('T')[0]}
                  </td>
                  <td>
                    ${service.adults}
                  </td>
                  <td>
                    ${service.youths}
                  </td>
                  <td>
                    ${service.children}
                  </td>
                  <td>
                    ${service.adults + service.youths + service.children}
                  </td>
                </tr>`;
  }

  html += `
                <tr>
                  <td>Total</td>
                  <td>
                    ${totalAdults2}
                  </td>
                  <td>
                    ${totalYouths2}
                  </td>
                  <td>
                    ${totalChildren2}
                  </td>
                  <td>
                    ${totalAdults2 + totalYouths2 + totalChildren2}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>`;

  await convertHTMLToPDF(html, 'report.pdf');
  return res.redirect('/attendance/report')
};





module.exports = {
  checkDate,
  getDates,
  saveattendanceandoffering,
  showcalendar,
  updatepage,
  update,
  deleteattendance,
  searchattendance,
  attendancereport_monthly,
  attendancereport_general,
  generateattendancereport_monthly,
  generateattendancereport_general,
  generateMonthlyPage,
  generateReportPage,
  addAttendancePage,
  readAttendance,
  setChurchId,
  showSpecialServicePage,
  saveSpecialService,
  SpecialServiceTable,
  EditSpecialServicePage,
  updatespecialservice,
  deletespecialservice
};