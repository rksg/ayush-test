import { Form, Select, Button, Divider, Space } from 'antd'
import { useIntl }                              from 'react-intl'

import * as UI from './styledComponents'


export const SoftGREProfileSettings = () => {

  const { $t } = useIntl()

  const onChange = (value: string) => {

  }

  return (
    <Space>
      <Form.Item
        label={$t({ defaultMessage: 'SoftGRE Profile' })}
        initialValue=''
        children={
          <Select
            style={{ width: '100%' }}
            data-testid={'directory-server-select'}
            value={''}
            onChange={onChange}
            options={[
              {
                label: $t({ defaultMessage: 'Select...' }), value: ''
              }
            ]}
            placeholder={$t({ defaultMessage: 'Select...' })}
          />}
      />
      <UI.TypeSpace split={<Divider type='vertical' />}>
        <Button type='link'
          disabled={false}
          onClick={() => {}}>
          {$t({ defaultMessage: 'Profile Details' })}
        </Button>
        <Button type='link'
          onClick={() => {}}>
          {$t({ defaultMessage: 'Add Profile' })}
        </Button>
      </UI.TypeSpace>
    </Space>
  )
}