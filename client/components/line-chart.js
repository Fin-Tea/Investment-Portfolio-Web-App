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
import styles from "./line-chart.module.css";
import PropTypes from "prop-types";

const testData2 = [
  { x: new Date("2021-12-27"), y: 11000 },
  { x: new Date("2021-12-28"), y: 10300 },
  { x: new Date("2021-12-29"), y: 9700 },
  { x: new Date("2021-12-30"), y: 9800 },
  { x: new Date("2021-12-31"), y: 10011 },
];

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
  xAxisOffset
}) {
  return (
    <div>
      <Header style={{ marginBottom: 0 }}>{title}</Header>
      <VictoryChart
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
            `${prefix}${parseFloat(t).toLocaleString("en-US")}${suffix}`
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
            },
          }}
          offsetY={xAxisOffset || null}
        />

{showDataset2Area && (
          <VictoryArea name="area" style={{ data: { /*fill: "rgba(107 ,33, 168, 0.1)"*/ fill: "rgba(48,217,124,0.1)" } }} data={dataset2} />
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
      </VictoryChart>
    </div>
  );
}

LineChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf({}),
  dataStyle:  PropTypes.arrayOf({}),
  dataset2Style:  PropTypes.arrayOf({}),
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  showDataPoints: PropTypes.bool,
  showDataset2Area: PropTypes.bool,
  xAxisOffset: PropTypes.number

};

LineChart.defaultProps = {
  title: "",
  data: testData2,
  dataStyle:  {},
  dataset2Style:  {},
  prefix: "",
  suffix: "",
  showDataPoints: true,
  showDataset2Area: false,
  xAxisOffset: PropTypes.number
};
