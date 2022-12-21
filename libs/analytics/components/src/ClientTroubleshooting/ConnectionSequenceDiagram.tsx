import React from 'react'

import { IntlShape, useIntl } from 'react-intl'

import * as UI         from './sequenceComponents'
import { getRCCDFlow } from './sequenceMap'

const fillOne = (index: number) => `${index + 1} / ${index + 2}`
const translatedChildren = (
  layer: string | (({ apMac }: { apMac: string }) => string),
  apMac: string, intl: IntlShape) =>
  (typeof layer === 'string')
    ? intl.$t({ defaultMessage: '{layer}' }, { layer })
    : layer({ apMac })

export const ConnectionSequenceDiagram = ({ messageIds, failedMsgId, apMac }:
  {
    messageIds: Array<string>,
    failedMsgId: string,
    apMac: string }
) => {
  const intl = useIntl()
  if (!(messageIds && messageIds.length)) return null

  const { layers, steps } = getRCCDFlow({ messageIds, failedMsgId })

  return (
    <UI.Wrapper layers={layers}>
      {layers.map((layer, index) => <UI.Layer
        key={`layer-${index}`}
        style={{ gridColumn: fillOne(index) }}
        children={<span>{translatedChildren(layer, apMac, intl)}</span>} // find a way for dynamic intl
      />)}
      <UI.Container layers={layers}>
        {steps.map((step, index) => (
          <React.Fragment key={`step-${index}`}>
            <UI.StepLabel
              style={{ gridRow: fillOne(index) }}
              state={step.state}
              title={step.label}
              children={step.label}
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