import { FormInstance } from 'antd'

import {
  ApplicationAclType,
  ApplicationPortMappingType,
  ApplicationRuleType,
  appPolicyInfoType,
  AvcCategory
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
  drawerForm.setFieldValue(['uplinkMarking', 'value'], editRow.ruleSettings.markingPriority)
  drawerForm.setFieldValue(['downlinkPriority', 'value'], editRow.ruleSettings.downLinkMarkingType)
  drawerForm.setFieldValue(['uplinkMarking', 'strategy'], editRow.ruleSettings.upLinkMarkingType)
}

export const transformToApplicationRule = (
  drawerForm: FormInstance,
  appPolicyInfo: appPolicyInfoType
) => {
  return appPolicyInfo.rules.map((rule, ruleId) => {
    let systemDefined = {} as { [key: string]: string | number }
    let userDefined = {} as { [key: string]: string | number }
    let application = rule.applicationName
    if (rule.ruleType === ApplicationRuleType.SIGNATURE) {
      application = `${rule.category} > ${rule.applicationName}`
      systemDefined.appNameSystemDefined = `${rule.category}_${rule.applicationName}`
      systemDefined.category = rule.category
    }
    if (rule.ruleType === ApplicationRuleType.USER_DEFINED) {
      userDefined.appNameUserDefined = rule.applicationName

      if (rule.portMapping === ApplicationPortMappingType.IP_WITH_PORT
        && rule.destinationIp
        && rule.netmask) {
        userDefined.netmask = rule.netmask
      }

      userDefined.protocol = rule.protocol!
      userDefined.destinationPort = rule.destinationPort!
      userDefined.destinationIp = rule.destinationIp!
    }

    let rateLimitObject = {} as { uplink?: number, downlink?: number }
    if (rule.accessControl === ApplicationAclType.RATE_LIMIT) {
      rateLimitObject.uplink = rule.uplink
      rateLimitObject.downlink = rule.downlink
    }

    let qosObject = {} as {
      upLinkMarkingType: string | undefined,
      markingPriority: string | undefined,
      downLinkMarkingType: string | undefined
    }
    if (rule.accessControl === ApplicationAclType.QOS) {
      qosObject.upLinkMarkingType = rule.upLinkMarkingType
      qosObject.markingPriority = rule.markingPriority
      qosObject.downLinkMarkingType = rule.downLinkMarkingType
    }

    return {
      priority: ruleId + 1,
      id: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      applications: rule.applicationName,
      application: application,
      accessControl: rule.accessControl,
      details: rule.accessControl,
      ruleSettings: {
        ...systemDefined,
        ...userDefined,
        ...rateLimitObject,
        ...qosObject,
        ruleType: rule.ruleType
      }
    }
  })
}

export const genRuleObject = (drawerForm: FormInstance) => {
  const application = drawerForm.getFieldValue('ruleType') === ApplicationRuleType.USER_DEFINED ?
    // eslint-disable-next-line max-len
    drawerForm.getFieldValue('applicationNameUserDefined') : drawerForm.getFieldValue('applicationNameSystemDefined').replace('_', ' > ')
  return {
    ruleName: drawerForm.getFieldValue('ruleName') ?? '',
    ruleType: drawerForm.getFieldValue('ruleType'),
    applications: '-',
    application: application,
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
      upLinkMarkingType: drawerForm.getFieldValue(['uplinkMarking', 'strategy']),
      markingPriority: drawerForm.getFieldValue(['uplinkMarking', 'value']),
      downLinkMarkingType: drawerForm.getFieldValue(['downlinkPriority', 'value'])
    }
  }
}

