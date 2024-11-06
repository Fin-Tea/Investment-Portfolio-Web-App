import React, { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../testPortfolioData';

const data2 = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const rawData = [
    { securitySymbol: 'AMZN',  securityName: 'Amazon', quanity: 12 },
    { securitySymbol: 'TSLA', securityName: 'Tesla', quanity: 10 },
    { securitySymbol: 'SPY', securityName: 'S&P 500', quanity: 5 },
  ];

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const RADIAN = Math.PI / 180;
    const x = cx + (outerRadius + innerRadius) / 2 * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius + innerRadius) / 2 * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {name} ({value})
      </text>
    );
  };

  const CustomLegend = ({ data }) => {
    return (
      <ul>
        {data.map((entry, index) => (
          <li key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}%`}
          </li>
        ))}
      </ul>
    );
  };

  const renderLegendLabel = (value, entry) => {
    console.log("value", value);
    console.log("entry", entry);
    return `${value} ${entry.payload.percent * 100}%`;
  };

  const renderTooltipLabel = (value, entry) => {
    console.log("value", value);
    console.log("entry", entry);
    return `${value}%`;
  };

export default function PieChart2 ({ data, title }) { 
    const [chartWidth, setChartWidth] = useState(0);
    const titleRef = useRef(null);
  
    // useEffect(() => {
    //   // Calculate the width based on the title
    //   // FIX: The logic must be based on the size of the chart itself
    //   console.log("titleRef", titleRef);
    //   if (titleRef.current && !chartWidth ) {
    //     const titleWidth = titleRef.current.offsetWidth; // Get the width of the title
    //     console.log("titleWidth", titleWidth);
    //     const padding = 250; // Additional padding
    //     setChartWidth(titleWidth + padding);
    //   }
    // }, [titleRef]);
  
    console.log("pie data", data);
    
    return (
        <div>
        <div style={{width: 400, height: 300}} className='relative text-center'>
             <ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      label={(entry) => `${entry.name}`} // Custom label function ${entry.value}%
     // label={renderLabel}
      outerRadius={80}
      fill="#8884d8"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={renderTooltipLabel} />
    {/* <Legend 
      verticalAlign="top" 
      align="right" 
      layout="vertical" 
      wrapperStyle={{ paddingLeft: '20px', marginBottom: '10px' }} // Adjust legend position
    //  content={<CustomLegend data={data} />}
    formatter={renderLegendLabel}
    /> */}
  </PieChart>
  </ResponsiveContainer>
  <h3 ref={titleRef} className='absolute m-0 bottom-4 text-sm w-full text-nowrap w-fit left-1/2 -translate-x-1/2'>{title}</h3>
  </div>
  
  </div>
)};
