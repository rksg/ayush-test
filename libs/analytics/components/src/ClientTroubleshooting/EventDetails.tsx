import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'
import { CloseSymbol }      from '@acx-ui/icons'

import * as UI from './styledComponents'

export const Details = ({ fields, openHandler, extra }: {
  fields: Array<{ label: string, value: string }>,
  openHandler: () => void,
  extra?: ReactNode
}) => {
  const { $t } = useIntl()
  return <UI.DetailsWrapper>
    <UI.CloseIconContainer onClick={openHandler}><CloseSymbol /></UI.CloseIconContainer>
    <UI.Header>{$t({ defaultMessage: 'Connection Event Details' })}</UI.Header>
    <UI.Body>
      <UI.ListDetails>
        {fields.map((field, index) =>
          <GridRow key={index}>
            <GridCol col={{ span: 8 }}>
              <UI.DetailsRowLabel>{field.label}</UI.DetailsRowLabel>
            </GridCol>
            <GridCol col={{ span: 16 }}>
              <UI.DetailsRowValue>{field.value}</UI.DetailsRowValue>
            </GridCol>
          </GridRow>
        )}
      </UI.ListDetails>
      {extra && <><UI.VerticalLine />{extra}</>}
    </UI.Body>
  </UI.DetailsWrapper>
}