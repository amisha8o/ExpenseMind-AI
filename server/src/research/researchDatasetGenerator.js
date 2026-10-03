import fs from "fs";
import path from "path";

const SEED = 20260926;

const DAYS = 90;
const TARGET_EXPENSES = 200;
const TARGET_INCOME = 20;

// Reproducible pseudo-random generator
function createRandom(seed) {
    let value = seed;

    return function random() {
        value = (value * 1664525 + 1013904223) % 4294967296;
        return value / 4294967296;
    };
}

const random = createRandom(SEED);

function randomBetween(min, max) {
    return min + random() * (max - min);
}

function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
}

function round(value) {
    return Math.round(value * 100) / 100;
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

const categories = {
    Food: {
        min: 100,
        max: 700,
        probability: 0.20
    },

    Groceries: {
        min: 300,
        max: 1500,
        probability: 0.14
    },

    Transport: {
        min: 50,
        max: 500,
        probability: 0.12
    },

    Shopping: {
        min: 300,
        max: 3000,
        probability: 0.10
    },

    Entertainment: {
        min: 150,
        max: 1200,
        probability: 0.08
    },

    Bills: {
        min: 500,
        max: 3000,
        probability: 0.08
    },

    Healthcare: {
        min: 200,
        max: 2500,
        probability: 0.06
    },

    Education: {
        min: 300,
        max: 2500,
        probability: 0.05
    },

    Travel: {
        min: 1000,
        max: 6000,
        probability: 0.04
    },

    Utilities: {
        min: 300,
        max: 1800,
        probability: 0.08,

    },

    Other: {
        min: 100,
        max: 1500,
        probability: 0.05
    }
};

function selectCategory() {
    const value = random();

    let cumulative = 0;

    for (const [category, config] of Object.entries(categories)) {
        cumulative += config.probability;

        if (value <= cumulative) {
            return category;
        }
    }

    return "Other";
}

function generateNormalAmount(category) {
    const config = categories[category];

    return round(
        randomBetween(config.min, config.max)
    );
}

function generateExpenseDate(startDate, dayOffset) {
    const date = new Date(startDate);

    date.setDate(
        date.getDate() + dayOffset
    );

    return date;
}

function createNormalExpense(
    id,
    startDate,
    dayOffset
) {
    const category = selectCategory();

    let amount = generateNormalAmount(category);

    /*
     * Add some realistic recurring spending.
     */
    if (category === "Food" && dayOffset % 7 === 0) {
        amount = round(randomBetween(250, 600));
    }

    if (
        category === "Bills" &&
        dayOffset % 30 === 5
    ) {
        amount = round(randomBetween(1200, 2500));
    }

    if (
        category === "Utilities" &&
        dayOffset % 30 === 12
    ) {
        amount = round(randomBetween(700, 1800));
    }

    return {
        transactionId: `EXP${String(id).padStart(4, "0")}`,
        type: "expense",
        amount,
        category,
        date: formatDate(
            generateExpenseDate(
                startDate,
                dayOffset
            )
        ),
        paymentMethod: [
            "Cash",
            "UPI",
            "Card",
            "Net Banking",
            "Wallet"
        ][randomInt(0, 4)],
        merchant: `${category} Merchant`,
        actualAnomaly: 0,
        anomalyType: "none"
    };
}

function createIncome(
    id,
    startDate,
    dayOffset
) {
    const date = generateExpenseDate(
        startDate,
        dayOffset
    );

    return {
        transactionId: `INC${String(id).padStart(4, "0")}`,
        type: "income",
        amount: round(
            randomBetween(7000, 25000)
        ),
        category: "Salary",
        date: formatDate(date),
        paymentMethod: "Bank Transfer",
        merchant: "Employer",
        actualAnomaly: 0,
        anomalyType: "none"
    };
}

function createAnomaly(
    id,
    startDate,
    dayOffset,
    anomalyType,
    category,
    amount
) {
    return {
        transactionId: `ANM${String(id).padStart(4, "0")}`,
        type: "expense",
        amount,
        category,
        date: formatDate(
            generateExpenseDate(
                startDate,
                dayOffset
            )
        ),
        paymentMethod: "Card",
        merchant: `${category} Merchant`,
        actualAnomaly: 1,
        anomalyType
    };
}

export function generateResearchDataset() {
    const startDate = new Date(
        "2026-01-01T00:00:00.000Z"
    );

    const expenses = [];

    /*
     * Generate normal transactions.
     */
    for (
        let i = 1;
        i <= TARGET_EXPENSES - 10;
        i++
    ) {
        const dayOffset = randomInt(
            0,
            DAYS - 1
        );

        expenses.push(
            createNormalExpense(
                i,
                startDate,
                dayOffset
            )
        );
    }

    /*
     * Controlled anomalies.
     *
     * These labels are created BEFORE
     * model evaluation and act as
     * ground truth.
     */

    const anomalies = [
        createAnomaly(
            1,
            startDate,
            12,
            "extreme_amount",
            "Shopping",
            15000
        ),

        createAnomaly(
            2,
            startDate,
            24,
            "extreme_amount",
            "Travel",
            18000
        ),

        createAnomaly(
            3,
            startDate,
            36,
            "extreme_amount",
            "Electronics",
            25000
        ),

        createAnomaly(
            4,
            startDate,
            48,
            "unusual_category",
            "Travel",
            12000
        ),

        createAnomaly(
            5,
            startDate,
            55,
            "extreme_amount",
            "Healthcare",
            10000
        ),

        createAnomaly(
            6,
            startDate,
            62,
            "unusual_category",
            "Shopping",
            14000
        ),

        createAnomaly(
            7,
            startDate,
            70,
            "extreme_amount",
            "Education",
            9000
        ),

        createAnomaly(
            8,
            startDate,
            76,
            "extreme_amount",
            "Food",
            8000
        ),

        createAnomaly(
            9,
            startDate,
            83,
            "unusual_category",
            "Travel",
            16000
        ),

        createAnomaly(
            10,
            startDate,
            87,
            "extreme_amount",
            "Shopping",
            20000
        )
    ];

    expenses.push(...anomalies);

    /*
     * Generate income transactions.
     */
    const income = [];

    for (
        let i = 1;
        i <= TARGET_INCOME;
        i++
    ) {
        const dayOffset =
            Math.min(
                (i - 1) * 5,
                DAYS - 1
            );

        income.push(
            createIncome(
                i,
                startDate,
                dayOffset
            )
        );
    }

    /*
     * Combine and sort chronologically.
     */
    const transactions = [
        ...expenses,
        ...income
    ].sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );

    const dataset = {
        metadata: {
            datasetName:
                "ExpenseMind Research Dataset",

            version: "1.0",

            seed: SEED,

            observationPeriodDays: DAYS,

            expenseTransactions:
                expenses.length,

            incomeTransactions:
                income.length,

            totalTransactions:
                transactions.length,

            normalExpenseTransactions:
                expenses.filter(
                    item =>
                        item.actualAnomaly === 0
                ).length,

            anomalousExpenseTransactions:
                expenses.filter(
                    item =>
                        item.actualAnomaly === 1
                ).length,

            categories: [
                ...new Set(
                    expenses.map(
                        item => item.category
                    )
                )
            ],

            groundTruth:
                "actualAnomaly=1 indicates a controlled synthetic anomaly"
        },

        transactions
    };

    return dataset;
}

