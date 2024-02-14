import React from 'react'

import {
  Form,
  Radio,
  RadioChangeEvent
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { SpaceWrapper } from '@acx-ui/rc/components'

interface PermissionSelectorProps {
  setSelected: (selectedAuth: string) => void
}

export enum PermissionRadioButtonEnum {
  byTechnology = 'byTechnology',
  byExpertise = 'byExpertise'
}

export const GetPermissionString = (type: PermissionRadioButtonEnum) => {
  switch (type) {
    case PermissionRadioButtonEnum.byTechnology:
      return defineMessage({ defaultMessage: 'By Technology' })
    case PermissionRadioButtonEnum.byExpertise:
      return defineMessage({ defaultMessage: 'By Special Expertise' })
  }
}

export const getAuthTypes = () => {
  return [
    {
      label: GetPermissionString(PermissionRadioButtonEnum.byTechnology),
      value: PermissionRadioButtonEnum.byTechnology
    },
    {
      label: GetPermissionString(PermissionRadioButtonEnum.byExpertise),
      value: PermissionRadioButtonEnum.byExpertise
    }]
}

const PermissionSelector = (props: PermissionSelectorProps) => {
  const { $t } = useIntl()

  let { setSelected } = props

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  const authTypesList = getAuthTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return (
    <Form.Item
      name='permissionType'
      initialValue={PermissionRadioButtonEnum.byTechnology}
    >
      <Radio.Group
        style={{ width: '100%' }}
        onChange={onSelectModeChange}
      >
        <SpaceWrapper direction='vertical'>
          {authTypesList.map((item) => {
            return (
              <React.Fragment key={item.value}>
                <Radio
                  value={item.value}>
                  {item.label}
                </Radio>
              </React.Fragment>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>
  )
}

export default PermissionSelector