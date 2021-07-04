import React from "react";
import { Bar, defaults } from "react-chartjs-2"

defaults.global.tooltips.enabled = true;

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default class BarChart extends React.Component {

  constructor(props) {
    super(props);

    // Get apps names & usage from unsynced.
    this.labels = [];
    this.usage = [];
    this.appUsage = store.dataUsage.getAll().fetched.appUsage;
    for (var i=0; i < this.appUsage.length; i++) {
      this.labels.push(this.appUsage[i].appName);
      var appTime = this.appUsage[i].appTime;
      this.usage.push(Math.floor(appTime/60000));
    }
  }

  render() {
    return (
      <div>
        <Bar
          data={{
            labels: this.labels,
            datasets: [
              {
                label: "Seconds",
                data: this.usage,
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
              position: "right",
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
