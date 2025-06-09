import { useEffect, useState } from 'react'

import { Checkbox, FormInstance, Input, Radio, Space, Switch, Typography } from 'antd'
import _                                                                   from 'lodash'

import { Button, Modal, Tabs, Tooltip }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { InformationSolid }                                from '@acx-ui/icons'
import { useAddVlanMutation, useAddSwitchesVlansMutation } from '@acx-ui/rc/services'
import {
  SwitchVlan,
  PortSettingModel,
  VenueMessages,
  Vlan,
  VlanModalType,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { SwitchScopes }       from '@acx-ui/types'
import { hasPermission }      from '@acx-ui/user'
import { getIntl, getOpsApi } from '@acx-ui/utils'

import { VlanSettingDrawer } from '../VlanSettingDrawer'

import { sortOptions } from './editPortDrawer.utils'
import * as UI         from './styledComponents'

import type { RadioChangeEvent }                      from 'antd'
import type { CheckboxValueType, CheckboxOptionType } from 'antd/es/checkbox/Group'

export function SelectVlanModal (props: {
  form: FormInstance,
  selectModalvisible: boolean,
  setSelectModalvisible: (visible: boolean) => void,
  setUseVenueSettings: (useVenue: boolean) => void,
  onValuesChange: (values: Partial<PortSettingModel>) => void,
  defaultVlan: string,
  switchVlans: SwitchVlan[],
  switchFamilyModel?: string,
  venueVlans: Vlan[],
  vlanUsedByVe?: string,
  taggedVlans: string,
  untaggedVlan: number,
  showVoiceVlan?: boolean,
  voiceVlan?: string,
  isVoiceVlanInvalid?: boolean,
  hasSwitchProfile?: boolean,
  cliApplied?: boolean,
  profileId?: string,
  switchIds?: string[],
  venueId?: string,
  updateSwitchVlans?: (vlan: Vlan) => void,
  vlanDisabledTooltip: string,
  defaultTabKey?: VlanModalType,
  authDefaultVlan?: string[],
  flexAuthEnabled?: boolean,
  switchFirmwares?: string[]
}) {
  const { $t } = getIntl()
  const params = useParams()
  const { form, selectModalvisible, setSelectModalvisible,
    setUseVenueSettings, onValuesChange, hasSwitchProfile, cliApplied,
    vlanDisabledTooltip, defaultVlan, switchVlans, switchIds, venueId, switchFamilyModel,
    vlanUsedByVe = [], taggedVlans = '', untaggedVlan,
    showVoiceVlan, voiceVlan, isVoiceVlanInvalid, defaultTabKey = VlanModalType.UNTAGGED,
    authDefaultVlan, flexAuthEnabled, switchFirmwares
  } = props

  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [selectTaggedVlans, setSelectTaggedVlans] = useState(taggedVlans)
  const [selectUntaggedVlan, setSelectUntaggedVlan] = useState<Number | ''>(Number(untaggedVlan))
  const [disableButton, setDisableButton] = useState(false)
  const [vlanDrawerVisible, setVlanDrawerVisible] = useState(false)
  const [taggedVlanOptions, setTaggedVlanOptions] = useState([] as CheckboxOptionType[])
  const [untaggedVlanOptions, setUntaggedVlanOptions] = useState([] as CheckboxOptionType[])
  const [displayTaggedVlan, setDisplayTaggedVlan] = useState([] as CheckboxOptionType[])
  const [displayUntaggedVlan, setDisplayUntaggedVlan] = useState([] as CheckboxOptionType[])
  const [voiceVlanTmp, setVoiceVlanTmp] = useState(voiceVlan)
  const [isVoiceVlanInvalidTmp, setIsVoiceVlanInvalidTmp] = useState(isVoiceVlanInvalid)

  const [addVlan] = useAddVlanMutation()
  const [addSwitchesVlans] = useAddSwitchesVlansMutation()

  const hasMultipleSwitchIds = new Set(switchIds ?? []).size > 1

  const onOk = async () => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      taggedVlans: selectTaggedVlans.toString(),
      untaggedVlan: selectUntaggedVlan,
      voiceVlan: voiceVlanTmp
    })
    onValuesChange({ untaggedVlan: Number(selectUntaggedVlan), revert: false })
    setUseVenueSettings(false)
    setSelectModalvisible(false)
  }

  const onCancel = () => {
    setSelectModalvisible(false)
  }

  const getTaggedVlanOptions = (selectedUntaggedVlan: number) => {
    const vlanOptions = switchVlans.map((v: SwitchVlan) => {
      const isSelectedUntagged = v.vlanId?.toString() === selectedUntaggedVlan?.toString()
      const isSelectedAuthDefault = authDefaultVlan?.includes(v.vlanId?.toString())
      const extra = isSelectedUntagged
        ? $t({ defaultMessage: '(Set as untagged VLAN)' })
        : (isSelectedAuthDefault
          ? $t({ defaultMessage: '(Set as auth default vlan)' })
          : (v?.vlanConfigName ? `(${v?.vlanConfigName})` : '')
        )

      return {
        label: $t({ defaultMessage: 'VLAN-ID-{vlan} {extra}' }, { vlan: v.vlanId, extra }),
        value: v.vlanId?.toString(),
        disabled: isSelectedUntagged || isSelectedAuthDefault
      }
    })

    return sortOptions(vlanOptions, 'number') as CheckboxOptionType[]
  }

  const getUntaggedVlanOptions = (selectedTaggedVlans: string | CheckboxValueType[]) => {
    const vlanOptions = switchVlans.map((vlan: SwitchVlan) => {
      const tagged = selectedTaggedVlans?.toString()?.split(',')
      const isSelectedTagged = tagged?.some((v: string) => Number(v) === Number(vlan?.vlanId))
      const isAclConflict = vlanUsedByVe?.toString()?.split(',')
        .some(v => Number(v) === Number(vlan?.vlanId))
      const isVoiceVlan = Number(voiceVlanTmp) === Number(vlan?.vlanId)
      const extra = isSelectedTagged
        ? (isVoiceVlan
          ? $t({ defaultMessage: '(Set as tagged and voice VLAN)' })
          : $t({ defaultMessage: '(Set as tagged VLAN)' }))
        : (isAclConflict
          ? $t({ defaultMessage: '(ACL conflict - VLAN is part of VE)' })
          : (isVoiceVlan
            ? $t({ defaultMessage: '(Set as voice VLAN)' })
            :(vlan?.vlanConfigName ? `(${vlan?.vlanConfigName})` : '')))

      return {
        label: $t({ defaultMessage: 'VLAN-ID-{vlan} {extra}' }, { vlan: vlan.vlanId, extra }),
        value: Number(vlan.vlanId),
        disabled: isSelectedTagged
      }
    })

    const untaggedVlanOption
      = (sortOptions(vlanOptions, 'number') ?? []) as CheckboxOptionType[]

    const defaultVlanOption = defaultVlan ? {
      label: $t({ defaultMessage: 'VLAN-ID-{vlan} (Default VLAN)' }, { vlan: defaultVlan }),
      value: Number(defaultVlan)
    } : {
      label: $t({ defaultMessage: 'Default VLAN (Multiple values)' }),
      value: $t({ defaultMessage: 'Default VLAN (Multiple values)' })
    }

    return [
      { label: $t({ defaultMessage: 'None' }), value: '' },
      defaultVlanOption,
      ...untaggedVlanOption
    ]
  }

  useEffect(() => {
    const untagged = untaggedVlan ? Number(untaggedVlan) : ''
    setSelectUntaggedVlan(untagged)
    setSelectTaggedVlans(taggedVlans)
  }, [])

  useEffect(() => {
    const untaggedVlanOptions = getUntaggedVlanOptions(selectTaggedVlans)
    const taggedVlanOptions = getTaggedVlanOptions(selectUntaggedVlan as number)
    setTaggedVlanOptions(taggedVlanOptions)
    setDisplayTaggedVlan(taggedVlanOptions)
    setUntaggedVlanOptions(untaggedVlanOptions)
    setDisplayUntaggedVlan(untaggedVlanOptions)

  }, [switchVlans, voiceVlanTmp])

  useEffect(() => {
    const isTaggedVlansChanged
      = !_.isEqual(taggedVlans?.toString().split(','), selectTaggedVlans?.toString().split(','))
    const isUntaggedVlanChanged
      = !_.isEqual(untaggedVlan?.toString(), selectUntaggedVlan?.toString())
    const voiceVlanChanged
      = !_.isEqual(voiceVlanTmp, voiceVlan)
    setDisableButton(!(isTaggedVlansChanged || isUntaggedVlanChanged || voiceVlanChanged))

  }, [selectTaggedVlans, selectUntaggedVlan, voiceVlanTmp])

  const onChangeTaggedVlan = (checkedValues: CheckboxValueType[]) => {
    const untaggedVlanOptions = getUntaggedVlanOptions(checkedValues)
    const isInvalid = !!(voiceVlanTmp && checkedValues.indexOf(String(voiceVlanTmp)) === -1)
    setIsVoiceVlanInvalidTmp(isInvalid)
    setSelectTaggedVlans(checkedValues.toString())
    setDisplayUntaggedVlan(untaggedVlanOptions)
    setUntaggedVlanOptions(untaggedVlanOptions)
  }

  const onChangeUntaggedVlan = (e: RadioChangeEvent) => {
    const taggedVlanOptions = getTaggedVlanOptions(e.target.value)
    setSelectUntaggedVlan(e.target.value)
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

  const applyVlan = async (values: Vlan) => {
    if (isSwitchLevelVlanEnabled) {
      const payload = switchIds?.map(switchId => {
        return {
          ...(_.omit(values, ['switchFamilyModels'])),
          switchId
        }
      })

      try {
        await addSwitchesVlans({
          params: {
            ...params,
            venueId: venueId
          },
          payload
        }).unwrap()
        await props.updateSwitchVlans?.(values)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }

    } else {
      const payload = {
        ...values,
        switchFamilyModels: values?.switchFamilyModels?.map(models => {
          return {
            ...models,
            taggedPorts: models?.taggedPorts?.toString(),
            untaggedPorts: models?.untaggedPorts?.toString()
          }
        })
      }
      try {
        await addVlan({
          params: { tenantId: params.tenantId, profileId: props.profileId },
          payload,
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
        await props.updateSwitchVlans?.(values)

      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }

    }
  }

  const showVoiceVlanSwitch = (vlan: CheckboxOptionType) => {
    const vlanArray = Array.from(selectTaggedVlans?.toString().split(',') ?? [])
    if(showVoiceVlan && vlanArray.indexOf(String(vlan.value)) !== -1
       || voiceVlanTmp == vlan.value) {
      return true
    }
    return false
  }

  const onVoiceVlanChange = (checked: boolean, vlan: CheckboxValueType) => {
    if(checked) {
      const voiceVlanValue = String(vlan)
      setVoiceVlanTmp(voiceVlanValue)
      const isInvalid = selectTaggedVlans.split(',').indexOf(voiceVlanValue) === -1
      setIsVoiceVlanInvalidTmp(isInvalid)
    }else{
      setVoiceVlanTmp('')
      setIsVoiceVlanInvalidTmp(false)
    }
  }

  const getVlanList = () => {
    const vlans = isSwitchLevelVlanEnabled ? props.switchVlans : props.venueVlans
    return [
      ...vlans,
      ...(defaultVlan ? [{ vlanId: Number(defaultVlan) }] : [])
    ] as Vlan[]
  }

  return <>
    <Modal
      data-testid='select-port-vlans'
      title={$t({ defaultMessage: 'Select Port VLANs' })}
      visible={selectModalvisible}
      width={500}
      destroyOnClose={true}
      onCancel={onCancel}
      footer={[
        <Space style={{ display: 'flex', justifyContent: 'space-between' }} key='button-wrapper'>
          { hasPermission({
            scopes: [SwitchScopes.CREATE],
            rbacOpsIds: [getOpsApi(SwitchUrlsInfo.addVlan)]
          }) ? <Tooltip
              placement='top'
              key='disable-add-vlan-tooltip'
              title={isSwitchLevelVlanEnabled
                ? (cliApplied ? $t(VenueMessages.CLI_APPLIED) : '')
                : (!hasSwitchProfile ? vlanDisabledTooltip : '')
              }
            >
              <Space>
                <Button key='add-vlan'
                  type='link'
                  size='small'
                  disabled={isSwitchLevelVlanEnabled ? cliApplied : !hasSwitchProfile}
                  onClick={() => {
                    setVlanDrawerVisible(true)
                  }}
                >
                  {$t({ defaultMessage: 'Add VLAN' })}
                </Button>
              </Space>
            </Tooltip> : <Space> </Space>}
          <Space>
            <Button key='back' onClick={onCancel}>{$t({ defaultMessage: 'Cancel' })}</Button>
            <Tooltip
              placement='top'
              key='disable-tooltip' // TODO: check tooltip wording
              title={disableButton ? $t({ defaultMessage: 'Select Untagged VLAN' }) : null}
            >
              <Space style={{ marginLeft: '8px' }}>
                <Button key='submit' type='primary' disabled={disableButton} onClick={onOk}>
                  {$t({ defaultMessage: 'OK' })}
                </Button>
              </Space>
            </Tooltip>
          </Space>
        </Space>
      ]}
    >
      <Tabs stickyTop={false} defaultActiveKey={defaultTabKey}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Untagged VLAN' })}
          key={VlanModalType.UNTAGGED}
          disabled={flexAuthEnabled}
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
              defaultValue={Number(untaggedVlan) || ''}
              options={displayUntaggedVlan}
            />
          </UI.GroupListLayout>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<UI.TaggedVlanTab>
            {$t({ defaultMessage: 'Tagged VLANs' })}
            {isVoiceVlanInvalidTmp && <InformationSolid />}
          </UI.TaggedVlanTab>}
          key={VlanModalType.TAGGED}
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
              defaultValue={Array.from(taggedVlans?.toString().split(',') ?? [])}
              onChange={onChangeTaggedVlan}
            >
              {
                displayTaggedVlan.map(vlan =>
                  <UI.VoiceVlanSwitch key={vlan.value as string}>
                    <Checkbox value={vlan.value} disabled={vlan.disabled}>{vlan.label}</Checkbox>
                    {
                      showVoiceVlanSwitch(vlan) &&
                    <div className='switch'>
                      {$t({ defaultMessage: 'Set as Voice VLAN' })}
                      <Switch
                        className={(isVoiceVlanInvalidTmp && vlan.value == voiceVlanTmp)
                          ? 'invalid' : ''}
                        checked={vlan.value == voiceVlanTmp}
                        onChange={(checked: boolean) => { onVoiceVlanChange(checked, vlan.value) }}
                      />
                    </div>
                    }
                  </UI.VoiceVlanSwitch>)
              }
            </Checkbox.Group>
          </UI.GroupListLayout>
        </Tabs.TabPane>
      </Tabs>
    </Modal>

    { vlanDrawerVisible && <VlanSettingDrawer
      editMode={false}
      visible={vlanDrawerVisible}
      setVisible={setVlanDrawerVisible}
      vlan={{} as Vlan}
      switchFamilyModel={switchFamilyModel}
      enablePortModelConfigure={false}
      setVlan={applyVlan}
      vlansList={getVlanList()}
      switchFirmwares={switchFirmwares}
      isMultiSwitchEdit={hasMultipleSwitchIds}
    />}

  </>
}
