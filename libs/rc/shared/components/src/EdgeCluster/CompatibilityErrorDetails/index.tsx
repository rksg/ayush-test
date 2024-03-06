import { Form, Space } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Drawer, cssNumber } from '@acx-ui/components'

import { SingleNodeDetails } from './SingleNodeDetails'

import type { CompatibilityNodeError, SingleNodeDetailsField } from './types'

interface CompatibilityErrorDetailsProps<RecordType> {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  fields: SingleNodeDetailsField<RecordType>[]
  data: CompatibilityNodeError<RecordType>[]
}

export const CompatibilityErrorDetails = <RecordType,>
  (props: CompatibilityErrorDetailsProps<RecordType>) => {
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
          data={item.errors}
        />
      })}
    </Space>
  </Drawer>
}