import React from "react";
import { defaults } from "react-chartjs-2"
import { Text } from '@fluentui/react/lib/Text';
import CountUp from 'react-countup';
defaults.global.tooltips.enabled = true;

export default class TimerUsage extends React.Component {

  constructor(props) {
    super(props);

    // Get fetched weekly timer usage.
    var usage = store.dataUsage.getAll().fetched.timerUsage


    // Get todays timer usage
    var todaysDate = getToday() + 'T00:00:00.000Z';
    var todaysUsage = usage.filter(obj => {
      return obj.usageDate === todaysDate;
    })
    this.mins = 0;
    this.secs = 0;
    var screenTime = todaysUsage.screenTime;
    if (screenTime != null) {
      // convert millisec -> mins
      this.mins = Math.floor(screenTime/60000);
      // convert secs -> mins
      this.secs = Math.floor(screenTime%60000);
    }
    this.breaksToday = 0;
    if (todaysUsage.timerCount != null) { this.breaksToday = todaysUsage.timerCount };


    // Get weekly timer usage
    var usageWeek = 0;
    this.breaksWeek = 0;
    for (var i=0; i<usage.length; i++) {
      usageWeek += usage[i].screenTime;
      this.breaksWeek += usage[i].timerCount;
    }
    this.minsWeek = Math.floor(usageWeek/60000);
    this.secsWeek = Math.floor(usageWeek%60000);
  }

  render() {

    // Avoids "You took 1 breaks today" 
    this.todayStr = ' breaks today'
    if (this.breaksToday == 1) this.todayStr = ' break today';
    this.weekStr = ' breaks this week';
    if (this.breaksWeek == 1) this.weekStr = ' break this week'
    
    return (
      <div style={{textAlign: 'center'}}>
          {/* Daily Timer Usage*/}
          <Text variant={"xxLarge"} block>
            Todays Timer Usage
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            <div style={{color: 'green'}}>
                <CountUp start={0} end={this.mins} /> minutes { } 
                <CountUp start={0} end={this.secs} /> seconds
            </div> 
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            You've taken { }
            <span style={{color: 'green'}}>
              <CountUp start={0} end={this.breaksToday} /> 
            </span>  
            {this.todayStr}
          </Text>

          {/* Weekly Timer Usage */}
          <div style={{marginTop: 50}}>
          <Text variant={"xxLarge"} block>
            Weekly Timer Usage
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            <div style={{color: 'green'}}>
                <CountUp start={0} end={this.minsWeek} /> minutes { } 
                <CountUp start={0} end={this.secsWeek} /> seconds
            </div> 
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            You've taken { }
            <span style={{color: 'green'}}>
              <CountUp start={0} end={this.breaksWeek} /> 
            </span>  
            {this.weekStr}
          </Text>
          </div>
      </div>
    );
  }
}
