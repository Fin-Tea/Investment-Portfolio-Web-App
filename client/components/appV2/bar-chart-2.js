import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const data = [
  { name: 'Your Portfolio', roi: 12 },
  { name: 'S&P 500', roi: 10 },
  { name: 'NASDAQ 100', roi: 18 },
  { name: 'DOW JONES', roi: 9 },
];

const BarChart2 = () => {
  return (
    <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis dataKey="name" />
      <YAxis label={{ value: 'ROI', angle: -90, position: 'insideLeft' }} tickFormatter={(val) => `${val}%`} />
      <Tooltip formatter={(val) => `${val}%`} />
      {/* <Legend /> */}
      <Bar dataKey="roi" fill="#9333ea" />
    </BarChart>
  );
};

export default BarChart2;