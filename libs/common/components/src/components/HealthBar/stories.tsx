import React from 'react'

import { storiesOf } from '@storybook/react'
import styled        from 'styled-components/macro'

import { HealthBar } from '.'


const LabelContainer = styled.div`
    width: 70px;
`
const FlexLayout = styled.div`
    display:flex;
    margin-bottom: 5px;
`

storiesOf('HealthBar', module)
  .add('Basic', () => <>

    <FlexLayout>
      <LabelContainer>Excellent: </LabelContainer>
      <HealthBar value={0.9} />
    </FlexLayout>

    <FlexLayout>
      <LabelContainer>Moderate: </LabelContainer>
      <HealthBar value={0.4} />
    </FlexLayout>

    <FlexLayout>
      <LabelContainer>Poor: </LabelContainer>
      <HealthBar value={0.1} />
    </FlexLayout>
  </>)
  .add('custom', () =>
    <FlexLayout>
      <div>Specified block number: </div>
      <div>
        <p>
          <HealthBar value={0.9} blockNumber={40} />
        </p>
        <p>
          <HealthBar value={0.3} blockNumber={40} />
        </p>
        <p>
          <HealthBar value={0.1} blockNumber={40} />
        </p>
        <p>
          <HealthBar value={0.3} blockNumber={5} />
        </p>
        <p>
          <HealthBar value={0.2} blockNumber={5} />
        </p>
      </div>
    </FlexLayout>
  )

export {}
