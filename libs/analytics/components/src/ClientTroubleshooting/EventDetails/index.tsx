import { Fragment, ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'


const detailsRowList = ({ fields }: { fields: Array<{ label: string, value: string }> }) => {
  return fields.map((field, index) =>
    <Fragment key={index}>
      <UI.RowLabel>{field.label}</UI.RowLabel>
      <UI.RowValue>{field.value}</UI.RowValue>
    </Fragment>)
}

export const Details = ({ fields, openHandler, extra }: {
  fields: Array<{ label: string, value: string }>,
  openHandler?: () => void,
  extra?: ReactNode
}) => {
  const { $t } = useIntl()
  return <>
    <UI.Header>
      {openHandler && <UI.CloseSpan onClick={openHandler}><CloseSymbol /></UI.CloseSpan>}
      {$t({ defaultMessage: 'Connection Event Details' })}
    </UI.Header>
    {
      (extra)
        ? <UI.ColumnContainer>
          <UI.RowContainer>
            {detailsRowList({ fields })}
          </UI.RowContainer>
          <UI.VerticalLine />
          {extra}
        </UI.ColumnContainer>
        : <UI.RowContainer>
          {detailsRowList({ fields })}
        </UI.RowContainer>
    }
  </>
}