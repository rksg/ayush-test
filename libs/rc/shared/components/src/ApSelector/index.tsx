import { Form, FormItemProps, Select } from 'antd'
import { useIntl }                     from 'react-intl'
import { useParams }                   from 'react-router-dom'

import { useApListQuery } from '@acx-ui/rc/services'
import { APExtended }     from '@acx-ui/rc/utils'


export interface ApSelectorProps {
  formItemProps?: FormItemProps
  placeholder?: string
  venueId?: string
}

const apListQueryDefaultPayload = {
  fields: ['name', 'serialNumber'],
  pageSize: 10000,
  page: 1,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function ApSelector (props: ApSelectorProps) {
  const { $t } = useIntl()
  const {
    placeholder = $t({ defaultMessage: 'Select AP...' }),
    venueId
  } = props

  const formItemProps = {
    name: 'apSerialNumber',
    label: $t({ defaultMessage: 'AP' }),
    ...props.formItemProps
  }

  const { apOptions } = useApListQuery({
    params: useParams(),
    payload: {
      ...apListQueryDefaultPayload,
      filters: { venueId: venueId ? [venueId] : [] }
    }
  }, {
    selectFromResult ({ data }) {
      return {
        apOptions: data?.data.map((ap: APExtended) => ({
          value: ap.serialNumber,
          label: ap.name ?? ''
        }))
      }
    }
  })

  return (
    <Form.Item {...formItemProps}>
      <Select placeholder={placeholder} options={apOptions} />
    </Form.Item>
  )
}
