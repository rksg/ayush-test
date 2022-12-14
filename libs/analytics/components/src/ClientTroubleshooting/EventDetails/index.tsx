import { Fragment, ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'


const DetailsRow = ({ label, value }: { label: string, value: string }) => {
  return <Fragment key={value}>
    <UI.RowLabel>{label}</UI.RowLabel>
    <UI.RowValue>{value}</UI.RowValue>
  </Fragment>
}

const detailsRowList = ({ fields }: { fields: Array<{ label: string, value: string }> }) => {
  return fields.map((field, index) =>
    <DetailsRow
      key={index}
      label={field.label}
      value={field.value}
    />)
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