async function calGeneralAverages(sundaysArray, mondaysArray, thursdaysArray) {

    const sundayValues = [];
    const mondayValues = [];
    const thursdayValues = [];

    let avgDivisor = 0;

    let adultmale = 0;
    let adultfemale = 0;
    let adultsTotal = 0;

    let youthmale = 0;
    let youthfemale = 0;
    let youthsTotal = 0;

    let childrenmale = 0;
    let childrenfemale = 0;
    let childrensTotal = 0;

    let newcomersmale = 0;
    let newcomersfemale = 0;
    let newcomerssTotal = 0;

    let firstOffering = 0;
    let secondOffering = 0;
    let totalOffering = 0;


    for (attendance of sundaysArray) {
        if (!attendance.attendanceId.reason || attendance.attendanceId.reason === '') {
            adultmale += attendance.attendanceId.adultmale;
            adultfemale += attendance.attendanceId.adultfemale;
            adultsTotal += attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale;

            youthmale += attendance.attendanceId.youthmale;
            youthfemale += attendance.attendanceId.youthfemale;
            youthsTotal += attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale;

            childrenmale += attendance.attendanceId.childrenmale;
            childrenfemale += attendance.attendanceId.childrenfemale;
            childrensTotal += attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale;

            newcomersmale += attendance.attendanceId.newcomersmales;
            newcomersfemale += attendance.attendanceId.newcomersfemales;
            newcomerssTotal += attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales;

            firstOffering += attendance.firstoffering;
            secondOffering += attendance.secondoffering;
            totalOffering += attendance.firstoffering + attendance.secondoffering;

            avgDivisor++;
        }

    }
    sundayValues.push(
        {
            adultmaleAvg: Math.round(adultmale / avgDivisor), adultfemaleAvg: Math.round(adultfemale / avgDivisor), adultsTotalAvg: Math.round(adultsTotal / avgDivisor),
            youthmaleAvg: Math.round(youthmale / avgDivisor), youthfemaleAvg: Math.round(youthfemale / avgDivisor), youthsTotalAvg: Math.round(youthsTotal / avgDivisor),
            childrenmaleAvg: Math.round(childrenmale / avgDivisor), childrenfemaleAvg: Math.round(childrenfemale / avgDivisor), childrensTotalAvg: Math.round(childrensTotal / avgDivisor),
            newcomersmaleAvg: Math.round(newcomersmale / avgDivisor), newcomersfemaleAvg: Math.round(newcomersfemale / avgDivisor), newcomerssTotalAvg: Math.round(newcomerssTotal / avgDivisor),
            totalAvg: Math.round((adultsTotal + youthsTotal + childrensTotal + newcomerssTotal) / avgDivisor), firstOfferingAvg: Math.round(firstOffering / avgDivisor),
            secondOfferingAvg: Math.round(secondOffering / avgDivisor), totalOfferingAvg: Math.round(totalOffering / avgDivisor)
        }
    );
    avgDivisor = 0;
    adultmale = 0;
    adultfemale = 0;
    adultsTotal = 0;

    youthmale = 0;
    youthfemale = 0;
    youthsTotal = 0;

    childrenmale = 0;
    childrenfemale = 0;
    childrensTotal = 0;

    newcomersmale = 0;
    newcomersfemale = 0;
    newcomerssTotal = 0;

    firstOffering = 0;
    secondOffering = 0;
    totalOffering = 0;



    for (attendance of mondaysArray) {
        if (!attendance.attendanceId.reason || attendance.attendanceId.reason === '') {
            adultmale += attendance.attendanceId.adultmale;
            adultfemale += attendance.attendanceId.adultfemale;
            adultsTotal += attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale;

            youthmale += attendance.attendanceId.youthmale;
            youthfemale += attendance.attendanceId.youthfemale;
            youthsTotal += attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale;

            childrenmale += attendance.attendanceId.childrenmale;
            childrenfemale += attendance.attendanceId.childrenfemale;
            childrensTotal += attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale;

            newcomersmale += attendance.attendanceId.newcomersmales;
            newcomersfemale += attendance.attendanceId.newcomersfemales;
            newcomerssTotal += attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales;

            firstOffering += attendance.attendanceId.firstoffering;
            secondOffering += attendance.attendanceId.secondoffering;
            totalOffering += attendance.attendanceId.firstoffering + attendance.attendanceId.secondoffering;

            avgDivisor++;
        }

    }
    mondayValues.push(
        {
            adultmaleAvg: Math.round(adultmale / avgDivisor), adultfemaleAvg: Math.round(adultfemale / avgDivisor), adultsTotalAvg: Math.round(adultsTotal / avgDivisor),
            youthmaleAvg: Math.round(youthmale / avgDivisor), youthfemaleAvg: Math.round(youthfemale / avgDivisor), youthsTotalAvg: Math.round(youthsTotal / avgDivisor),
            childrenmaleAvg: Math.round(childrenmale / avgDivisor), childrenfemaleAvg: Math.round(childrenfemale / avgDivisor), childrensTotalAvg: Math.round(childrensTotal / avgDivisor),
            newcomersmaleAvg: Math.round(newcomersmale / avgDivisor), newcomersfemaleAvg: Math.round(newcomersfemale / avgDivisor), newcomerssTotalAvg: Math.round(newcomerssTotal / avgDivisor),
            totalAvg: Math.round((adultsTotal + youthsTotal + childrensTotal + newcomerssTotal) / avgDivisor), firstOfferingAvg: Math.round(firstOffering / avgDivisor),
            secondOfferingAvg: Math.round(secondOffering / avgDivisor), totalOfferingAvg: Math.round(totalOffering / avgDivisor)
        }
    );
    avgDivisor = 0;
    adultmale = 0;
    adultfemale = 0;
    adultsTotal = 0;

    youthmale = 0;
    youthfemale = 0;
    youthsTotal = 0;

    childrenmale = 0;
    childrenfemale = 0;
    childrensTotal = 0;

    newcomersmale = 0;
    newcomersfemale = 0;
    newcomerssTotal = 0;

    firstOffering = 0;
    secondOffering = 0;
    totalOffering = 0;


    for (attendance of thursdaysArray) {
        if (!attendance.attendanceId.reason || attendance.attendanceId.reason === '') {
            adultmale += attendance.attendanceId.adultmale;
            adultfemale += attendance.attendanceId.adultfemale;
            adultsTotal += attendance.attendanceId.adultmale + attendance.attendanceId.adultfemale;

            youthmale += attendance.attendanceId.youthmale;
            youthfemale += attendance.attendanceId.youthfemale;
            youthsTotal += attendance.attendanceId.youthmale + attendance.attendanceId.youthfemale;

            childrenmale += attendance.attendanceId.childrenmale;
            childrenfemale += attendance.attendanceId.childrenfemale;
            childrensTotal += attendance.attendanceId.childrenmale + attendance.attendanceId.childrenfemale;

            newcomersmale += attendance.attendanceId.newcomersmales;
            newcomersfemale += attendance.attendanceId.newcomersfemales;
            newcomerssTotal += attendance.attendanceId.newcomersmales + attendance.attendanceId.newcomersfemales;

            firstOffering += attendance.firstoffering;
            secondOffering += attendance.secondoffering;
            totalOffering += attendance.firstoffering + attendance.secondoffering;

            avgDivisor++;
        }

    }
    thursdayValues.push(
        {
            adultmaleAvg: Math.round(adultmale / avgDivisor), adultfemaleAvg: Math.round(adultfemale / avgDivisor), adultsTotalAvg: Math.round(adultsTotal / avgDivisor),
            youthmaleAvg: Math.round(youthmale / avgDivisor), youthfemaleAvg: Math.round(youthfemale / avgDivisor), youthsTotalAvg: Math.round(youthsTotal / avgDivisor),
            childrenmaleAvg: Math.round(childrenmale / avgDivisor), childrenfemaleAvg: Math.round(childrenfemale / avgDivisor), childrensTotalAvg: Math.round(childrensTotal / avgDivisor),
            newcomersmaleAvg: Math.round(newcomersmale / avgDivisor), newcomersfemaleAvg: Math.round(newcomersfemale / avgDivisor), newcomerssTotalAvg: Math.round(newcomerssTotal / avgDivisor),
            totalAvg: Math.round((adultsTotal + youthsTotal + childrensTotal + newcomerssTotal) / avgDivisor), firstOfferingAvg: Math.round(firstOffering / avgDivisor),
            secondOfferingAvg: Math.round(secondOffering / avgDivisor), totalOfferingAvg: Math.round(totalOffering / avgDivisor)
        }
    );

    return [...sundayValues, ...mondayValues, ...thursdayValues];
};







