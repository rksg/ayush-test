import React from 'react'

import { useIntl } from 'react-intl'

import { getRCCDFlow } from './sequenceMap'
import * as UI         from './styledComponents'

const fillOne = (index: number) => `${index + 1} / ${index + 2}`

export const ConnectionSequenceDiagram = ({ messageIds, failedMsgId, apMac }:
  {
    messageIds: Array<string>,
    failedMsgId: string,
    apMac: string }
) => {
  const { $t } = useIntl()
  if (!(messageIds && messageIds.length)) return null

  const { layers, steps } = getRCCDFlow({ messageIds, failedMsgId })

  return (
    <UI.Wrapper layers={layers}>
      {layers.map((layer, index) => <UI.Layer
        key={`layer-${index}`}
        style={{ gridColumn: fillOne(index) }}
        children={<span>{$t(layer, { apMac })}</span>}
      />)}
      <UI.Container layers={layers}>
        {steps.map((step, index) => (
          <React.Fragment key={`step-${index}`}>
            <UI.StepLabel
              style={{ gridRow: fillOne(index) }}
              title={$t(step.label)}
              children={$t(step.label)}
            />
            <UI.StepFlow
              style={{
                gridColumn: step.column.map(v => v + 1).join(' / '),
                gridRow: fillOne(index)
              }}
              state={step.state}
              direction={step.direction}
            />
          </React.Fragment>
        ))}
      </UI.Container>
    </UI.Wrapper>
  )
}