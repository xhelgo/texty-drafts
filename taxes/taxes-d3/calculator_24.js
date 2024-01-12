const LIMITS = {
    1: 1185700,
    2: 5921400,
    3: 8285700,
    "pdfo": null,
    "diia": 10079040
};

const PDFO_YEDYNY_SUMS = {
    1: 292,
    2: 1420,
    3: null,
    "pdfo": null,
    "diia": null
};

const PDFO_YEDYNY_RATES = {
    1: null,
    2: null,
    3: 0.05,
    "pdfo": 0.18,
    "diia": 0.05
};

const YESV_MIN = 1562;
const YESV_MAX = 23430;
const YESV_RATE = 0.22;
const VIYSKOVYY_RATE = 0.015;

export default function taxesCalculator(income, taxationSystem, robotodavets = 0) {
    // let limit = LIMITS[taxationSystem];
    let pdfoYedynyySum = PDFO_YEDYNY_SUMS[taxationSystem];
    let pdfoYedynyyRate = PDFO_YEDYNY_RATES[taxationSystem];
    if (taxationSystem === "pdfo") {
        robotodavets = 1;
    }

    // if (limit && income * 12 >= limit) {
    //     return 0;
    // }

    let yesvSum;
    let viyskovyySum;

    if (taxationSystem === "pdfo" || taxationSystem === "diia") {
        if (taxationSystem === "diia") {
            yesvSum = YESV_MIN;
        } else {
            yesvSum = Math.min(Math.max(income - (income / (1 + YESV_RATE)), YESV_MIN), YESV_MAX);
            income = income - yesvSum;
        }
        viyskovyySum = income * VIYSKOVYY_RATE;
    } else {
        yesvSum = YESV_MIN;
        viyskovyySum = 0;
    }
    
    if (pdfoYedynyyRate) {
        pdfoYedynyySum = income * pdfoYedynyyRate;
    }

    let vytratyRobotodavtsya = income + robotodavets * yesvSum;
    let naRuky = income - pdfoYedynyySum - viyskovyySum - (1 - robotodavets) * yesvSum;

    
    let rate_result = 1 - naRuky / vytratyRobotodavtsya;
    let sum_result = income - naRuky + (robotodavets * yesvSum);

    return {
        rate: rate_result,
        sum: sum_result
    };

}