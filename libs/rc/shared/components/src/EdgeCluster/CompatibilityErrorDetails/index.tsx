import { Form, Space } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Drawer, cssNumber } from '@acx-ui/components'

import { SingleNodeDetails, SingleNodeDetailsField } from './SingleNodeDetails'

export interface CompatibilityError {
  nodeId: string
  nodeName: string
  errors: {
    id: string,
    value: unknown
  }[]
}

interface CompatibilityErrorDetailsProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  fields: SingleNodeDetailsField[]
  data: CompatibilityError[]
}

export const CompatibilityErrorDetails = (props: CompatibilityErrorDetailsProps) => {
  const { visible, setVisible, fields, data } = props
  const { $t } = useIntl()

  const onClose = () => setVisible(false)

  const footer = <>
    <div/>
    <Button
      onClick={onClose}
      type='primary'
    >
      {$t({ defaultMessage: 'OK' })}
    </Button>
  </>

  return <Drawer
    title={$t({ defaultMessage: 'Compatibility Check' })}
    visible={visible}
    onClose={onClose}
    destroyOnClose={true}
    width={475}
    footer={footer}
  >
    <Form.Item
      label={$t({ defaultMessage: 'Root cause' })}
      // eslint-disable-next-line max-len
      children={$t({ defaultMessage: 'The nodes\' configurations are not in sync on the number and port type.' })}
    />
    <Space
      size={cssNumber('--acx-modal-footer-small-padding-top')}
      direction='vertical'
    >
      {data.map((item) => {
        return <SingleNodeDetails
          key={`singleNodeDetails-${item.nodeId}`}
          title={item.nodeName}
          fields={fields}
        />
      })}
    </Space>
  </Drawer>
}