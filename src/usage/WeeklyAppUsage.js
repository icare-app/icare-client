import React from "react";
import { Bar, defaults } from "react-chartjs-2"
defaults.global.tooltips.enabled = true;

export default class BarChart extends React.Component {

  constructor(props) {
    super(props);

    // Get Weekly App Usage (unsynced w/ db)
    var usage = store.dataUsage.getAll().fetched.appUsage;

    // Get top 5 most used apps 
    // Kinda Spaghetti Code 

    var mostUsed = {
      "data": [
      ]
    };
    for (var i=0; i<usage.length; i++) {
      mostUsed["data"].push(
        {
          appName: usage[i].appName,
          appTime: usage[i].appTime,
        }
      )
    }
    let sorted = arr => {
      const sorter = (a, b) => {
        return a.appTime - b.appTime;
      };
      arr['data'].sort(sorter);
      return arr;
    }
    sorted(mostUsed);
    var top = mostUsed["data"].slice(-7);
    this.appNames = [];
    this.appTimes = [];
    for (var i=0; i<top.length; i++) {
      this.appNames.push(top[i].appName);
      // convert ms to seconds
      var mins = Math.floor(top[i].appTime / 60000);
      this.appTimes.push(mins);
    };
  }

  render() {
    return (
      <div>
        <Bar
          data={{
            labels: this.appNames,
            datasets: [
              {
                label: "Minutes",
                data: this.appTimes,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.5)",
                  "rgba(54, 162, 235, 0.5)",
                  "rgba(255, 206, 86, 0.5)",
                  "rgb(219,112,147, 0.5)",
                  "rgba(75, 192, 192, 0.5)",
                  "rgba(153, 102, 255, 0.5)",
                  "rgba(255, 159, 64, 0.5)",
                  "rgba(30, 130, 76, 0.5)",
                  "rgba(0, 30, 128, 0.5)",
                  "rgba(149, 165, 166, 0.5)",
                  "rgba(230, 25, 75, 0.5)",
                  "rgba(220, 190, 225, 0.5)",
                  "rgba(245, 130, 48, 0.5)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgb(219,112,147, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                  "rgba(30, 130, 76, 1)",
                  "rgba(0, 30, 128, 1)",
                  "rgba(149, 165, 166, 1)",
                  "rgba(230, 25, 75, 1)",
                  "rgba(220, 190, 225, 1)",
                  "rgba(245, 130, 48, 1)",
                ],
              },
            ],
          }}
          height={400}
          width={30}
          options={{
            title: {
              display: true,
              text: "Weekly Most Used Apps",
              fontColor: "#FFFFFF",
              fontSize: 20,
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    fontColor: "#FFFFFF",
                  },
                },
              ],
              xAxes: [
                {
                  ticks: { fontColor: "#FFFFFF" },
                },
              ],
            },
            maintainAspectRatio: false,
            legend: {
              position: "top",
              labels: {
                fontSize: 15,
                fontColor: "#FFFFFF",
              },
            },
          }}
        />
      </div>
    );
  }
}
