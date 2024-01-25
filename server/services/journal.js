import db from "../db";

const createMap = {
  1: createTradePlanEntry,
  2: createMilestoneEntry,
  3: createImprovementAreaEntry,
  4: createFinstrumentEntry,
  5: createReflectionEntry,
};

const updateMap = {
  1: updateTradePlanEntry,
  2: updateMilestoneEntry,
  3: updateImprovementAreaEntry,
  4: updateFinstrumentEntry,
  5: updateReflectionEntry,
};

export async function createJournalEntry(accountId, journalTagId, formFields) {
  const createFunc = createMap[journalTagId];

  if (!createFunc) {
    throw new Error("Journal Tag type not found");
  }

  const now = new Date();

  const [journalEntryId] = await db("journalEntries")
    .insert([
      {
        accountId,
        journalTagId,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning("id");

  const journalEntry = await db
    .select("id", "accountId", "journalTagId", "createdAt", "updatedAt")
    .from("journalEntries")
    .where({ id: journalEntryId })
    .first();

  return createFunc(journalEntry, formFields, now);
}

async function createTradePlanEntry(journalEntry, formFields, currentDate) {
  const now = currentDate || new Date();

  const { id: journalEntryId, accountId } = journalEntry;

  const {
    securitySymbol,
    tradeDirectionType,
    entry,
    exit,
    stopLoss,
    planType,
    hypothesis,
    invalidationPoint,
    priceTarget1,
    positionSizePercent1,
    priceTarget2,
    positionSizePercent2,
    priceTarget3,
    positionSizePercent3,
    newsCatalyst,
    confirmations,
  } = formFields;

  // insert trade plan and get id
  const [tradePlanId] = await db("tradePlans")
    .insert([
      {
        journalEntryId,
        securitySymbol,
        tradeDirectionType,
        entry,
        exit,
        stopLoss,
        planType,
        hypothesis,
        invalidationPoint,
        priceTarget1,
        positionSizePercent1,
        priceTarget2,
        positionSizePercent2,
        priceTarget3,
        positionSizePercent3,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning("id");

  const tradePlan = await db
    .select(
      "id",
      "securitySymbol",
      "tradeDirectionType",
      "setup",
      "entry",
      "exit",
      "stopLoss",
      "planType",
      "hypothesis",
      "invalidationPoint",
      "priceTarget1",
      "positionSizePercent1",
      "priceTarget2",
      "positionSizePercent2",
      "priceTarget3",
      "positionSizePercent3"
    )
    .from("tradePlans")
    .where({ id: tradePlanId });

  if (newsCatalyst) {
    const { label, sentimentType, statusType, url, newsText } = newsCatalyst;

    const [newsCatalystId] = await db("newsCatalysts")
      .insert([
        {
          tradePlanId,
          label,
          sentimentType,
          statusType,
          url,
          newsText,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .returning("id");

    const dbNewsCatalyst = await db
      .select("id", "label", "sentimentType", "statusType", "url", "newsText")
      .from("newsCatalysts")
      .where({ id: newsCatalystId });

    tradePlan.newsCatalyst = dbNewsCatalyst;
  }

  if (confirmations) {
    if (!confirmations.length) {
      throw new Error("Confirmations must be an array");
    }

    let dbConfirmations = confirmations.map((confirmationText) => ({
      accountId,
      tradePlanId,
      confirmationText,
      createdAt: now,
      updatedAt: now,
    }));

    await db("confirmations").insert(dbConfirmations);

    dbConfirmations = await db
      .select("id", "confirmationText")
      .from("confirmations")
      .where({ tradePlanId });

    tradePlan.confirmations = dbConfirmations;
  }

  return { ...journalEntry, tradePlan };
}

async function createMilestoneEntry(journalEntry, formFields) {
  const { id: journalEntryId } = journalEntry;

  const { growthTypeId, milestoneText, reachedOn } = formFields;

  const [id] = await db("milestones")
    .insert([
      {
        journalEntryId,
        growthTypeId,
        milestoneText,
        reachedOn,
      },
    ])
    .returning("id");

  const milestone = await db
    .select(
      "id",
      "journalEntryId",
      "growthTypeId",
      "milestoneText",
      "reachedOn"
    )
    .from("milestones")
    .where({ id });

  return { ...journalEntry, milestone };
}

async function createImprovementAreaEntry(journalEntry, formFields) {
  const { id: journalEntryId } = journalEntry;

  const {
    growthTypeId,
    action,
    expectedResult,
    actualResult,
    startDate,
    endDate,
  } = formFields;

  const [id] = await db("improvementAreas")
    .insert([
      {
        journalEntryId,
        growthTypeId,
        action,
        expectedResult,
        actualResult,
        startDate,
        endDate,
      },
    ])
    .returning("id");

  const improvementArea = await db
    .select(
      "id",
      "journalEntryId",
      "growthTypeId",
      "action",
      "expectedResult",
      "actualResult",
      "startDate",
      "endDate"
    )
    .from("improvementAreas")
    .where({ id });

  return { ...journalEntry, improvementArea };
}

async function createFinstrumentEntry(journalEntry, formFields) {
  const { id: journalEntryId } = journalEntry;

  const { securityTypeId, securitySymbol, observations } = formFields;

  const [id] = await db("finstruments")
    .insert([
      {
        journalEntryId,
        securityTypeId,
        securitySymbol,
        observations,
      },
    ])
    .returning("id");

  const finstrument = await db
    .select(
      "id",
      "journalEntryId",
      "securityTypeId",
      "securitySymbol",
      "observations"
    )
    .from("finstruments")
    .where({ id });

  return { ...journalEntry, finstrument };
}

async function createReflectionEntry(journalEntry, formFields) {
  const { id: journalEntryId } = journalEntry;

  const { timeframeType, moodType, energyType, thoughts } = formFields;

  const [id] = await db("reflections")
    .insert([
      {
        journalEntryId,
        timeframeType,
        moodType,
        energyType,
        thoughts,
      },
    ])
    .returning("id");

  const reflection = await db
    .select(
      "id",
      "journalEntryId",
      "timeframeType",
      "moodType",
      "energyType",
      "thoughts"
    )
    .from("reflections")
    .where({ id });

  return { ...journalEntry, reflection };
}

// update journal entry

async function readTradePlanEntries(journalEntryIds) {
  if (!journalEntryIds.length) {
    return [];
  }

  const tradePlans = await db
    .select(
      "id",
      "journalEntryId",
      "securitySymbol",
      "tradeDirectionType",
      "setups",
      "entry",
      "exit",
      "stopLoss",
      "planType",
      "hypothesis",
      "invalidationPoint",
      "priceTarget1",
      "positionSizePercent1",
      "priceTarget2",
      "positionSizePercent2",
      "priceTarget3",
      "positionSizePercent3"
    )
    .from("tradePlans")
    .whereIn("journalEntryId", journalEntryIds);

  const tradePlanIds = tradePlans.map(({ id }) => id);

  const newsCatalysts = await db
    .select(
      "id",
      "tradePlanId",
      "label",
      "sentimentType",
      "statusType",
      "url",
      "newsText"
    )
    .from("newsCatalysts")
    .whereIn("tradePlanId", tradePlanIds);

  const confirmations = await db
    .select("id", "tradePlanId", "confirmationText")
    .from("confirmations")
    .whereIn("tradePlanId", tradePlanIds);

  const newsCatalystsMap = newsCatalysts.reduce((acc, catalyst) => {
    acc.set(catalyst.tradePlanId, catalyst);
    return acc;
  }, new Map());

  const confirmationsMap = confirmations.reduce((acc, confirmation) => {
    const confirmationsGroup = acc.get(confirmation.tradePlanId) || [];
    confirmationsGroup.push(confirmation);
    acc.set(confirmation.tradePlanId, confirmationsGroup);
    return acc;
  }, new Map());

  return tradePlans.map((tradePlan) => {
    const { id } = tradePlan;
    const newsCatalyst = newsCatalystsMap.get(id);
    const confirmations = confirmationsMap.get(id);
    return { ...tradePlan, newsCatalyst, confirmations };
  });
}

function readMilestoneEntries(journalEntryIds) {
  if (!journalEntryIds.length) {
    return [];
  }

  return db
    .select(
      "id",
      "journalEntryId",
      "growthTypeId",
      "milestoneText",
      "reachedOn"
    )
    .from("milestones")
    .whereIn("journalEntryId", journalEntryIds);
}

function readImprovementAreaEntries(journalEntryIds) {
  if (!journalEntryIds.length) {
    return [];
  }

  return db
    .select(
      "id",
      "journalEntryId",
      "growthTypeId",
      "action",
      "expectedResult",
      "actualResult",
      "startDate",
      "endDate"
    )
    .from("improvementAreas")
    .whereIn("journalEntryId", journalEntryIds);
}

function readFinstrumentEntries(journalEntryIds) {
  if (!journalEntryIds.length) {
    return [];
  }

  return db
    .select(
      "id",
      "journalEntryId",
      "securityTypeId",
      "securitySymbol",
      "observations"
    )
    .from("finstruments")
    .whereIn("journalEntryId", journalEntryIds);
}

function readReflectionEntries(journalEntryIds) {
  if (!journalEntryIds.length) {
    return [];
  }

  return db
    .select(
      "id",
      "journalEntryId",
      "timeframeType",
      "moodType",
      "energyType",
      "thoughts"
    )
    .from("reflections")
    .whereIn("journalEntryId", journalEntryIds);
}

function createJournalEntryMap(entries) {
  return entries.reduce((acc, entry) => {
    acc.set(entry.journalEntryId, entry);
    return acc;
  }, new Map());
}

export async function readJournalEntries(accountId, options = {}) {
  const { limit, offset, journalEntryId, journalTagId } = options;

  let builder = await db
    .select("id", "accountId", "journalTagId", "createdAt", "updatedAt")
    .from("journalEntries")
    .where({ accountId });

  if (journalEntryId) {
    builder = builder.andWhere({ id: journalEntryId });
  } else if (journalTagId) {
    builder = builder.andWhere({ journalTagId });
  }

  builder = builder.whereNull("deletedAt");

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  let journalEntries = await builder();

  const {
    tradePlansJournalIds,
    milestoneJournalIds,
    improvementAreaJournalIds,
    finstrumentJournalIds,
    reflectionJournalIds,
  } = journalEntries.reduce(
    (acc, entry) => {
      const { id, journalTagId } = entry;

      switch (journalTagId) {
        case 1:
          tradePlansJournalIds.push(id);
          break;
        case 2:
          milestoneJournalIds.push(id);
          break;
        case 3:
          improvementAreaJournalIds.push(id);
          break;
        case 4:
          finstrumentJournalIds.push(id);
          break;
        case 5:
          reflectionJournalIds.push(id);
          break;
      }

      return acc;
    },
    {
      tradePlansJournalIds: [],
      milestoneJournalIds: [],
      improvementAreaJournalIds: [],
      finstrumentJournalIds: [],
      reflectionJournalIds: [],
    }
  );

  const tradePlans = await readTradePlanEntries(tradePlansJournalIds);
  const milestones = await readMilestoneEntries(milestoneJournalIds);
  const improvementAreas = await readImprovementAreaEntries(
    improvementAreaJournalIds
  );
  const finstruments = await readFinstrumentEntries(improvementAreaJournalIds);
  const reflections = await readReflectionEntries(reflectionJournalIds);

  const tradePlansMap = createJournalEntryMap(tradePlans);
  const milestonesMap = createJournalEntryMap(milestones);
  const improvementAreasMap = createJournalEntryMap(improvementAreas);
  const finstrumentsMap = createJournalEntryMap(finstruments);
  const reflectionsMap = createJournalEntryMap(reflections);

  journalEntries = journalEntries.map((entry) => {
    const { journalEntryId, journalTagId } = entry;
    switch (journalTagId) {
      case 1:
        return { ...entry, tradePlan: tradePlansMap.get(journalEntryId) };
      case 2:
        return { ...entry, milestone: milestonesMap.get(journalEntryId) };
      case 3:
        return {
          ...entry,
          improvementArea: improvementAreasMap.get(journalEntryId),
        };
      case 4:
        return { ...entry, finstrument: finstrumentsMap.get(journalEntryId) };
      case 5:
        return { ...entry, reflection: reflectionsMap.get(journalEntryId) };
      default:
        return entry;
    }
  });

  return journalEntries.sort((a, b) => new Date(a) - new Date(b));
}

export async function deleteJournalEntry(accountId, journalEntryId) {
  const journalEntries = readJournalEntries(accountId, { journalEntryId });

  if (!journalEntries.length) {
    throw new Error(`Journal Entry not found for account ID: ${accountId}`);
  }

  await db("journalEntries")
    .where({ journalEntryId })
    .update({ deletedAt: new Date() });

  return { journalEntryId, deleted: true };
}

async function updateTradePlanEntry(journalEntryId, formFields, currentDate) {
  const now = currentDate || new Date();

  const updateInfo = { journalEntryId };

  const {
    newsCatalyst,
    confirmations,
    id: _planId,
    createdAt: _planCreatedAt,
    deletedAt: _planDeletedAt,
    ...tradePlanFields
  } = formFields;
  await db("tradePlans")
    .where({ journalEntryId })
    .update({ ...tradePlanFields, updatedAt: now });

  updateInfo.tradePlanUpdated = true;

  if (newsCatalyst) {
    const {
      id,
      tradePlanId,
      accountId: _accountId,
      createdAt: _catalystCreatedAt,
      deletedAt: _catalystDeletedAt,
      ...newsCatalystFields
    } = newsCatalyst;

    await db("tradePlans")
      .where({ tradePlanId })
      .update({ ...newsCatalystFields, updatedAt: now });

    updateInfo.newsCatalystUpdated = true;
  }

  if (confirmations && confirmations.length) {
    const confirmationsUpdateInfo = await confirmations.reduce(
      async (acc, confirmation) => {
        const { id, confirmationText } = confirmation;
        await db("confirmations").update({ confirmationText }).where({ id });
        acc.numUpdated++;

        return acc;
      },
      { numUpdated: 0 }
    );

    updateInfo.confirmationsUpdated = confirmationsUpdateInfo;
  }

  updateInfo.updated = true;

  return updateInfo;
}

async function updateMilestoneEntry(journalEntryId, formFields) {
  const { growthTypeId, milestoneText, reachedOn } = formFields;
  await db("milestones")
    .where({ journalEntryId })
    .update({ growthTypeId, milestoneText, reachedOn });

  return { journalEntryId, updated: true, milestoneUpdate: true };
}

async function updateImprovementAreaEntry(journalEntryId, formFields) {
  const {
    id: _id,
    journalEntryId: _journalEntryId,
    ...improvementAreaFields
  } = formFields;
  await db("improvementAreas")
    .where({ journalEntryId })
    .update(improvementAreaFields);

  return { journalEntryId, updated: true, improvementAreaUpdated: true };
}

async function updateFinstrumentEntry(journalEntryId, formFields) {
  const {
    id: _id,
    journalEntryId: _journalEntryId,
    ...finstrumentFields
  } = formFields;
  await db("improvementAreas")
    .where({ journalEntryId })
    .update(finstrumentFields);

  return { journalEntryId, updated: true, finstrumentUpdated: true };
}

async function updateReflectionEntry(journalEntryId, formFields) {
  const {
    id: _id,
    journalEntryId: _journalEntryId,
    ...reflectionFields
  } = formFields;
  await db("reflections").where({ journalEntryId }).update(reflectionFields);

  return { journalEntryId, updated: true, reflectionUpdated: true };
}

export async function updateJournalEntry(
  accountId,
  journalEntryId,
  formFields
) {
  const journalEntries = readJournalEntries(accountId, { journalEntryId });

  if (!journalEntries.length) {
    throw new Error(`Journal Entry not found for account ID: ${accountId}`);
  }

  const now = new Date();

  const [{ journalTagId }] = journalEntries;

  const updateFunc = updateMap[journalTagId];

  if (!updateFunc) {
    throw new Error("Journal Tag type not found");
  }

  try {
    const updateInfo = await updateFunc(journalEntryId, formFields, now);
    if (updateInfo.updated) {
      await db("journalEntries")
        .where({ id: journalEntryId })
        .update({ updatedAt: now });

      return readJournalEntries(accountId, { journalEntryId });
    } else {
      console.log(
        `Error updating journal entry: ${JSON.stringify(updateInfo)}`
      );
    }
  } catch (e) {
    throw new Error(`Error updating journal entry: ${e}`);
  }
}
