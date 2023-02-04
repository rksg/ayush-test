import { FormInstance } from 'antd'
import { useIntl }      from 'react-intl'

import {
  ApplicationAclType,
  ApplicationPortMappingType,
  ApplicationRuleType,
  appPolicyInfoType
} from '@acx-ui/rc/utils'

import { ApplicationsRule } from './index'

export const updateFormWithEditRow = (drawerForm: FormInstance, editRow: ApplicationsRule) => {
  drawerForm.setFieldValue('ruleName', editRow.ruleName)
  drawerForm.setFieldValue('ruleType', editRow.ruleType)
  drawerForm.setFieldValue('accessControl', editRow.accessControl)
  drawerForm.setFieldValue('applicationCategory', editRow.ruleSettings.appCategory)
  // eslint-disable-next-line max-len
  drawerForm.setFieldValue('applicationNameSystemDefined', editRow.ruleSettings.appNameSystemDefined)
  // eslint-disable-next-line max-len
  drawerForm.setFieldValue('applicationNameUserDefined', editRow.ruleSettings.appNameUserDefined)
  drawerForm.setFieldValue('portMappingOnly', editRow.ruleSettings.portMappingOnly)
  drawerForm.setFieldValue('destinationIp', editRow.ruleSettings.destinationIp)
  drawerForm.setFieldValue('netmask', editRow.ruleSettings.netmask)
  drawerForm.setFieldValue('destinationPort', editRow.ruleSettings.destinationPort)
  drawerForm.setFieldValue('protocol', editRow.ruleSettings.protocol)
}

export const GenDetailsContent = (drawerForm: FormInstance, sourceValue?: string) => {
  const { $t } = useIntl()

  const detailContentType = sourceValue ? sourceValue : drawerForm.getFieldValue('accessControl')
  switch (detailContentType) {
    case ApplicationAclType.DENY:
      return $t({ defaultMessage: 'Block all traffic' })
    case ApplicationAclType.RATE_LIMIT:
      let rateLimitStr: string[] = []
      if (drawerForm.getFieldValue(['uplink'])) {
        rateLimitStr.push($t({ defaultMessage: 'Uplink - {value} Mbps' },
          { value: drawerForm.getFieldValue(['uplink']) }))
      }
      if (drawerForm.getFieldValue(['downlink'])) {
        rateLimitStr.push($t({ defaultMessage: 'Downlink - {value} Mbps' },
          { value: drawerForm.getFieldValue(['downlink']) }))
      }
      return rateLimitStr.join('|')
    case ApplicationAclType.QOS:
      return $t({
        // eslint-disable-next-line max-len
        defaultMessage: 'Uplink marking: {uplinkStrategy} ({uplinkValue}) | Downlink priority: {downlinkValue}' }, {
        uplinkStrategy: drawerForm.getFieldValue(['uplinkMarking', 'strategy']),
        uplinkValue: drawerForm.getFieldValue(['uplinkMarking', 'value']),
        downlinkValue: drawerForm.getFieldValue(['downlinkPriority', 'value'])
      })
    default:
      return $t({ defaultMessage: 'Block all traffic' })
  }
}

export const transformToApplicationRule = (
  drawerForm: FormInstance,
  appPolicyInfo: appPolicyInfoType
) => {
  return appPolicyInfo.rules.map(rule => {
    let systemDefined = {} as { [key: string]: string | number }
    let userDefined = {} as { [key: string]: string | number }
    if (rule.ruleType === ApplicationRuleType.SIGNATURE) {
      systemDefined.appNameSystemDefined = `${rule.category}_${rule.applicationName}`
      systemDefined.category = rule.category
    }
    if (rule.ruleType === ApplicationRuleType.USER_DEFINED) {
      userDefined.appNameUserDefined = rule.applicationName

      if (rule.portMapping === ApplicationPortMappingType.IP_WITH_PORT
        && rule.destinationPort
        && rule.destinationIp
        && rule.protocol
        && rule.netmask) {
        userDefined.destinationPort = rule.destinationPort
        userDefined.destinationIp = rule.destinationIp
        userDefined.netmask = rule.netmask
        userDefined.protocol = rule.protocol
      }
    }
    return {
      priority: rule.priority,
      id: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      applications: rule.applicationName,
      accessControl: rule.accessControl,
      details: GenDetailsContent(drawerForm, rule.accessControl),
      ruleSettings: {
        ...systemDefined,
        ...userDefined,
        ruleType: rule.ruleType
      }
    }
  })
}

export const genRuleObject = (drawerForm: FormInstance) => {
  return {
    ruleName: drawerForm.getFieldValue('ruleName') ?? '',
    ruleType: drawerForm.getFieldValue('ruleType'),
    applications: '-',
    accessControl: drawerForm.getFieldValue('accessControl'),
    details: GenDetailsContent(drawerForm),
    ruleSettings: {
      ruleType: drawerForm.getFieldValue('ruleType'),
      appCategory: drawerForm.getFieldValue('applicationCategory'),
      appNameSystemDefined: drawerForm.getFieldValue('applicationNameSystemDefined'),
      appNameUserDefined: drawerForm.getFieldValue('applicationNameUserDefined'),
      portMappingOnly: drawerForm.getFieldValue('portMappingOnly'),
      destinationIp: drawerForm.getFieldValue('destinationIp'),
      netmask: drawerForm.getFieldValue('netmask'),
      destinationPort: drawerForm.getFieldValue('destinationPort'),
      protocol: drawerForm.getFieldValue('protocol'),
      uplink: drawerForm.getFieldValue('uplink'),
      downlink: drawerForm.getFieldValue('downlink')
    }
  }
}

export const transformToRulesForPayload = (
  applicationsRuleList: ApplicationsRule[],
  categoryAppMappingObject: {
    [key: string]: { catId: number, appId: number }
  }
) => {
  return applicationsRuleList.map(rule => {
    let catAppConfig = {} as {
      applicationId: number, applicationName: string, category: string, categoryId: number
    }
    if (rule.ruleType === ApplicationRuleType.SIGNATURE
      && rule.ruleSettings.appNameSystemDefined
      && rule.ruleSettings.appCategory
    ) {
      const [catName, appName] = rule.ruleSettings.appNameSystemDefined.split('_')
      const catAppMapping = categoryAppMappingObject[appName]
      catAppConfig.applicationId = catAppMapping.appId
      catAppConfig.applicationName = appName
      catAppConfig.categoryId = catAppMapping.catId
      catAppConfig.category = catName
    }

    let userAppConfig = {} as {
      portMapping?: string, destinationIp?: string, netmask?: string,
      destinationPort: number, protocol: string, applicationName: string
    }
    if (rule.ruleSettings.appNameUserDefined
      && rule.ruleSettings.destinationPort
      && rule.ruleSettings.protocol) {
      userAppConfig.applicationName = rule.ruleSettings.appNameUserDefined
      userAppConfig.portMapping = rule.ruleSettings.portMappingOnly
        ? ApplicationPortMappingType.PORT_ONLY
        : ApplicationPortMappingType.IP_WITH_PORT
      if (!rule.ruleSettings.portMappingOnly) {
        userAppConfig.destinationIp = rule.ruleSettings.destinationIp
        userAppConfig.netmask = rule.ruleSettings.netmask
      }
      userAppConfig.destinationPort = rule.ruleSettings.destinationPort
    }

    return {
      ...catAppConfig,
      ...userAppConfig,
      accessControl: rule.accessControl.toUpperCase(),
      name: rule.ruleName,
      priority: rule.priority,
      ruleType: rule.ruleType
    }
  })
}
