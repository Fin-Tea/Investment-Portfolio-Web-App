import {
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
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

export default function LineChart({ title, data, showDataPoints }) {
  return (
    <div>
      <Header style={{ marginBottom: -25 }}>{title}</Header>
      <VictoryChart
        theme={VictoryTheme.grayscale}
        scale={{ x: "time" }}
        padding={{ top: 40, left: 60, bottom: 30, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => {
              console.log(datum);
              return `$${datum.y}`;
            }}
            voronoiBlacklist={["scatter"]}
          />
        }
      >
        {/* Y axis */}
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `$${parseFloat(t).toLocaleString("en-US")}`}
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
        />
        {/* X Axis */}
        <VictoryAxis
          standalone={false}
          tickValues={data.map((d) => d.x)}
          tickFormat={(t) => `${t.getMonth() + 1}/${t.getDate()}`}
          style={{
            axis: {
              stroke: "#777777",
            },
            tickLabels: {
              color: "#555555",
              fill: "#555555",
            },
          }}
        />
        <VictoryLine
          name="line"
          style={{
            data: { stroke: "#30d97c" },
            parent: { border: "1px solid #ccc" },
          }}
          data={data}
        />
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
  showDataPoints: PropTypes.bool,
};

LineChart.defaultProps = {
  title: "",
  data: testData2,
  showDataPoints: true,
};