export function saveResearchDataset() {
    const dataset =
        generateResearchDataset();

    const outputDirectory =
        path.resolve(
            process.cwd(),
            "src",
            "research",
            "datasets"
        );

    fs.mkdirSync(
        outputDirectory,
        {
            recursive: true
        }
    );

    const jsonPath =
        path.join(
            outputDirectory,
            "expenseMindResearchDataset.json"
        );

    const csvPath =
        path.join(
            outputDirectory,
            "expenseMindResearchDataset.csv"
        );

    fs.writeFileSync(
        jsonPath,
        JSON.stringify(
            dataset,
            null,
            2
        )
    );

    const csvHeader =
        [
            "transactionId",
            "type",
            "amount",
            "category",
            "date",
            "paymentMethod",
            "merchant",
            "actualAnomaly",
            "anomalyType"
        ].join(",");

    const csvRows =
        dataset.transactions.map(
            transaction =>
                [
                    transaction.transactionId,
                    transaction.type,
                    transaction.amount,
                    transaction.category,
                    transaction.date,
                    transaction.paymentMethod,
                    transaction.merchant,
                    transaction.actualAnomaly,
                    transaction.anomalyType
                ]
                    .map(value =>
                        `"${String(value).replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",")
        );

    fs.writeFileSync(
        csvPath,
        [
            csvHeader,
            ...csvRows
        ].join("\n")
    );

    console.log(
        "\n========================================"
    );

    console.log(
        "ExpenseMind Research Dataset Generated"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Seed: ${dataset.metadata.seed}`
    );

    console.log(
        `Days: ${dataset.metadata.observationPeriodDays}`
    );

    console.log(
        `Total transactions: ${dataset.metadata.totalTransactions}`
    );

    console.log(
        `Expenses: ${dataset.metadata.expenseTransactions}`
    );

    console.log(
        `Income: ${dataset.metadata.incomeTransactions}`
    );

    console.log(
        `Normal expenses: ${dataset.metadata.normalExpenseTransactions}`
    );

    console.log(
        `Anomalous expenses: ${dataset.metadata.anomalousExpenseTransactions}`
    );

    console.log(
        `JSON: ${jsonPath}`
    );

    console.log(
        `CSV: ${csvPath}`
    );

    console.log(
        "========================================\n"
    );

    return dataset;
}