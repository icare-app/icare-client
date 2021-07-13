import React from "react";
import { Bar, defaults } from "react-chartjs-2"

defaults.global.tooltips.enabled = true;


export default class BarChart extends React.Component {

  constructor(props) {


    // Get fetched weekly timer usage. 
    let usage = store.dataUsage.getAll().fetched.timerUsage;
    
    // If timer usage in past 7 days, get weekday name and screen time.
    super(props);

    this.labels = [];
    this.usage = [];
    this.breaks = [];

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    for (var i=weekdays.length-1; i>=0; i--) {
      var day = new Date();
      // get i'th day before today. 
      day.setDate(day.getDate() - i);
      // If recent timer usage, add weekday and usage to graph.
      for (var j=0; j<usage.length; j++) {
        var usageDay = usage[j].usageDate.split("T")[0];
        var formatted = this.getFormatted(day);
        if (usageDay == formatted) {
          this.labels.push(weekdays[day.getDay()]);
          this.usage.push(usage[j].screenTime/60000);
          this.breaks.push(usage[j].timerCount);
        }
      }
    }
  }

  // Returns formatted string from Date object. 
  // Given "Sun May 02 2021 01:48:55 GMT-0700 (Pacific Daylight Time)"
  // Returns "2021-05-02"
  getFormatted(date) {
    var year = date.getFullYear();
    var month = ("00" + (date.getMonth() + 1)).substr(-2, 2);
    var day = ("00" + date.getDate()).substr(-2, 2);
    return  `${year}-${month}-${day}`;
  }

  render() {
    return (
      <div>
        <Bar
          data={{
            labels: this.labels,
            datasets: [
              {
                label: "Screen usage (Minutes)",
                data: this.usage,
                backgroundColor: [
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                  "rgba(72, 121, 240, 1)",
                ],
              },
              {
                label: "Total # of breaks",
                data: this.breaks,
                backgroundColor: "lightblue",
              },
            ],
          }}
          height={400}
          width={30}
          options={{
            title: {
              display: true,
              text: "Weekly Timer Usage",
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
