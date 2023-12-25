export default function createNewImprovementAction(id) {
  return {
    id,
    isNew: true,
    createdAt: null,
    action: "",
    expectedResult: "",
    startedAt: null,
    finishedAt: null,
    resultImmediate: "",
    result30days: "",
    result3Months: "",
    result6Months: "",
    result1Year: "",
  };
}
