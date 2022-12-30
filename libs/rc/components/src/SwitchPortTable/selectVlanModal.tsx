import { useEffect, useState } from 'react'

import { Checkbox, Input, Radio, Space, Typography } from 'antd'
import { DefaultOptionType }                         from 'antd/lib/select'
import _                                             from 'lodash'

import { Button, Modal, Tabs, Tooltip }                                   from '@acx-ui/components'
import {
  // getPortSpeedOptions,
  // poeBudgetRegExp,
  // PORT_SPEED,
  // SwitchPortViewModel,
  // SwitchAclUnion,
  SwitchVlan,
  SwitchVlans
  // SwitchVlanUnion,
  // PortSetting,
  // PortsSetting
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'


import * as UI from './styledComponents'

import type { RadioChangeEvent }  from 'antd'
import type { CheckboxValueType } from 'antd/es/checkbox/Group'


export function SelectVlanModal (props: {
  form: any,
  selectModalvisible: boolean,
  setSelectModalvisible: (visible: boolean) => void,
  setUseVenueSettings: (useVenue: boolean) => void,
  defaultVlan: string,
  switchVlans: SwitchVlan[],
  venueVlans: SwitchVlans[],
  vlanUsedByVe?: string, //
  taggedVlans: string,
  untaggedVlan: string,
  hasSwitchProfile?: boolean,
  vlanDisabledTooltip: string
}) {
  const { $t } = getIntl()
  const { form, selectModalvisible, setSelectModalvisible,
    setUseVenueSettings, hasSwitchProfile = false,
    vlanDisabledTooltip, defaultVlan, switchVlans,
    vlanUsedByVe = [], taggedVlans = '', untaggedVlan
  } = props

  const [selectTaggedVlans, setSelectTaggedVlans]
    = useState(taggedVlans as any)
  const [selectUntaggedVlans, setSelectUntaggedVlans] = useState(untaggedVlan)

  const [disableButton, setDisableButton] = useState(false)
  const [taggedVlanOptions, setTaggedVlanOptions] = useState([] as any)
  const [untaggedVlanOptions, setUntaggedVlanOptions] = useState([] as any)
  const [displayTaggedVlan, setDisplayTaggedVlan] = useState([] as any)
  const [displayUntaggedVlan, setDisplayUntaggedVlan] = useState([] as any)

  const onOk = () => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      taggedVlans: selectTaggedVlans.toString(),
      untaggedVlan: selectUntaggedVlans
    })
    setUseVenueSettings(false)
    setSelectModalvisible(false)
  }

  const onCancel = () => {
    setSelectModalvisible(false)
  }

  function getTaggedVlanOptions (selectedUntaggedVlan: any) {
    const vlanOptions = switchVlans.map((v: any) => {
      const isUntagged = parseInt(v.vlanId, 10) === parseInt(selectedUntaggedVlan, 10)
      const extra = isUntagged
        ? $t({ defaultMessage: '(Set as untagged VLAN)' })
        : (v?.vlanConfigName ? `(${v?.vlanConfigName})` : '')

      return {
        label: $t({ defaultMessage: 'VLAN-ID-{vlan} {extra}' }, { vlan: v.vlanId, extra }),
        value: v.vlanId.toString(),
        disabled: isUntagged /////
      }
    })

    return sortArray(vlanOptions, 'number')
  }

  function getUntaggedVlanOptions (selectedTaggedVlans: any) {
    const vlanOptions = switchVlans.map((vlan: any) => {
      const tagged = selectedTaggedVlans?.toString()?.split(',')
      const isTagged = tagged?.some((v: any) => parseInt(v, 10) === parseInt(vlan?.vlanId, 10))
      const isAclConflict = vlanUsedByVe?.toString()?.split(',')
        .some((v: any) => parseInt(v, 10) === parseInt(vlan.vlanId, 10))
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

    const untaggedVlanOption = sortArray(vlanOptions, 'number')
    const noneVlanOption = !untaggedVlanOption?.length ? {
      label: $t({ defaultMessage: 'None' }), value: ''
    } : null

    // ParticularVlanOptionType
    const defaultVlanOption = defaultVlan ? {
      label: $t({ defaultMessage: 'VLAN-ID-{vlan} (Default VLAN)' }, { vlan: defaultVlan }),
      value: defaultVlan
    } : {
      label: $t({ defaultMessage: 'Default VLAN (Multiple values)' }),
      value: $t({ defaultMessage: 'Default VLAN (Multiple values)' })
    }

    return [
      noneVlanOption,
      defaultVlanOption,
      ...untaggedVlanOption
    ].filter((o: any) => o)
  }

  useEffect(() => {
    setSelectUntaggedVlans(untaggedVlan)
    setSelectTaggedVlans(taggedVlans)
    setTaggedVlanOptions(getTaggedVlanOptions(untaggedVlan))
    setDisplayTaggedVlan(getTaggedVlanOptions(untaggedVlan))
    setUntaggedVlanOptions(getUntaggedVlanOptions(taggedVlans))
    setDisplayUntaggedVlan(getUntaggedVlanOptions(taggedVlans))
  }, [switchVlans])

  useEffect(() => {
    const taggedVlansChanged
      = !_.isEqual(taggedVlans.toString().split(','), selectTaggedVlans.toString().split(','))
    const untaggedVlansChanged
      = !_.isEqual(untaggedVlan?.toString(), selectUntaggedVlans?.toString())
    setDisableButton(!(taggedVlansChanged || untaggedVlansChanged))
  }, [selectTaggedVlans, selectUntaggedVlans])

  const onChangeTaggedVlan = (checkedValues: CheckboxValueType[]) => {
    const untaggedVlanOptions = getUntaggedVlanOptions(checkedValues)
    setSelectTaggedVlans(checkedValues as unknown as CheckboxValueType[])

    setDisplayUntaggedVlan(untaggedVlanOptions)
    setUntaggedVlanOptions(untaggedVlanOptions)
  }

  const onChangeUntaggedVlan = (e: RadioChangeEvent) => {
    const taggedVlanOptions = getTaggedVlanOptions(e.target.value)
    setSelectUntaggedVlans(e.target.value)
    setDisplayTaggedVlan(taggedVlanOptions)
    setTaggedVlanOptions(taggedVlanOptions)
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
          title={!hasSwitchProfile ? vlanDisabledTooltip : ''} /// ?
        >
          <Button key='add-vlan'
            type='link'
            size='small'
            disabled={!hasSwitchProfile} // TODO
            onClick={() => { }}>
            {$t({ defaultMessage: 'Add VLAN' })}
          </Button>
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
          placeholder={$t({ defaultMessage: 'Search by VLAN ID or name' })}
          allowClear={true}
          maxLength={64}
          disabled={!taggedVlanOptions.length}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setDisplayTaggedVlan(taggedVlanOptions.filter(
              (opt: any) => (opt?.label?.includes(value) || opt?.value?.includes(value))
            ))
          }}
        />

        <UI.GroupListLayout>
          <Checkbox.Group
            options={displayTaggedVlan}
            defaultValue={Array.from(taggedVlans?.split(','))}
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
          placeholder={$t({ defaultMessage: 'Search by VLAN ID or name' })}
          allowClear={true}
          maxLength={64}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setDisplayUntaggedVlan(untaggedVlanOptions.filter( /////
              (opt: any) => (opt?.label?.includes(value) || opt?.value?.includes(value))
            ))
          }}
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