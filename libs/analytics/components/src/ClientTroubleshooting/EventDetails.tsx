import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Descriptions } from '@acx-ui/components'
import { CloseSymbol }  from '@acx-ui/icons'

import * as UI from './styledComponents'

export const Details = ({ fields, openHandler, extra, actions }: {
  fields: Array<{ label: string, value: string }>,
  openHandler: () => void,
  extra?: ReactNode,
  actions?: ReactNode,
}) => {
  const { $t } = useIntl()
  return <UI.DetailsWrapper>
    <UI.CloseIconContainer onClick={openHandler}><CloseSymbol /></UI.CloseIconContainer>
    <UI.Header>{$t({ defaultMessage: 'Connection Event Details' })}</UI.Header>
    <UI.Body>
      <UI.ListDetails>
        <Descriptions>
          {fields.map((field, index) =>
            <Descriptions.Item
              key={index}
              label={field.label}
              children={field.value}
            />
          )}
        </Descriptions>
        {actions}
      </UI.ListDetails>
      {extra && <><UI.VerticalLine />{extra}</>}
    </UI.Body>
  </UI.DetailsWrapper>
}