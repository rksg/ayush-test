import { useEffect, useState } from 'react'

import { Checkbox, FormInstance, Input, Radio, Space, Typography } from 'antd'
import { DefaultOptionType }                                       from 'antd/lib/select'
import _                                                           from 'lodash'

import { Button, Modal, Tabs, Tooltip } from '@acx-ui/components'
import {
  SwitchVlan,
  PortSetting,
  Vlan
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI from './styledComponents'

import type { RadioChangeEvent }                      from 'antd'
import type { CheckboxValueType, CheckboxOptionType } from 'antd/es/checkbox/Group'

export function SelectVlanModal (props: {
  form: FormInstance,
  selectModalvisible: boolean,
  setSelectModalvisible: (visible: boolean) => void,
  setUseVenueSettings: (useVenue: boolean) => void,
  onValuesChange: (values: Partial<PortSetting>) => void,
  defaultVlan: string,
  switchVlans: SwitchVlan[],
  venueVlans: Vlan[],
  vlanUsedByVe?: string,
  taggedVlans: string,
  untaggedVlan: number,
  hasSwitchProfile?: boolean,
  vlanDisabledTooltip: string
}) {
  const { $t } = getIntl()
  const { form, selectModalvisible, setSelectModalvisible,
    setUseVenueSettings, onValuesChange, hasSwitchProfile = false,
    vlanDisabledTooltip, defaultVlan, switchVlans,
    vlanUsedByVe = [], taggedVlans = '', untaggedVlan
  } = props

  const [selectTaggedVlans, setSelectTaggedVlans] = useState(taggedVlans)
  const [selectUntaggedVlans, setSelectUntaggedVlans] = useState(untaggedVlan)

  const [disableButton, setDisableButton] = useState(false)
  const [taggedVlanOptions, setTaggedVlanOptions] = useState([] as CheckboxOptionType[])
  const [untaggedVlanOptions, setUntaggedVlanOptions] = useState([] as CheckboxOptionType[])
  const [displayTaggedVlan, setDisplayTaggedVlan] = useState([] as CheckboxOptionType[])
  const [displayUntaggedVlan, setDisplayUntaggedVlan] = useState([] as CheckboxOptionType[])

  const onOk = async () => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      taggedVlans: selectTaggedVlans.toString(),
      untaggedVlan: selectUntaggedVlans
    })
    await onValuesChange({ untaggedVlan: Number(selectUntaggedVlans) })
    setUseVenueSettings(false)
    setSelectModalvisible(false)
  }

  const onCancel = () => {
    setSelectModalvisible(false)
  }

  function getTaggedVlanOptions (selectedUntaggedVlan: number) {
    const vlanOptions = switchVlans.map((v: SwitchVlan) => {
      // const isUntagged = parseInt(v.vlanId, 10) === parseInt(selectedUntaggedVlan, 10)
      const isUntagged = v.vlanId === selectedUntaggedVlan
      const extra = isUntagged
        ? $t({ defaultMessage: '(Set as untagged VLAN)' })
        : (v?.vlanConfigName ? `(${v?.vlanConfigName})` : '')

      return {
        label: $t({ defaultMessage: 'VLAN-ID-{vlan} {extra}' }, { vlan: v.vlanId, extra }),
        value: v.vlanId.toString(),
        disabled: isUntagged
      }
    })

    return sortArray(vlanOptions, 'number') as CheckboxOptionType[]
  }

  function getUntaggedVlanOptions (selectedTaggedVlans: string | CheckboxValueType[]) {
    const vlanOptions = switchVlans.map((vlan: SwitchVlan) => {
      const tagged = selectedTaggedVlans?.toString()?.split(',')
      const isTagged = tagged?.some((v: string) => Number(v) === Number(vlan?.vlanId))
      const isAclConflict = vlanUsedByVe?.toString()?.split(',')
        .some(v => Number(v) === Number(vlan?.vlanId))

      const extra = isTagged
        ? $t({ defaultMessage: '(Set as tagged VLAN)' })
        : (isAclConflict
          ? $t({ defaultMessage: '(ACL conflict - VLAN is part of VE)' })
          : (vlan?.vlanConfigName ? `(${vlan?.vlanConfigName})` : ''))

      return {
        label: $t({ defaultMessage: 'VLAN-ID-{vlan} {extra}' }, { vlan: vlan.vlanId, extra }),
        value: Number(vlan.vlanId), //.toString(),
        disabled: isTagged
      }
    })

    const untaggedVlanOption
      = (sortArray(vlanOptions, 'number') ?? []) as CheckboxOptionType[]
    // const noneVlanOption = !untaggedVlanOption?.length ? [{
    //   label: $t({ defaultMessage: 'None' }), value: ''
    // }] : []

    // ParticularVlanOptionType
    const defaultVlanOption = defaultVlan ? {
      label: $t({ defaultMessage: 'VLAN-ID-{vlan} (Default VLAN)' }, { vlan: defaultVlan }),
      value: defaultVlan
    } : {
      label: $t({ defaultMessage: 'Default VLAN (Multiple values)' }),
      value: $t({ defaultMessage: 'Default VLAN (Multiple values)' })
    }

    return [
      // ...noneVlanOption,
      { label: $t({ defaultMessage: 'None' }), value: '' },
      defaultVlanOption,
      ...untaggedVlanOption
    ]
  }

  useEffect(() => {
    const untaggedVlanOptions = getUntaggedVlanOptions(taggedVlans)
    const taggedVlanOptions = getTaggedVlanOptions(untaggedVlan)
    setSelectUntaggedVlans(untaggedVlan)
    setSelectTaggedVlans(taggedVlans)
    setTaggedVlanOptions(taggedVlanOptions)
    setDisplayTaggedVlan(taggedVlanOptions)
    setUntaggedVlanOptions(untaggedVlanOptions)
    setDisplayUntaggedVlan(untaggedVlanOptions)
  }, [switchVlans])

  useEffect(() => {
    const taggedVlansChanged
      = !_.isEqual(taggedVlans?.toString().split(','), selectTaggedVlans?.toString().split(','))
    const untaggedVlansChanged
      = !_.isEqual(untaggedVlan?.toString(), selectUntaggedVlans?.toString())
    setDisableButton(!(taggedVlansChanged || untaggedVlansChanged))
  }, [selectTaggedVlans, selectUntaggedVlans])

  const onChangeTaggedVlan = (checkedValues: CheckboxValueType[]) => {
    const untaggedVlanOptions = getUntaggedVlanOptions(checkedValues)
    setSelectTaggedVlans(checkedValues.toString())
    setDisplayUntaggedVlan(untaggedVlanOptions)
    setUntaggedVlanOptions(untaggedVlanOptions)
  }

  const onChangeUntaggedVlan = (e: RadioChangeEvent) => {
    const taggedVlanOptions = getTaggedVlanOptions(e.target.value)
    setSelectUntaggedVlans(e.target.value)
    setDisplayTaggedVlan(taggedVlanOptions)
    setTaggedVlanOptions(taggedVlanOptions)
  }

  const onFilterList = (value: string, listType: string) => {
    const options
      = (listType === 'tagged' ? taggedVlanOptions : untaggedVlanOptions) as CheckboxOptionType[]
    const filteredOptions = options.filter(
      opt => (opt?.value?.toString().includes(value) || opt?.label?.toString().includes(value))
    )

    listType === 'tagged'
      ? setDisplayTaggedVlan(filteredOptions)
      : setDisplayUntaggedVlan(filteredOptions)
  }

  return (<Modal
    title={$t({ defaultMessage: 'Select Port VLANs' })}
    visible={selectModalvisible}
    width={500}
    destroyOnClose={true}
    onCancel={onCancel}
    footer={[
      <Space style={{ display: 'flex', justifyContent: 'space-between' }} key='button-wrapper'>
        <Tooltip
          placement='top'
          key='disable-add-vlan-tooltip'
          title={!hasSwitchProfile ? vlanDisabledTooltip : ''}
        >
          <Space>
            <Button key='add-vlan'
              type='link'
              size='small'
              // TODO
              disabled={true}
              // disabled={!hasSwitchProfile}
              // onClick={() => { }}
            >
              {$t({ defaultMessage: 'Add VLAN' })}
            </Button>
          </Space>
        </Tooltip>
        <Space>
          <Button key='back' onClick={onCancel}>{$t({ defaultMessage: 'Cancel' })}</Button>
          <Tooltip
            placement='top'
            key='disable-tooltip'
            title={disableButton ? $t({ defaultMessage: 'Select Untagged VLAN' }) : null}
          >
            <Space style={{ marginLeft: '8px' }}>
              <Button key='submit' type='secondary' disabled={disableButton} onClick={onOk}>
                {$t({ defaultMessage: 'OK' })}
              </Button>
            </Space>
          </Tooltip>
        </Space>
      </Space>
    ]}
  >
    <Tabs defaultActiveKey='taggedVlans'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Tagged VLANs' })}
        key='taggedVlans'
      >
        <Typography.Text style={{
          display: 'inline-block', fontSize: '12px', marginBottom: '6px'
        }}>
          {$t({ defaultMessage: 'VLANs to activate on this port:' })}
        </Typography.Text>
        <Input
          data-testid='tagged-input'
          placeholder={$t({ defaultMessage: 'Search by VLAN ID or name' })}
          allowClear={true}
          maxLength={64}
          disabled={!taggedVlanOptions.length}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterList(e.target.value, 'tagged')
          }
        />

        <UI.GroupListLayout>
          <Checkbox.Group
            options={displayTaggedVlan}
            defaultValue={Array.from(taggedVlans?.split(',') ?? [])}
            onChange={onChangeTaggedVlan}
          />
        </UI.GroupListLayout>
      </Tabs.TabPane>

      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Untagged VLANs' })}
        key='untaggedVlan'
      >
        <Typography.Text style={{
          display: 'inline-block', fontSize: '12px', marginBottom: '6px'
        }}>
          {$t({ defaultMessage: 'VLANs to activate on this port:' })}
        </Typography.Text>
        <Input
          data-testid='untagged-input'
          placeholder={$t({ defaultMessage: 'Search by VLAN ID or name' })}
          allowClear={true}
          maxLength={64}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterList(e.target.value, 'untagged')
          }
        />
        <UI.GroupListLayout>
          <Radio.Group
            onChange={onChangeUntaggedVlan}
            defaultValue={untaggedVlan}
            options={displayUntaggedVlan}
          />
        </UI.GroupListLayout>
      </Tabs.TabPane>
    </Tabs>
  </Modal>)
}

//// utils
function sortArray (dataList: DefaultOptionType[], valueType = 'string', sortField = 'value') {
  return dataList?.[0]?.[sortField]
    ? _.sortBy(dataList, [sortField], function (o) {
      return valueType === 'number'
        ? parseInt(o[sortField], 10) //Number(o[sortField])
        : o[sortField]
    })
    : _.sortBy(dataList)
}