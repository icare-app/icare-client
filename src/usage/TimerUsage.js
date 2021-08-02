import React from "react";
import { defaults } from "react-chartjs-2"
import { Text } from '@fluentui/react/lib/Text';
import CountUp from 'react-countup';
defaults.global.tooltips.enabled = true;

export default class TimerUsage extends React.Component {

  constructor(props) {
    super(props);

    var usage = store.dataUsage.getAll().fetched.timerUsage

    // Get todays timer usage
    var todaysDate = getToday() + 'T00:00:00.000Z';
    var todaysUsage = usage.filter(obj => {
      return (obj.usageDate === todaysDate);
    })
    todaysUsage = todaysUsage[0]
    var screenTime = (todaysUsage == null ? 0 : todaysUsage.screenTime)
    var totalMins = (screenTime == null ? 0 : Math.floor(screenTime/60000))
    this.hours = (totalMins == null ? 0 : Math.floor(totalMins/60));
    this.mins = totalMins%60;
    this.breaksToday = (todaysUsage == null ? 0 : todaysUsage.timerCount)
    console.log('hours : ' + this.hours);

    // Gets this week's timer usage
    var usageWeek = 0;
    this.breaksWeek = 0;
    for (var i=0; i<usage.length; i++) {
      usageWeek += usage[i].screenTime;
      this.breaksWeek += usage[i].timerCount;
    }
    var totalMinsWeek = Math.floor(usageWeek/60000);
    this.hoursWeek = Math.floor(totalMinsWeek/60);
    this.minsWeek = totalMinsWeek%60;
    console.log('hours week : ' + this.hours);

    // Removes extra 's' from strings if needed.
    // Avoids "You took 1 breaks" etc. 
    this.todayStr = (this.breaksToday == 1 ? ' break today' : ' breaks today');
    this.weekStr = (this.breaksWeek == 1 ? ' break this week' : ' breaks this week');
    this.hoursStr = (this.hours == 1 ? ' 1 hour ' : (this.hours + ' hours '));
    this.hoursWeekStr = (this.hoursWeek == 1 ? ' 1 hour ' : (this.hoursWeek + ' hours '));

    if (this.hours == 0) this.hoursStr = ''
    if (this.hoursWeek == 0) this.hoursWeekStr = '';
  }

  render() {

    return (
      <div style={{textAlign: 'center'}}>

        {/* Daily Timer Usage*/}
        <div style={{display: 'inline-block', padding: '5px'}}>
          <Text variant={"xxLarge"} style={{borderBottom: '1px solid white'}} block>
            Todays Timer Usage
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            <div style={{color: 'green'}}>
                {this.hoursStr}
                <CountUp start={0} end={this.mins} /> minutes { } 
            </div> 
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            You've taken { }
            <span style={{color: 'green'}}>
              <CountUp start={0} end={this.breaksToday} /> 
            </span>  
            {this.todayStr}
          </Text>
        </div>

        {/* Weekly Timer Usage */}
        {/* Only displayed if previous usage day exists */}
        {this.hours != this.hoursWeek &&
          <div style={{marginTop: 50, display: 'inline-block', padding: '5px'}}>
          <Text variant={"xxLarge"} style={{borderBottom: '1px solid white'}} block>
            Weekly Timer Usage
          </Text>
          <Text variant={"xxLarge"} style={{marginTop: 25}} block>
            <div style={{color: 'green'}}>
                {this.hoursWeekStr}
                <CountUp start={0} end={this.minsWeek} /> minutes { } 
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
        }

      </div>
    );
  }
}
