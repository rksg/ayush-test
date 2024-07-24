import { storiesOf } from '@storybook/react'

import { TimeDropdown } from '.'

storiesOf('TimeDropdown', module)
    .add('Sample', () => {
        return <>
            <div>
                <TimeDropdown timeType='Daily' name='daily' />
            </div>
            <div style={{ paddingTop: '100px' }}>
                <TimeDropdown timeType='Weekly' name='weekly' />
            </div>
            <div style={{ paddingTop: '100px' }}>
                <TimeDropdown timeType='Monthly' name='monthly' />
            </div>
        </>

    })
export {}