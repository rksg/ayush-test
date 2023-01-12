import {
  Form,
  Input,
  Select
} from 'antd'
import { useIntl } from 'react-intl'


import { Subtitle }              from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'

import AAAInstance from '../AAAInstance'


const { Option } = Select

const { useWatch } = Form

export function CloudpathServerForm () {
  const { $t } = useIntl()

  const selectedId = useWatch('cloudpathServerId')
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selectOptions: data?.map(item => <Option key={item.id}>{item.name}</Option>) ?? [],
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })
  return (
    <>
      <AAAInstance serverLabel={$t({ defaultMessage: 'Cloudpath Server' })}
        type='authentication'/>
      {selected && (<>
        <Form.Item
          label={$t({ defaultMessage: 'Deployment Type' })}
          children={selected.deploymentType}
        />
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Radius Authentication Service' }) }
        </Subtitle>
        <Form.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            selected.authRadius.primary.ip +
            ':' +
            selected.authRadius.primary.port
          }
        />
        { selected.accountingRadius &&
          <>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Radius Accounting Service' }) }
            </Subtitle>
            <Form.Item
              label={$t({ defaultMessage: 'IP Address' })}
              children={
                selected.accountingRadius?.primary.ip +
                ':' +
                selected.accountingRadius?.primary.port
              }
            />
          </>
        }
        <Form.Item
          label={$t({ defaultMessage: 'Radius Shared Secret' })}
          children={<Input.Password
            readOnly
            bordered={false}
            value={selected.authRadius.primary.sharedSecret}
          />}
        />
      </>)}
    </>
  )
}
