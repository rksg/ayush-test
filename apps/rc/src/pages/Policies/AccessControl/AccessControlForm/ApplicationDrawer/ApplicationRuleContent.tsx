import React, { useEffect, useState } from 'react'

import { Checkbox, Form, FormInstance, Input, Radio, RadioChangeEvent, Select, Slider, Tooltip } from 'antd'
import { defineMessage, MessageDescriptor, useIntl }                                             from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, GridCol, GridRow } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                              from '@acx-ui/icons'
import {
  ApplicationAclType,
  ApplicationRuleType, AvcCategory, generalIpAddressRegExp,
  portRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'

import { AppAclLabelMapping, AppRuleLabelMapping } from '../../../contentsMap'

import QosContent from './QosContent'

import { ApplicationsRule, DrawerFormItem } from './index'

const { useWatch } = Form

export interface ApplicationRuleDrawerProps {
  avcSelectOptions: AvcCategory[],
  applicationsRuleList: ApplicationsRule[],
  applicationsRule: ApplicationsRule,
  editMode: boolean,
  drawerForm: FormInstance
}

export enum RateTypeEnum {
  IEEE802_1P = 'IEEE802_1P',
  DSCP = 'DSCP',
  BOTH = 'BOTH'
}

export const appRateTypeLabelMapping: Record<RateTypeEnum, MessageDescriptor> = {
  [RateTypeEnum.IEEE802_1P]: defineMessage({ defaultMessage: '802.1p' }),
  [RateTypeEnum.DSCP]: defineMessage({ defaultMessage: 'DSCP' }),
  [RateTypeEnum.BOTH]: defineMessage({ defaultMessage: 'Both' })
}

export enum RateStrategyEnum {
  BEST_EFFORT = 'BEST_EFFORT',
  VIDEO = 'VIDEO',
  VOICE = 'VOICE',
  BACKGROUND = 'BACKGROUND'
}

export const appRateStrategyLabelMapping: Record<RateStrategyEnum, MessageDescriptor> = {
  [RateStrategyEnum.BEST_EFFORT]: defineMessage({ defaultMessage: 'Best effort' }),
  [RateStrategyEnum.VIDEO]: defineMessage({ defaultMessage: 'Video' }),
  [RateStrategyEnum.VOICE]: defineMessage({ defaultMessage: 'Voice' }),
  [RateStrategyEnum.BACKGROUND]: defineMessage({ defaultMessage: 'Background' })
}

const ApplicationRuleContent = (props: ApplicationRuleDrawerProps) => {
  const { $t } = useIntl()
  const { avcSelectOptions, applicationsRuleList, applicationsRule, editMode, drawerForm } = props
  const [category, setCategory] = useState('')
  const [sourceValue, setSourceValue] = useState(drawerForm.getFieldValue('accessControl'))
  const [maxUplinkRate, setMaxUplinkRate] = useState({
    status: drawerForm.getFieldValue('uplink') > 0,
    value: drawerForm.getFieldValue('uplink')
  })
  const [maxDownlinkRate, setMaxDownlinkRate] = useState({
    status: drawerForm.getFieldValue('downlink') > 0,
    value: drawerForm.getFieldValue('downlink')
  })

  const [
    ruleType,
    portMappingOnly
  ] = [
    useWatch<string>(['ruleType'], drawerForm),
    useWatch<string>(['portMappingOnly'], drawerForm)
  ]

  const PROTOCOL_TYPE = [
    $t({ defaultMessage: 'TCP' }),
    $t({ defaultMessage: 'UDP' })
  ]

  useEffect(() => {
    if (applicationsRule.ruleSettings) {
      setCategory(applicationsRule.ruleSettings.category ?? '')
      drawerForm.setFieldValue('portMappingOnly', !applicationsRule.ruleSettings.destinationIp)
    }
  }, [applicationsRule.ruleSettings])

  const rateLimitContent = <div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '200px' }}>
        <Checkbox
          checked={maxUplinkRate.status}
          onChange={() => {
            setMaxUplinkRate({
              value: maxUplinkRate.value ?? 0.25,
              status: !maxUplinkRate.status
            })
            drawerForm.setFieldValue(['uplink'], 0.25)
          }}
        >
          {$t({ defaultMessage: 'Max uplink rate:' })}
        </Checkbox>
      </span>
      { maxUplinkRate.status && <Slider
        style={{
          // display: fromClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0.25: '0.25 Mbps', 20: '20 Mbps' }}
        min={0.25}
        max={20}
        defaultValue={maxUplinkRate.value ?? 0.25}
        onChange={(value) => {
          setMaxUplinkRate({
            ...maxUplinkRate,
            value: value
          })
          drawerForm.setFieldValue(['uplink'], value)
        }}
      /> }
    </div>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '200px' }}>
        <Checkbox
          checked={maxDownlinkRate.status}
          onChange={() => {
            setMaxDownlinkRate({
              value: maxDownlinkRate.value ?? 0.25,
              status: !maxDownlinkRate.status
            })
            drawerForm.setFieldValue(['downlink'], 0.25)
          }}
        >
          {$t({ defaultMessage: 'Max downlink rate:' })}
        </Checkbox>
      </span>
      { maxDownlinkRate.status && <Slider
        style={{
          // display: toClient ? '' : 'none',
          width: '100%', marginLeft: '10px', marginRight: '10px' }}
        marks={{ 0.25: '0.25 Mbps', 20: '20 Mbps' }}
        min={0.25}
        max={20}
        defaultValue={maxDownlinkRate.value ?? 0.25}
        onChange={(value) => {
          setMaxDownlinkRate({
            ...maxDownlinkRate,
            value: value
          })
          drawerForm.setFieldValue(['downlink'], value)
        }}
      /> }
    </div>
  </div>

  const onSourceChange = (e: RadioChangeEvent) => {
    setSourceValue(e.target.value)
  }

  const sortOptions = (a: string, b: string) => {
    const compareA = a.split('_')[1].toUpperCase()
    const compareB = b.split('_')[1].toUpperCase()
    if (compareA > compareB) return 1
    if (compareA < compareB) return -1
    return 0
  }

  const selectApplication = (category: string) => {
    if (category === 'All') {
      let optionsList = [] as string[]
      Object.entries(avcSelectOptions).map(entry => {
        const [category, appList] = entry
        if (Number(category) !== 0) {
          optionsList.push(...appList.appNames
            .filter((appName) => appName !== 'All')
            .map((appName) => {
              return `${avcSelectOptions[Number(category)].catName}_${appName}`
            }))
        }
      })
      return <Select
        showSearch
        style={{ width: '100%' }}
        optionFilterProp='children'
        filterOption={(input, option) =>
          (String(option?.value).toLowerCase() ?? '').includes(input.toLowerCase())
        }
        onChange={(evt) => {
          drawerForm.setFieldValue('applicationNameSystemDefined', evt)
        }}
      >
        {optionsList.sort(sortOptions).map(option => {
          return <Select.Option key={option} value={option}>
            {option.split('_')[1]}
          </Select.Option>
        })}
      </Select>
    }
    const categoryId = avcSelectOptions
      .findIndex(cat => cat.catName === category)

    const renderOptions = avcSelectOptions[categoryId]?.appNames.slice(1) ?? []

    return <Select
      showSearch
      style={{ width: '100%' }}
      optionFilterProp='children'
      filterOption={(input, option) =>
        (String(option?.value).toLowerCase() ?? '').includes(input.toLowerCase())
      }
      onChange={(evt) => {
        drawerForm.setFieldValue('applicationNameSystemDefined', evt)
      }}
    >
      {[$t({ defaultMessage: 'All' }), ...renderOptions.sort()].map((avcApp: string) => {
        return <Select.Option key={`${category}_${avcApp}`} value={`${category}_${avcApp}`}>
          {avcApp}
        </Select.Option>
      })}
    </Select>
  }

  const EmptyElement = (props: { ruleType: string }) => {
    useEffect(() => {
      drawerForm.setFieldValue('ruleType', props.ruleType)
    }, [props])
    return <></>
  }

  const accessControlField = <Radio.Group
    onChange={onSourceChange}
    value={sourceValue}
    style={{ width: '100%', marginBottom: '10px' }}
  >
    <GridRow >
      <GridCol col={{ span: 24 }}>
        <Radio value={ApplicationAclType.DENY}>
          {$t(AppAclLabelMapping[ApplicationAclType.DENY])}
        </Radio>
      </GridCol>

      <GridCol col={{ span: 24 }}>
        <Radio value={ApplicationAclType.RATE_LIMIT}>
          {$t(AppAclLabelMapping[ApplicationAclType.RATE_LIMIT])}
          {/* eslint-disable-next-line max-len */}
          <Tooltip title={$t({ defaultMessage: 'If you set rate limit on network level, it will override any rate limit set on policy level.' })}
            placement='bottom'>
            <QuestionMarkCircleOutlined
              style={{ marginLeft: 3, marginBottom: -7, width: '20px' }}
            />
          </Tooltip>
        </Radio>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        {sourceValue === ApplicationAclType.RATE_LIMIT
          ? <div style={{ display: 'flex' }}>
            <Form.Item
              style={{ width: '100%' }}
              name='rateLimitFields'
              rules={[
                { validator: () => {
                  if (!maxUplinkRate.status && !maxDownlinkRate.status) {
                    return Promise.reject($t({
                      defaultMessage: 'Must have a least one enabled rate limiting'
                    }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              {rateLimitContent}
            </Form.Item>
          </div> : <div></div>}
      </GridCol>

      <GridCol col={{ span: 24 }}>
        <Radio value={ApplicationAclType.QOS}>
          {$t(AppAclLabelMapping[ApplicationAclType.QOS])}
        </Radio>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        {sourceValue === ApplicationAclType.QOS
          ? <QosContent drawerForm={drawerForm}/>
          : <div></div>}
      </GridCol>
    </GridRow>

  </Radio.Group>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    {
      label: $t(AppRuleLabelMapping[ApplicationRuleType.SIGNATURE]),
      children: <EmptyElement ruleType={ApplicationRuleType.SIGNATURE} />,
      value: ApplicationRuleType.SIGNATURE
    },
    {
      label: $t(AppRuleLabelMapping[ApplicationRuleType.USER_DEFINED]),
      children: <EmptyElement ruleType={ApplicationRuleType.USER_DEFINED} />,
      value: ApplicationRuleType.USER_DEFINED
    }
  ]

  const selectCategory = (
    <Select
      style={{ width: '100%' }}
      onChange={(evt) => {
        setCategory(evt)
        drawerForm.setFieldValue('applicationNameSystemDefined', 'Select Application...')
      }}
    >
      {avcSelectOptions.map(avcCat => {
        return <Select.Option key={`${avcCat.catName}_${avcCat.catId}`} value={avcCat.catName}>
          {avcCat.catName}
        </Select.Option>
      })}
    </Select>
  )

  const ruleContent = <Form layout='horizontal' form={drawerForm}>
    <DrawerFormItem
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
        { min: 2 },
        { max: 32 },
        { validator: (_, value) => {
          if (!editMode && applicationsRuleList.findIndex(rule => rule.ruleName === value) !== -1) {
            return Promise.reject($t({ defaultMessage: 'This rule name has been existed.' }))
          }
          return Promise.resolve()
        } }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a short description, up to 32 characters' })}
      />}
    />
    <DrawerFormItem
      name='ruleType'
      label={$t({ defaultMessage: 'Rule Type' })}
      initialValue={drawerForm.getFieldValue('ruleType')}
      rules={[
        { required: true }
      ]}
      children={
        <ContentSwitcher
          tabDetails={tabDetails}
          defaultValue={drawerForm.getFieldValue('ruleType')}
          size='small'
        />
      }
    />
    {/* systemDefined option */}
    { ruleType === ApplicationRuleType.SIGNATURE && <DrawerFormItem
      name='applicationCategory'
      label={$t({ defaultMessage: 'Application Category' })}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (value === 'Select Category...') {
            return Promise.reject($t({ defaultMessage: 'Please select the category' }))
          }
          return Promise.resolve()
        } }
      ]}
      initialValue={category || $t({ defaultMessage: 'Select Category...' })}
      children={selectCategory}
    /> }
    { ruleType === ApplicationRuleType.SIGNATURE && <DrawerFormItem
      name='applicationNameSystemDefined'
      label={$t({ defaultMessage: 'Application Name' })}
      rules={[
        { required: true },
        { max: 255 },
        { validator: (_, value) => {
          if (value === 'Select Application...') {
            return Promise.reject($t({ defaultMessage: 'Please select the application' }))
          }
          return Promise.resolve()
        } }
      ]}
      initialValue={$t({ defaultMessage: 'Select Application...' })}
      children={selectApplication(
        category || drawerForm.getFieldValue('applicationNameSystemDefined')?.split('_')[0]
      )}
    /> }
    {/* userDefined option */}
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='applicationNameUserDefined'
      label={$t({ defaultMessage: 'Application Name' })}
      initialValue={''}
      rules={[
        { required: true }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter the application name' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='portMappingOnly'
      label={' '}
      colon={false}
      initialValue={false}
      valuePropName='checked'
      children={<Checkbox>{$t({ defaultMessage: 'Port Mapping Only' })}</Checkbox>}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && !portMappingOnly && <DrawerFormItem
      name='destinationIp'
      label={$t({ defaultMessage: 'Destination Ip' })}
      initialValue={''}
      rules={[
        { required: true },
        { validator: (_, value) => generalIpAddressRegExp(value) }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a destination Ip' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && !portMappingOnly && <DrawerFormItem
      name='netmask'
      label={$t({ defaultMessage: 'Netmask' })}
      initialValue={''}
      rules={[
        { required: true },
        { validator: (_, value) => subnetMaskIpRegExp(value) }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a mask' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='destinationPort'
      label={$t({ defaultMessage: 'Destination Port' })}
      initialValue={''}
      rules={[
        { required: true },
        { validator: (_, value) => portRegExp(value) }
      ]}
      children={<Input
        placeholder={$t({ defaultMessage: 'Enter a port number' })}
      />}
    /> }
    { ruleType === ApplicationRuleType.USER_DEFINED && <DrawerFormItem
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
      initialValue={PROTOCOL_TYPE[0]}
      rules={[
        { required: true }
      ]}
      children={<Select
        defaultValue={PROTOCOL_TYPE[0]}
        onChange={(value) => drawerForm.setFieldValue('protocol', value)}
        options={PROTOCOL_TYPE.map(protocol =>
          ({ label: protocol, value: protocol }))} />}
    /> }
    <DrawerFormItem
      name='accessControl'
      label={$t({ defaultMessage: 'Access Control' })}
      initialValue={sourceValue}
      rules={[
        { required: true }
      ]}
      children={accessControlField}
    />
  </Form>

  return ruleContent
}

export default ApplicationRuleContent
