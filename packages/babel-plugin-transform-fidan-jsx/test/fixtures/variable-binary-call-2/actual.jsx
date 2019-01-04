// @tracked
export const activeCount$ = totalCount$ - completedCount$.$val;