export const transformToRulesForPayload = (
  applicationsRuleList: ApplicationsRule[],
  categoryAppMap: { [key: string]: { catId: number, appId: number } },
  avcCategoryList: AvcCategory[]
) => {
  return applicationsRuleList.map(rule => {
    let appConfig = {} as { [key: string]: string | number }
    if (isSystemDefinedRule(rule)) {
      appConfig = transformCatAppConfigForPayload(rule, categoryAppMap, avcCategoryList)
    } else if (isUserDefinedRule(rule)) {
      appConfig = transformUserAppConfigForPayload(rule)
    }

    const aclConfig = transformAccessControlForPayload(rule)

    let ruleId = {} as { id: string }
    if (rule.id) {
      ruleId.id = rule.id
    }

    Object.keys(appConfig).forEach(key => {
      if (appConfig[key] === undefined) {
        delete appConfig[key]
      }
    })

    return {
      ...ruleId,
      ...appConfig,
      ...aclConfig,
      accessControl: rule.accessControl.toUpperCase(),
      name: rule.ruleName,
      priority: rule.priority,
      ruleType: rule.ruleType
    }
  })
}

function transformCatAppConfigForPayload (
  rule: ApplicationsRule,
  categoryAppMap: { [key: string]: { catId: number, appId: number } },
  avcCategoryList: AvcCategory[]
) {
  let catAppConfig = {} as {
    applicationId: number, applicationName: string, category: string, categoryId: number
  }

  const [catName, appName] = rule.ruleSettings.appNameSystemDefined!.split('_')
  let catAppMapping: { catId: number, appId: number }

  if (appName === 'All') {
    const targetCategory = avcCategoryList.find(category => category.catName === catName)
    catAppMapping = {
      appId: 0,
      catId: targetCategory!.catId
    }
  } else {
    catAppMapping = categoryAppMap[appName]
  }
  catAppConfig.applicationId = catAppMapping.appId
  catAppConfig.applicationName = appName
  catAppConfig.categoryId = catAppMapping.catId
  catAppConfig.category = catName

  return catAppConfig
}

function transformUserAppConfigForPayload (rule: ApplicationsRule) {
  let userAppConfig = {
    applicationName: rule.ruleSettings.appNameUserDefined,
    destinationPort: rule.ruleSettings.destinationPort,
    protocol: rule.ruleSettings.protocol,
    portMapping: rule.ruleSettings.portMappingOnly || rule.ruleSettings.destinationIp === undefined
      ? ApplicationPortMappingType.PORT_ONLY
      : ApplicationPortMappingType.IP_WITH_PORT
  } as {
    portMapping?: string, destinationIp?: string, netmask?: string,
    destinationPort: number, protocol: string, applicationName: string
  }

  if (!rule.ruleSettings.portMappingOnly) {
    userAppConfig.destinationIp = rule.ruleSettings.destinationIp
    userAppConfig.netmask = rule.ruleSettings.netmask
  }

  return userAppConfig
}

function isSystemDefinedRule (rule: ApplicationsRule) {
  return rule.ruleType === ApplicationRuleType.SIGNATURE && rule.ruleSettings.appNameSystemDefined
}

function isUserDefinedRule (rule: ApplicationsRule) {
  return rule.ruleSettings.appNameUserDefined &&
    rule.ruleSettings.destinationPort &&
    rule.ruleSettings.protocol
}

interface AppAccessControlPayload {
  uplink?: number,
  downlink?: number,
  markingPriority?: string,
  upLinkMarkingType?: string,
  downLinkMarkingType?: string,
}

function transformAccessControlForPayload (rule: ApplicationsRule) {
  let config: AppAccessControlPayload = {}

  if (rule.accessControl === ApplicationAclType.RATE_LIMIT) {
    config.uplink = rule.ruleSettings.uplink
    config.downlink = rule.ruleSettings.downlink
  } else if (rule.accessControl === ApplicationAclType.QOS) {
    config.downLinkMarkingType = rule.ruleSettings.downLinkMarkingType
    config.upLinkMarkingType = rule.ruleSettings.upLinkMarkingType
    config.markingPriority = rule.ruleSettings.markingPriority
  }

  return config
}
