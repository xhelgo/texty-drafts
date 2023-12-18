const LIMITS = {
    1: 1118900,
    2: 5587800,
    3: 7818900,
    "pdfo": null,
    "diia": 9348240
};

const PDFO_YEDYNY_SUMS = {
    1: 268,
    2: 1340,
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

const YESV_MIN = 1474;
const YESV_MAX = 22110;
const YESV_RATE = 0.22;
const VIYSKOVYY_RATE = 0.015;

export default function taxesCalculator(income, taxationSystem, robotodavets = 0) {
    let limit = LIMITS[taxationSystem];
    let pdfoYedynyySum = PDFO_YEDYNY_SUMS[taxationSystem];
    let pdfoYedynyyRate = PDFO_YEDYNY_RATES[taxationSystem];
    if (taxationSystem === "pdfo") {
        robotodavets = 1;
    }

    // if (limit && income * 12 >= limit) {
    //     return 0;
    // }

    if (pdfoYedynyyRate) {
        pdfoYedynyySum = income * pdfoYedynyyRate;
    }

    let yesvSum;
    let viyskovyySum;
    if (taxationSystem === "pdfo" || taxationSystem === "diia") {
        if (taxationSystem === "diia") {
            yesvSum = YESV_MIN;
        } else {
            yesvSum = Math.min(Math.max(income * YESV_RATE, YESV_MIN), YESV_MAX);
        }
        viyskovyySum = income * VIYSKOVYY_RATE;
    } else {
        yesvSum = YESV_MIN;
        viyskovyySum = 0;
    }

    let vytratyRobotodavtsya = income + robotodavets * yesvSum;
    let naRuky = income - pdfoYedynyySum - viyskovyySum - (1 - robotodavets) * yesvSum;

    
    let rate_result = 1 - naRuky / vytratyRobotodavtsya;
    let sum_result = income - naRuky;

    return {
        rate: rate_result,
        sum: sum_result
    };

}