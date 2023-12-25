import db from '../db';
import { formatDate, formatObjectDates } from '../utils';

export function getImprovementActions(accountId, options = {}) {
    const { 
        limit, 
        offset, 
        fromDate, 
        toDate, 
    } = options;

    let builder = db.select('id', 'action', 'expectedResult', 'startedAt', 'finishedAt', 'resultImmediate',
     'result30days', 'result3Months', 'result6Months', 'result1Year', 'createdAt')
    .from('improvementActions')
    .where({ accountId });
    
    if (fromDate) {
        builder = builder.andWhere('createdAt', '>=', formatDate(fromDate));
    }

    if (toDate) {
        builder = builder.andWhere('createdAt', '<=', formatDate(toDate));
    }

    builder = builder.orderBy('createdAt', 'desc');

    if (limit) {
        builder = builder.limit(limit);
        if (offset) {
            builder = builder.offset(offset);
        }
    }

    return builder;
}

export function createImprovementActionsBulk(accountId, improvementActions) {
    const now = new Date();
    let formattedImprovementActions = improvementActions.map((improvementAction) => ({...improvementAction, accountId, createdAt: now, updatedAt: now}));
    formattedImprovementActions = formatObjectDates(formattedImprovementActions);
    return db('improvementActions').insert(formattedImprovementActions);
}

export async function updateImprovementActionsBulk(improvementActionUpdates) {
    const now = new Date();
    let formattedImprovementActionUpdates = improvementActionUpdates.map((improvementAction) => ({...improvementAction, updatedAt: now}));
    formattedImprovementActionUpdates = formatObjectDates(formattedImprovementActionUpdates);
    const updateInfo = await formattedImprovementActionUpdates.reduce(async (acc, improvementActionUpdate) => {

    try {
        const { id, ...updatedVals } = improvementActionUpdate;
        await db('improvementActions').update(updatedVals).where({id});
        acc.numUpdated++;
    } catch (e) {
        acc.errors.push(e);
    }
    return acc;
   }, { errors: [], numUpdated: 0 });

   return updateInfo;
}