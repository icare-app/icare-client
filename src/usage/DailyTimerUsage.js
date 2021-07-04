import React from "react";
import { defaults } from "react-chartjs-2"
import { Text } from '@fluentui/react/lib/Text';
import CountUp from 'react-countup';
defaults.global.tooltips.enabled = true;

export default class DailyTimerUsage extends React.Component {

  constructor(props) {
    super(props);
    this.state = store.dataUsage.getAll();

    // Get list of timer usage days.
    var timerUsageList = this.state.fetched.timerUsage;
    this.todaysUsage = 0;

    // Get todays timer usage from list of days.
    var todaysDate = getToday() + 'T00:00:00.000Z';
    console.log('todaysDate : ' + todaysDate);
    var i, usageObj;
    for (i=0; i<timerUsageList.length; i++) {
      usageObj = timerUsageList[i];
      if (usageObj.usageDate === todaysDate) {
        this.todaysUsage = usageObj;
      }
    }

    if (this.todaysUsage.screenTime == null) {
      this.minutes = 0;
      this.seconds = 0;
    }
    else {
      this.minutes = Math.floor(this.todaysUsage.screenTime/60);
      this.seconds = Math.floor(this.todaysUsage.screenTime%60);
    }
  }

  render() {
    // Since this screen displays, "You've taken X breaks today"
    // If user took one break, display 'break today' instead of 'breaks today'
    let endingBreakStr, minuteStr = '';
    if (this.todaysUsage.timerCount == 1) {
      endingBreakStr = 'break today';
    }
    else {
      endingBreakStr = 'breaks today';
    }
    minuteStr = 'minutes';
    if (this.minutes == 1) {
      minuteStr = 'minute'
    }

    let breaks = 0;
    if (this.todaysUsage.timerCount != null) {
      breaks = this.todaysUsage.timerCount;
    }
    
    return (
      <div style={{textAlign: 'center', marginTop: 50}}>
        {/* Screen Usage Duration */}
        <Text variant={"xxLarge"} block>
          Today's Timer Usage
        </Text>
        <Text variant={"xxLarge"} style={{marginTop: 25}} block>
          <div style={{color: 'green'}}>
              <CountUp start={0} end={this.minutes} /> {minuteStr} { } 
              <CountUp start={0} end={this.seconds} /> seconds
          </div> 
        </Text>
        {/*  Number of Breaks */}
        <Text variant={"xxLarge"} style={{marginTop: 25}} block>
          You've taken 
          <span style={{color: 'green'}}>
            <CountUp start={0} end={breaks} /> 
          </span>  
          {} {endingBreakStr}
        </Text>
      </div>
    );
  }
}
