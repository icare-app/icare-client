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
    textAlign: 'center',
};

const iconClass = mergeStyles({
    fontSize: 24,
    height: 24,
    width: 24,
    marginRight: 12,
    color: 'deepskyblue'
});

const buttonStyle = { borderRadius: '10px', width: '120px', height: '30px',  marginLeft: '30px'};

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            remainingTimeString: ''
        };

        breakSys.eventSystem.on('update', (event, breakStatus) => {
            var milliseconds = breakStatus.remainingTime;
            var seconds = Math.floor((milliseconds % 60000) / 1000);

            var remainingTimeString = seconds === 1 ? `${seconds}s` : `${seconds}s`

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
                }}>

                    <Stack horizontal token={{childrenGap: 50}}>
                        <Stack.Item>
                            <FontIcon iconName='RedEye' className={iconClass} />
                        </Stack.Item>

                        <Stack.Item>
                            <Stack>
                                <Text variant={'large'} style={{marginBottom: '3px'}}> <b>Time for a break </b> </Text>
                                <span>
                                    <Text variant={'large'}>
                                        {this.state.remainingTimeString}
                                    </Text> 
                                    <Text variant={'medium'}> remaining</Text> 
                                    <DefaultButton
                                    text='End'
                                    iconProps={{ iconName: 'AlarmClock' }}
                                    onClick={breakSys.endBreak}
                                    style={buttonStyle}
                                    width='100px'
                                    />
                                </span>
                                <Text variant={'small'}> Timer resets upon mouse movement </Text>
                            </Stack>
                        </Stack.Item>
                        
                    </Stack>

                </div>

            </div>

        );
    }
}

