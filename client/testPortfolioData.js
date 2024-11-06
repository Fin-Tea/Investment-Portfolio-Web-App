export const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];
export const RECOMMENDATIONS = [ { text: "Hold", color: 'orange', factors: ["New All Time High", "Upcoming Earnings Report"] }, { text: "Buy", color: 'green', factors: ["Good News", "Good Earnings", "Stock Oversold (RSI)"] }, { text: "Sell", color: 'red', factors: ["Bad News", "Bad Earnings", "Price Dropped 15+%"] }];


const rawData = [
    { securitySymbol: 'AMZN',  securityName: 'Amazon', quanity: 12, costBasis: 1620.00, marketPrice: 200.00 },
    { securitySymbol: 'TSLA', securityName: 'Tesla', quanity: 10, costBasis: 1350.00, marketPrice: 250.00 },
    { securitySymbol: 'SPY', securityName: 'S&P 500', quanity: 5, costBasis: 2150.00, marketPrice: 512.00 },
  ];


 export const { totalShares, totalCostBasis, totalMarketValue } = rawData.reduce((acc, { quanity, marketPrice, costBasis }) => {
    acc.totalShares += quanity;
    acc.totalCostBasis += costBasis;
    acc.totalMarketValue += quanity * marketPrice;

    return acc;

 }, {  totalShares: 0, totalCostBasis: 0, totalMarketValue: 0  });

  export const holdingsData = rawData.map(({ securityName, costBasis }, index) => ( { name: securityName, value: Math.round((100 * costBasis / totalCostBasis)), color : COLORS[index % COLORS.length] } ));

  export const roiData = rawData.map(({ securityName, quanity, costBasis, marketPrice }, index) => ( { name: securityName, value: Math.round((100 * (marketPrice * quanity - costBasis) / totalCostBasis)), color : COLORS[index % COLORS.length] } ));

  export const earningsData = rawData.map(({ securityName, quanity, marketPrice }, index) => ( { name: securityName, value: Math.round((100 * (marketPrice * quanity) / totalMarketValue)), color : COLORS[index % COLORS.length] } ));

  export const recommendationsData = rawData.map(({ securityName }, index) => ( { name: securityName, recommendation : RECOMMENDATIONS[index % RECOMMENDATIONS.length] , color : COLORS[index % COLORS.length] } ));
