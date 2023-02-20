import { useState } from 'react'

import { Checkbox, Popover, Space } from 'antd'
import { CheckboxValueType }        from 'antd/es/checkbox/Group'
import { useIntl }                  from 'react-intl'

import { Button } from '@acx-ui/components'

export function ChannelBarControlPopover (props: {
  initValue: string[],
  onChannelBarDisplayChanged: Function
}) {
  const { $t } = useIntl()

  const checkboxOptions = [
    { label: 'Lower/Upper 5G', value: '5G' },
    { label: 'DFS', value: 'DFS' }
  ]

  const [isOpen, setIsOpen] = useState(false)
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(props.initValue)

  const hide = () => {
    setIsOpen(false)
  }

  const onChange = (list: CheckboxValueType[]) => {
    setCheckedList(list)
    props.onChannelBarDisplayChanged(list)
  }

  const content = (
    <Space direction='vertical'>
      <Checkbox.Group
        style={{ display: 'grid', rowGap: '5px' }}
        options={checkboxOptions}
        value={checkedList}
        onChange={onChange} />

      <Button type='link' onClick={hide} style={{ float: 'right' }}>
        {$t({ defaultMessage: 'Close' })}
      </Button>
    </Space>
  )

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
  }

  return (
    <Popover
      showArrow={false}
      content={content}
      title={$t({ defaultMessage: 'Show' })}
      trigger='click'
      visible={isOpen}
      onVisibleChange={handleOpenChange}
      children={(
        <Button type='link'>{$t({ defaultMessage: 'Channels display settings' })}</Button>
      )}
    />
  )
}
