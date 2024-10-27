import React from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Rnd } from "react-rnd";

export const Statistcs = (props: any) => {
  return (
    <div style={{width: "100%", height:"100%"}}>
      <Rnd
            default={{
            x: 100,
            y: 20,
            width: "40%",
            height: "40%"
            }}
        >
        <ResponsiveContainer style={{backgroundColor:"white"}}>
          <BarChart
            width={500}
            height={300}
            data={props.data["EaChecks"]}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Number of Design Requirements" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          </BarChart>
        </ResponsiveContainer>
      </Rnd>

      <Rnd
            default={{
            x: 450,
            y: 400,
            width: "40%",
            height: "40%"
            }}
        >
        <ResponsiveContainer style={{backgroundColor:"white"}}>
          <BarChart
            width={500}
            height={300}
            data={props.data["FunctionContributions"]}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Number of Function Contributions" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          </BarChart>
        </ResponsiveContainer>
      </Rnd>

      <Rnd
          default={{
          x: 900,
          y: 20,
          width: "40%",
          height: "40%"
          }}
      >
        <ResponsiveContainer style={{backgroundColor:"white"}}>
          <BarChart
            width={500}
            height={300}
            data={props.data["DesginRequirementRiewState"]}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Number of Design Requirements" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          </BarChart>
        </ResponsiveContainer>
      </Rnd>
    </div>
  );
}