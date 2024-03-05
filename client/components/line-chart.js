import {
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
  VictoryArea,
  VictoryVoronoiContainer,
} from "victory";
import Header from "../components/header";
import Legend from "./legend";
import Tooltip from "./app/tooltip";
import PropTypes from "prop-types";

const testData2 = [
  { x: new Date("2021-12-27"), y: 11000 },
  { x: new Date("2021-12-28"), y: 10300 },
  { x: new Date("2021-12-29"), y: 9700 },
  { x: new Date("2021-12-30"), y: 9800 },
  { x: new Date("2021-12-31"), y: 10011 },
];

function calcTickCount(dataset1, dataset2) {
  let max = dataset1.reduce((acc, datum) => {
    if (datum.y > acc) {
      return datum.y;
    }
    return acc;
  }, 0);

  if (dataset2) {
    max = dataset2.reduce((acc, datum) => {
      if (datum.y > acc) {
        return datum.y;
      }
      return acc;
    }, max);
  }

  if (max === 1) {
    return 2;
  }

  if (max === 0 || max === 1) {
    return 1;
  }

  return undefined;
}

export default function LineChart({
  title,
  data,
  dataset2,
  dataStyle = {},
  dataset2Style = {},
  prefix,
  suffix,
  showDataPoints,
  showDataset2Area,
  showDataset2Points,
  xAxisOffset,
  legendItems,
  legendPosition,
  height,
  width,
  tooltip,
}) {
  return (
    <div>
      <div className="flex justify-center items-center">
        <Header style={{ marginBottom: 0 }}>{title}</Header>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      {legendItems && legendPosition === "Top" && (
        <Legend className="mt-2 mx-auto" items={legendItems} />
      )}
      {data?.length || dataset2?.length ? (
        <VictoryChart
          height={height}
          width={width}
          theme={VictoryTheme.grayscale}
          scale={{ x: "time" }}
          padding={{ top: 40, left: 60, bottom: 30, right: 20 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }) => {
                // console.log(datum);
                return `${prefix}${datum.y}${suffix}`;
              }}
              voronoiBlacklist={["scatter", "area"]}
            />
          }
        >
          {/* Y axis */}
          <VictoryAxis
            dependentAxis
            tickFormat={(t) =>
              Number.isInteger(t)
                ? `${prefix}${parseFloat(t).toLocaleString("en-US")}${suffix}`
                : null
            }
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
              },
            }}
            standalone={false}
            crossAxis={false}
            tickCount={calcTickCount(data, dataset2)}
          />
          {/* X Axis */}
          <VictoryAxis
            standalone={false}
            tickValues={data.map((d) => d.x)}
            tickFormat={(t) => {
              const dt = new Date(t);
              return `${dt.getMonth() + 1}/${dt.getDate()}`;
            }}
            style={{
              axis: {
                stroke: "#777777",
              },
              tickLabels: {
                color: "#555555",
                fill: "#555555",
                angle: 45,
              },
            }}
            offsetY={xAxisOffset || null}
          />

          {showDataset2Area && (
            <VictoryArea
              name="area"
              style={{
                data: {
                  /*fill: "rgba(107 ,33, 168, 0.1)"*/ fill: "rgba(48,217,124,0.1)",
                },
              }}
              data={dataset2}
            />
          )}
          <VictoryLine
            name="line"
            style={{
              ...dataStyle,
              data: {
                ...dataStyle?.data,
                stroke: dataStyle?.data?.stroke || "#30d97c",
              },
              parent: {
                ...dataStyle?.parent,
                border: dataStyle?.data?.stroke || "1px solid #ccc",
              },
            }}
            data={data}
          />
          {dataset2 && (
            <VictoryLine
              name="line2"
              style={{
                ...dataset2Style,
                data: {
                  ...dataset2Style?.data,
                  stroke: dataset2Style?.data?.stroke || "#ff0000",
                },
                parent: {
                  ...dataset2Style?.parent,
                  border: dataset2Style?.data?.stroke || "1px solid #ccc",
                },
              }}
              data={dataset2}
            />
          )}

          {showDataPoints && (
            <VictoryScatter
              name="scatter"
              style={{ data: { fill: "#333333" } }}
              size={4}
              data={data}
            />
          )}
          {showDataset2Points && (
            <VictoryScatter
              name="scatter"
              style={{ data: { fill: "#333333" } }}
              size={4}
              data={dataset2}
            />
          )}
        </VictoryChart>
      ) : (
        <div className="h-full w-full flex justify-center mt-4">
          <p>No Info</p>
        </div>
      )}
      {legendItems && legendPosition === "Bottom" && (
        <Legend className="mt-2 mx-auto" items={legendItems} />
      )}
    </div>
  );
}

LineChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf({}),
  dataStyle: PropTypes.arrayOf({}),
  dataset2Style: PropTypes.arrayOf({}),
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  showDataPoints: PropTypes.bool,
  showDataset2Area: PropTypes.bool,
  xAxisOffset: PropTypes.number,
  legendPosition: PropTypes.string,
};

LineChart.defaultProps = {
  title: "",
  data: testData2,
  dataStyle: {},
  dataset2Style: {},
  prefix: "",
  suffix: "",
  showDataPoints: true,
  showDataset2Area: false,
  xAxisOffset: PropTypes.number,
  legendPosition: "Top",
};