function calculateMonthlyAttendanceTotals(attendanceArray) {
    const adults = new Array(12).fill(0);
    const youths = new Array(12).fill(0);
    const children = new Array(12).fill(0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (const record of attendanceArray) {
        const date = new Date(record.date);
        const yearDiff = date.getFullYear() - currentYear;
        const monthDiff = date.getMonth() - currentMonth;

        // Index will be 0 for 12 months ago, 11 for current month
        const index = 11 + (yearDiff * 12 + monthDiff);

        if (index >= 0 && index < 12) {
            adults[index] += (record.adultmale || 0) + (record.adultfemale || 0);
            youths[index] += (record.youthmale || 0) + (record.youthfemale || 0);
            children[index] += (record.childrenmale || 0) + (record.childrenfemale || 0);
        }
    }

    return { adults, youths, children };
}


function calculateMonthlyOfferingTotals(offeringsArray) {
  const firstOffering = new Array(12).fill(0);
  const secondOffering = new Array(12).fill(0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  for (const record of offeringsArray) {
    const date = new Date(record.date);
    const yearDiff = date.getFullYear() - currentYear;
    const monthDiff = date.getMonth() - currentMonth;

    // Index: 0 = 12 months ago, 11 = current month
    const index = 11 + (yearDiff * 12 + monthDiff);

    if (index >= 0 && index < 12) {
      firstOffering[index] += record.firstoffering || 0;
      secondOffering[index] += record.secondoffering || 0;
    }
  }

  return {
    firstOffering,
    secondOffering
  };
}




 function getPast12MonthLabels() {
    const labels = [];
    const base = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
        labels.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    return labels;
}


module.exports = {calGeneralAverages, 
    calculateMonthlyAttendanceTotals, 
    getPast12MonthLabels, 
    calculateMonthlyOfferingTotals}

