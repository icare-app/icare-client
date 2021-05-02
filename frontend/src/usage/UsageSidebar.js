import React from 'react';

import { 
  Nav,
  Stack,
  Text 
} from '@fluentui/react';

const navStyles = {
  root: {
    width: 200,
    height: '100%',
    position: 'fixed',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
};

const groups = [
  {
    links: [
      {
        name: 'App Usage',
        icon: 'Favicon',
        key: 'app_usage'
      },
      {
        name: 'Daily Usage',
        icon: 'GoToToday',
        key: 'daily_usage'
      },
      {
        name: 'Weekly Usage',
        icon: 'CalendarWorkWeek',
        key: 'weekly_usage'
      },
    ],
  },
];

export default class UsageSidebar extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    console.log()
  }


  handleChange(event, item) {
    const key = item.key;
    this.props.onUpdateSelectedKey(key);
  }

  render() {
    return (
      <Stack 
        tokens={{ childrenGap: 12 }} 
        styles={navStyles}>

        <Text variant={'xxLarge'}>
          <b>Statistics</b>
        </Text>
    
        <Nav
          selectedKey={this.props.selectedKey}
          groups={groups}
          onLinkClick={this.handleChange}
        />
  
      </Stack>
    )
  }
}
 
