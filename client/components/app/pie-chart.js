import { VictoryPie } from "victory";
import Header from "../header";
import Tooltip from "./tooltip";
import PropTypes from "prop-types";

export default function PieChart({
  title,
  height = 400,
  width = 100,
  colorScale,
  data,
  tooltip
}) {
  const style = {};

  if (data.some((datum) => !!datum.color)) {
    style.data = { fill: ({ datum }) => datum.color || null };
  }

  return (
    <div>
      <div className="flex justify-center items-center">
        <Header style={{ marginBottom: 0 }}>{title}</Header>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      {data?.length ? (
        <VictoryPie
          colorScale={colorScale}
          height={height}
          width={width}
          name="pie"
          style={style}
          data={data}
        />
      ) : (
        <div className="h-full w-full flex justify-center mt-4">
          <p>No Info</p>
        </div>
      )}
    </div>
  );
}

PieChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf({ x: PropTypes.string, y: PropTypes.number }),
};

PieChart.defaultProps = {
  title: "",
  data: [],
};
