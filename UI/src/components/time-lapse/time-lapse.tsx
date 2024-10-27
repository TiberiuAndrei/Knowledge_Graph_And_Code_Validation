"use client"
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import styles from "./time-lapse.module.css"

const data = [
  {
    name: '16/12/2023',
    "Complete Design Requirements" : 1,
    "Incomplete Design Requirements": 102
  },
  {
    name: '16/1/2024',
    "Complete Design Requirements" : 1,
    "Incomplete Design Requirements": 102
  },
  {
    name: '16/2/2024',
    "Complete Design Requirements" : 1,
    "Incomplete Design Requirements": 102
  },
  {
    name: '6/19/2024',
    "Complete Design Requirements": 11,
    "Incomplete Design Requirements": 106
  },
  {
    name: '8/18/2024',
    "Complete Design Requirements": 77,
    "Incomplete Design Requirements": 45
  },
]

export default function TimeLapse() {
  return (
    <ResponsiveContainer>
        <LineChart width={500} height={300} data={data} className={styles.chart}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
            dataKey="Complete Design Requirements"
            stroke="green"
            activeDot={{ r: 8 }}
        />
        <Line dataKey="Incomplete Design Requirements" stroke="red"/>
        </LineChart>
    </ResponsiveContainer>
  );
}
