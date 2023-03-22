import { FormInstance } from 'antd'

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
  // eslint-disable-next-line max-len
  drawerForm.setFieldValue('uplink', editRow.ruleSettings.uplink ? editRow.ruleSettings.uplink / 1000 : undefined)
  // eslint-disable-next-line max-len
  drawerForm.setFieldValue('downlink', editRow.ruleSettings.downlink ? editRow.ruleSettings.downlink / 1000 : undefined)
  drawerForm.setFieldValue(['uplinkMarking', 'value'], editRow.ruleSettings.upLinkMarkingType)
  drawerForm.setFieldValue(['downlinkPriority', 'value'], editRow.ruleSettings.downLinkMarkingType)
  drawerForm.setFieldValue(['uplinkMarking', 'strategy'], editRow.ruleSettings.markingPriority)
}

export const transformToApplicationRule = (
  drawerForm: FormInstance,
  appPolicyInfo: appPolicyInfoType
) => {
  return appPolicyInfo.rules.map((rule, ruleId) => {
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

    let rateLimitObject = {} as { uplink?: number, downlink?: number }
    if (rule.accessControl === ApplicationAclType.RATE_LIMIT) {
      rateLimitObject.uplink = rule.uplink
      rateLimitObject.downlink = rule.downlink
    }
    return {
      priority: ruleId + 1,
      id: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      applications: rule.applicationName,
      accessControl: rule.accessControl,
      details: rule.accessControl,
      ruleSettings: {
        ...systemDefined,
        ...userDefined,
        ...rateLimitObject,
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
    details: drawerForm.getFieldValue('accessControl'),
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
      uplink: drawerForm.getFieldValue('uplink') * 1000,
      downlink: drawerForm.getFieldValue('downlink') * 1000,
      upLinkMarkingType: drawerForm.getFieldValue(['uplinkMarking', 'value']),
      markingPriority: drawerForm.getFieldValue(['uplinkMarking', 'strategy']),
      downLinkMarkingType: drawerForm.getFieldValue(['downlinkPriority', 'value'])
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

    if (rule.accessControl.toUpperCase() === ApplicationAclType.QOS) {
      delete rule.ruleSettings.uplink
      delete rule.ruleSettings.downlink
      delete rule.ruleSettings.appNameSystemDefined
    }

    let ruleId = {} as { id: string }
    if (rule.id) {
      ruleId.id = rule.id
    }

    return {
      ...ruleId,
      ...rule.ruleSettings,
      ...catAppConfig,
      ...userAppConfig,
      accessControl: rule.accessControl.toUpperCase(),
      name: rule.ruleName,
      priority: rule.priority,
      ruleType: rule.ruleType
    }
  })
}
