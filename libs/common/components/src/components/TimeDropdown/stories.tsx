import { storiesOf } from '@storybook/react'

import { TimeDropdown } from '.'
import { Row } from 'antd'

storiesOf('TimeDropdown', module)
    .add('Sample', () => {
        return <>
            <Row>
                <TimeDropdown timeType='Daily' name='daily' />
            </Row>
            <Row>
                <div style={{ paddingTop: '100px' }}>
                    <TimeDropdown timeType='Weekly' name='weekly' />
                </div>
            </Row>
            <Row>
                <div style={{ paddingTop: '100px' }}>
                    <TimeDropdown timeType='Monthly' name='monthly' />
                </div>
            </Row>
        </>

    })
export {}