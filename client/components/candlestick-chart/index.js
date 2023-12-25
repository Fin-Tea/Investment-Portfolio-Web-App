import {
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryCandlestick,
  VictoryLine,
  VictoryScatter,
  VictoryVoronoiContainer,
  VictoryTooltip,
  createContainer,
} from "victory";
import Header from "../header";
import PropTypes from "prop-types";

const testData2 = [
  { x: new Date("2021-12-27"), y: 11000 },
  { x: new Date("2021-12-28"), y: 10300 },
  { x: new Date("2021-12-29"), y: 9700 },
  { x: new Date("2021-12-30"), y: 9800 },
  { x: new Date("2021-12-31"), y: 10011 },
];

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

function formatDate(date) {
  let hours = date.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }

  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return `${
    date.getMonth() + 1
  }-${date.getDate()}-${date.getFullYear()} ${hours}:${minutes}`;
}

export default function CandlestickChart({
  title,
  priceData,
  studyData,
  orderData,
}) {
  // console.log("datum", priceData[0]);
  //console.log("studyData", studyData);
  console.log("orderData", orderData);
  return (
    <div>
      <Header style={{ marginBottom: -25 }}>{title}</Header>
      <VictoryChart
        theme={VictoryTheme.grayscale}
        scale={{ x: "time" }}
        padding={{ top: 40, left: 60, bottom: 30, right: 20 }}
        containerComponent={
          <VictoryZoomVoronoiContainer
            // voronoiDimension="x"
            // mouseFollowTooltips
            style={{ fontSize: 12 }}
            labels={({ datum }) => {
              if (datum.side && datum.description && datum.quantity) {
                return `Side: ${datum.side}\n
              Description: ${datum.description}\nQuantity: ${datum.quantity}\nPrice: $${datum.price}`;
              } else if (datum.open && datum.close && datum.high && datum.low) {
                return `Date: ${formatDate(datum.x)}\n
              Open: $${datum.open.toFixed(2)}\nClose: $${datum.close.toFixed(
                  2
                )}\nHigh: $${datum.high.toFixed(2)}\nLow: $${datum.low.toFixed(
                  2
                )}`;
              }
              return "";
            }}
            labelComponent={<VictoryTooltip style={{ fontSize: 5 }} dy={-10} />}
          />
        }
      >
        {/* Y axis */}
        <VictoryAxis
          dependentAxis
          /*tickFormat={(t) => `$${parseFloat(t).toLocaleString("en-US")}`}*/
          width={5}
          style={{
            axis: {
              stroke: "#777777",
            },
            ticks: {
              stroke: "transparent",
            },
            tickLabels: {
              color: "#555555",
              fill: "#555555",
              fontSize: 7,
            },
          }}
          standalone={false}
        />
        {/* X Axis */}
        <VictoryAxis
          standalone={false}
          // tickValues={data.map((d) => new Date(d.date))}
          // tickFormat={(t) =>
          //   `${
          //     t.getMonth() + 1
          //   }/${t.getDate()} ${t.getHours()}:${t.getMinutes()}`
          // }
          tickCount={7}
          style={{
            axis: {
              stroke: "#777777",
            },
            tickLabels: {
              color: "#555555",
              fill: "#555555",
              fontSize: 7,
            },
          }}
        />
        <VictoryCandlestick
          name="candlestick"
          style={
            {
              // parent: { border: "1px solid #ccc" },
            }
          }
          candleColors={{ positive: "#30d97c", negative: "#c43a31" }}
          data={priceData}
        />
        {studyData &&
          studyData.map((studyValues, i) => {
            if (i === 0) {
              console.log(studyValues[0]);
            }
            let stroke = "#30d97c";
            if (studyValues[0].studyType === "zone") {
              if (studyValues[0].studyValueDescription === "high") {
                stroke = "#faf014";
              } else {
                stroke = "#00ffff";
              }
            }
            return (
              <VictoryLine
                key={i}
                name={`line-${i}`}
                style={{
                  data: { stroke, strokeWidth: 1 },
                  parent: { border: "1px solid #ccc" },
                }}
                data={studyValues}
              />
            );
          })}
        {orderData?.length && (
          <VictoryScatter
            name="scatter"
            style={{
              labels: {
                fontSize: 7,
              },
              data: {
                fill: ({ datum }) =>
                  datum.side.toLowerCase().includes("open")
                    ? "#333333"
                    : "#7c30d9",
              },
            }}
            size={2}
            data={orderData}
            labelComponent={<VictoryTooltip />}
          />
        )}
      </VictoryChart>
    </div>
  );
}

CandlestickChart.propTypes = {
  title: PropTypes.string,
  priceData: PropTypes.arrayOf(PropTypes.shape({})),
  studyData: PropTypes.arrayOf(PropTypes.shape({})),
  orderData: PropTypes.arrayOf(PropTypes.shape({})),
};

CandlestickChart.defaultProps = {
  title: "",
  priceData: [],
  studyData: [],
  orderData: [],
};
