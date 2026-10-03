 /**
  * Goal Intelligence Service
  *
  * Attaches derived progress, saving requirements,
  * projected completion and intelligent recommendations
  * to goal documents.
  */

export const enrichGoal = (goal) => {

    const obj =
        goal?.toObject
            ? goal.toObject()
            : goal;


    // =====================================================
    // BASIC GOAL VALUES
    // =====================================================

    const targetAmount =
        Number(obj.targetAmount || 0);

    const savedAmount =
        Number(obj.savedAmount || 0);


    // =====================================================
    // PROGRESS
    // =====================================================

    const progressPercent =
        targetAmount > 0
            ? Number(
                Math.min(
                    (savedAmount / targetAmount) * 100,
                    100
                ).toFixed(2)
            )
            : 0;


    const remaining =
        Math.max(
            targetAmount - savedAmount,
            0
        );


    // =====================================================
    // DAYS REMAINING
    // =====================================================

    let daysLeft = null;

    if (obj.deadline) {

        const deadlineTime =
            new Date(obj.deadline).getTime();

        if (!Number.isNaN(deadlineTime)) {

            daysLeft =
                Math.ceil(
                    (
                        deadlineTime -
                        Date.now()
                    ) /
                    (1000 * 60 * 60 * 24)
                );
        }
    }


    // =====================================================
    // MONTHS REMAINING
    // =====================================================

    let monthsRemaining = null;

    if (daysLeft !== null) {

        monthsRemaining =
            Math.max(
                Math.ceil(daysLeft / 30),
                0
            );
    }


    // =====================================================
    // REQUIRED MONTHLY SAVING
    // =====================================================

    let requiredMonthlySaving = 0;

    if (
        remaining > 0 &&
        monthsRemaining !== null &&
        monthsRemaining > 0
    ) {

        requiredMonthlySaving =
            Number(
                (
                    remaining /
                    monthsRemaining
                ).toFixed(2)
            );
    }


    // =====================================================
    // REQUIRED DAILY SAVING
    // =====================================================

    let requiredDailySaving = 0;

    if (
        remaining > 0 &&
        daysLeft !== null &&
        daysLeft > 0
    ) {

        requiredDailySaving =
            Number(
                (
                    remaining /
                    daysLeft
                ).toFixed(2)
            );
    }


    // =====================================================
    // GOAL STATUS
    // =====================================================

    let goalStatus = "On-track";


    if (progressPercent >= 100) {

        goalStatus = "Completed";

    } else if (
        daysLeft !== null &&
        daysLeft < 0
    ) {

        goalStatus = "Delayed";

    } else if (
        daysLeft !== null &&
        daysLeft <= 30 &&
        progressPercent < 70
    ) {

        goalStatus = "At-risk";

    } else if (
        daysLeft !== null &&
        daysLeft <= 60 &&
        progressPercent < 50
    ) {

        goalStatus = "At-risk";
    }


    // =====================================================
    // SAVING RATE
    // =====================================================

    let savingRatePerDay = 0;

    if (
        savedAmount > 0 &&
        obj.createdAt
    ) {

        const createdTime =
            new Date(obj.createdAt).getTime();

        const elapsedDays =
            !Number.isNaN(createdTime)
                ? Math.max(
                    Math.ceil(
                        (
                            Date.now() -
                            createdTime
                        ) /
                        (1000 * 60 * 60 * 24)
                    ),
                    1
                )
                : 0;

        if (elapsedDays > 0) {

            savingRatePerDay =
                Number(
                    (
                        savedAmount /
                        elapsedDays
                    ).toFixed(2)
                );
        }
    }


    // =====================================================
    // PROJECTED COMPLETION
    // =====================================================

    let projectedCompletion = null;

    if (
        remaining > 0 &&
        savingRatePerDay > 0
    ) {

        const daysRequired =
            Math.ceil(
                remaining /
                savingRatePerDay
            );


        const projectedDate =
            new Date(
                Date.now() +
                daysRequired *
                24 *
                60 *
                60 *
                1000
            );


        projectedCompletion =
            projectedDate
                .toISOString()
                .split("T")[0];
    }


    // =====================================================
    // DEADLINE RISK
    // =====================================================

    let deadlineRisk = "Low";

    if (goalStatus === "Completed") {

        deadlineRisk = "None";

    } else if (goalStatus === "Delayed") {

        deadlineRisk = "High";

    } else if (goalStatus === "At-risk") {

        deadlineRisk = "High";

    } else if (
        daysLeft !== null &&
        daysLeft <= 90 &&
        progressPercent < 60
    ) {

        deadlineRisk = "Medium";
    }


    // =====================================================
    // PERSONALIZED RECOMMENDATION
    // =====================================================

    let recommendation =
        "Keep saving consistently to achieve your goal.";


    if (goalStatus === "Completed") {

        recommendation =
            "Congratulations! You have achieved your financial goal.";

    } else if (goalStatus === "Delayed") {

        recommendation =
            `Your goal deadline has passed with ₹${remaining.toLocaleString("en-IN")} remaining. Consider revising the deadline or increasing your savings.`;

    } else if (goalStatus === "At-risk") {

        recommendation =
            `Your goal may be at risk. Try saving approximately ₹${requiredDailySaving.toLocaleString("en-IN")} per day to reach the target on time.`;

    } else if (
        requiredMonthlySaving > 0
    ) {

        recommendation =
            `Save approximately ₹${requiredMonthlySaving.toLocaleString("en-IN")} per month to reach your ${obj.name || "financial"} goal on time.`;
    }


    // =====================================================
    // RETURN ENRICHED GOAL
    // =====================================================

    return {

        ...obj,


        // Existing application fields
        progressPercent,
        remaining,
        daysLeft,


        // Goal Intelligence
        target_amount:
            targetAmount,

        saved_amount:
            savedAmount,

        remaining_amount:
            remaining,

        monthsRemaining,

        requiredMonthlySaving,

        requiredDailySaving,

        savingRatePerDay,

        goalStatus,

        deadlineRisk,

        projectedCompletion,

        recommendation
    };
};


/**
 * Enrich multiple goals.
 */
export const enrichGoalList = (goals) => {

    if (!Array.isArray(goals)) {
        return [];
    }

    return goals.map(
        (goal) => enrichGoal(goal)
    );
};