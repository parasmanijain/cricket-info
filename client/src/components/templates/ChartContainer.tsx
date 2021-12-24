import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import { chartColors } from '../../helper';
import { RenderChart } from './RenderChart';
import { Box } from '../lib';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

export const ChartContainer = (props:any) => {
  const { title, fullHeight, apiData } = props;
  const [chartData, setChartData] = useState([]);
  const [width, height] = useWindowDimensions();
  const chunkSize = width>= 1536 ? 50 : width>= 1200 ? 40 : width>= 900 ? 30 : width>=600 ? 20 : 10;


  const fetchData = () => {
    let chartDetails = [];
    const westIndies = ['Antigua and Barbuda', 'Barbados', 'Dominica', 'Grenada', 'Guyana', 'Jamaica',
      'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago'];
    if (apiData.length && title.toLowerCase().includes('grounds')) {
      const westIndiesData = apiData.filter((ele)=> westIndies.includes(ele.name));
      const otherCountriesData = apiData.filter((ele)=> !westIndies.includes(ele.name));
      console.log(westIndiesData);
      console.log(otherCountriesData);
      let data = [];
      let labels = [];

      westIndiesData.forEach((element, i, arr)=> {
        data= [];
        labels = [];
        let grounds = 0;
        element.city.forEach((e1)=> {
          grounds+=e1.ground.length;
          e1.ground.forEach((e)=> {
            labels.push(e.name);
            data.push(e.length);
          });
        });
        const obj = {
          subtitle: element.name,
          width: ((width-50)/arr.length)*2,
          labels,
          datasets: [
            {
              label: 'Matches',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ] };
        chartDetails = [...chartDetails, obj];
      });
      otherCountriesData.forEach((element)=> {
        data= [];
        labels = [];
        element.city.forEach((e1)=> {
          e1.ground.forEach((e)=> {
            labels.push(e.name);
            data.push(e.length);
          });
        });
        const obj = {
          subtitle: element.name,
          width: width-50,
          labels,
          datasets: [
            {
              label: 'Matches',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ] };
        chartDetails = [...chartDetails, obj];
      });
    }
    setChartData(chartDetails);
  };

  useEffect(() => {
    fetchData();
    return () => {
      setChartData([]);
    };
  }, [apiData]);
  return (
    <Box>
      {[...chartData].length && [...chartData].map((data, index) =>
        <RenderChart key = {index} title = {title} width = {data.width} data = {data} subtitle = {data.subtitle}index = {index}
          canvasHeight = {(!fullHeight ? chartData.length> 1 ? height>500? height/2: height : height: height/2)-50}/>)}
    </Box>
  );
};
