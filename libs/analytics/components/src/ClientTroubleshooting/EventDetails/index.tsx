import { Fragment, Attributes } from 'react'

import { useIntl } from 'react-intl'

import * as UI from './styledComponents'


const DetailsRow = ({ key, label, value }:
  { key: Attributes['key'], label: string, value: string }) => {
  return <Fragment key={key}>
    <UI.RowLabel>{label}</UI.RowLabel>
    <UI.RowValue>{value}</UI.RowValue>
  </Fragment>
}

const Details = ({ fields }: { fields: Array<{ label: string, value: string }> }) => {
  const { $t } = useIntl()
  return <>
    <UI.Header>{$t({ defaultMessage: 'Connection Event Details' })}</UI.Header>
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
