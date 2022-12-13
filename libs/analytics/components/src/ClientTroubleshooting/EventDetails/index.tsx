import { Fragment, Attributes } from 'react'

import { useIntl } from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'


const DetailsRow = ({ key, label, value }:
  { key: Attributes['key'], label: string, value: string }) => {
  return <Fragment key={key}>
    <UI.RowLabel>{label}</UI.RowLabel>
    <UI.RowValue>{value}</UI.RowValue>
  </Fragment>
}

const Details = ({ fields, openHandler }: {
  fields: Array<{ label: string, value: string }>,
  openHandler?: () => void
}) => {
  const { $t } = useIntl()
  return <>
    <UI.Header>
      {openHandler && <UI.CloseSpan onClick={openHandler}><CloseSymbol /></UI.CloseSpan>}
      {$t({ defaultMessage: 'Connection Event Details' })}
    </UI.Header>
    <UI.RowContainer>
      {fields.map((field, index) =>
        <DetailsRow
          key={index}
          label={field.label}
          value={field.value}
        />
      )}
    </UI.RowContainer>
  </>
}

export default Details
