import { Map }               from 'immutable'
import { MessageDescriptor } from 'react-intl'

import { ConfigChange } from '@acx-ui/components'
import { get }          from '@acx-ui/config'

import { apGroupKeyMap }             from './mapping/apGroupKeyMap'
import { apKeyMap }                  from './mapping/apKeyMap'
import { apSpecificKeyMap }          from './mapping/apSpecificKeyMap'
import { enumMap }                   from './mapping/enumMap'
import { ethernetPortProfileKeyMap } from './mapping/ethernetPortProfileKeyMap'
import { wlanGroupKeyMap }           from './mapping/wlanGroupKeyMap'
import { wlanKeyMap }                from './mapping/wlanKeyMap'
import { zoneKeyMap }                from './mapping/zoneKeyMap'

const filteredConfigText = ['TBD', 'NA']

export type EntityType = 'zone' | 'wlan' | 'apGroup' | 'ap'

type MappingFields = 'text' | 'textAlto' | 'enumType'

export type MappingType = {
  id: number,
  value: string,
  text: MessageDescriptor | string,
  textAlto?: MessageDescriptor | string,
  enumType: string,
  incidents?: {},
  kpis?: {}
}

export const json2keymap = (keyFields: string[], field: string, filter: string[]) =>
  (...mappings: MappingType[][]) => mappings.flatMap(items => items)
    .filter(item =>
      (typeof item[field as MappingFields] !== 'string') ||
       !filter.includes(item[field as MappingFields] as string))
    .reduce((map, item) => map.set(
      keyFields.map(keyField => item[keyField as keyof MappingType]).join('-'),
      item[field as MappingFields]!
    ), Map<string, MessageDescriptor | string>())

const configMapGenerator = json2keymap(
  ['value'], get('IS_MLISA_SA') ? 'text' : 'textAlto' , filteredConfigText)

const enumMapGenerator = json2keymap(['value'], 'enumType', [''])

export const enumTextMap = json2keymap(['enumType', 'value'], 'text', ['TBD'])(enumMap)

export const jsonMapping = {
  zone: {
    configMap: configMapGenerator(zoneKeyMap),
    enumMap: enumMapGenerator(zoneKeyMap)
  },
  wlanGroup: {
    configMap: configMapGenerator(wlanGroupKeyMap),
    enumMap: enumMapGenerator(wlanGroupKeyMap)
  },
  wlan: {
    configMap: configMapGenerator(wlanKeyMap),
    enumMap: enumMapGenerator(wlanKeyMap)
  },
  apGroup: {
    configMap: configMapGenerator(apGroupKeyMap),
    enumMap: enumMapGenerator(apGroupKeyMap)
  },
  ap: {
    configMap: configMapGenerator(apKeyMap, apSpecificKeyMap),
    enumMap: enumMapGenerator(apKeyMap, apSpecificKeyMap)
  }
}

const configChangekpiMap = [
  ...apKeyMap,
  ...apSpecificKeyMap,
  ...apGroupKeyMap,
  ...ethernetPortProfileKeyMap,
  ...wlanGroupKeyMap,
  ...wlanKeyMap,
  ...zoneKeyMap
].reduce((configMap, config) => {
  configMap[config.value] = Object.keys(config.kpis)
  return configMap
}, {} as Record<string, string[]>)

export const filterData = (data: ConfigChange[], kpiKeys: string[], legend: string[]) =>
  data.filter(row => legend.includes(row.type)).map(
    (value, filterId)=>({ ...value, filterId })).filter(row => kpiKeys.length
    ? kpiKeys.some(k => configChangekpiMap[row.key]?.includes(k))
    : true)
