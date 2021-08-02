import React from 'react';

import { 
    mergeStyles,
    FontIcon,
    Stack,
    Text,
    DefaultButton
} from '@fluentui/react';

const divStyle = {
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
};

const iconClass = mergeStyles({
    fontSize: 24,
    height: 24,
    width: 24,
    marginRight: 12,
    color: 'deepskyblue'
});

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            remainingTimeString: ''
        };

        breakSys.eventSystem.on('update', (event, breakStatus) => {
            var milliseconds = breakStatus.remainingTime;
            var seconds = Math.floor((milliseconds % 60000) / 1000);

            var remainingTimeString = seconds === 1 ? `${seconds} second left` : `${seconds} seconds remaining`

            this.setState({
                remainingTimeString: remainingTimeString,
            });

        })
    }
    
    componentDidMount() {
        breakSys.getStatus();
        setInterval(breakSys.getStatus, 100);
    }

    render() {
        return (    
            <div style={divStyle}>
                
                <div style={{
                    position: 'absolute', 
                    paddingTop: '12px', 
                    paddingLeft: '18px',
                    textAlign: 'center',
                }}>

                    <Stack horizontal token={{childrenGap: 32}}>
                        <Stack.Item>
                            <FontIcon iconName='RedEye' className={iconClass} />
                        </Stack.Item>

                        <Stack.Item>
                            <Stack>
                                <Text variant={'large'}> <b>Time for a break </b> </Text>
                                    <Text variant={'medium'} align='center'>
                                        {this.state.remainingTimeString}
                                    </Text>
                                <span style={{marginTop: '3px'}}>
                                    <DefaultButton
                                            text='Snooze'
                                            iconProps={{ iconName: 'Snooze' }}
                                            width='30'
                                    />
                                    <DefaultButton
                                    text='End'
                                    iconProps={{ iconName: 'Clear' }}
                                    onClick={breakSys.endBreak}
                                    width='30'
                                    />
                                </span>
                            </Stack>
                        </Stack.Item>
                        
                    </Stack>

                </div>

            </div>

        );
    }
}

