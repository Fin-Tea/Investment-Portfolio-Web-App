export default function createNewTradePlan(id) {
  return {
    id,
    isNew: true,
    catalystId: null,
    validFrom: null,
    validUntil: null,
    securitySymbol: "",
    tradeDirectionType: "",
    entry: null,
    exit: null,
    stopLoss: null,
    tradeDescription: "",
  };
}
