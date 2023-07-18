import { Map }               from 'immutable'
import { MessageDescriptor } from 'react-intl'

import { apGroupKeyMap }    from './mapping/apGroupKeyMap'
import { apKeyMap }         from './mapping/apKeyMap'
import { apSpecificKeyMap } from './mapping/apSpecificKeyMap'
import { enumMap }          from './mapping/enumMap'
import { wlanKeyMap }       from './mapping/wlanKeyMap'
import { zoneKeyMap }       from './mapping/zoneKeyMap'

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

const configMapGenerator = json2keymap(['value'], 'textAlto' , filteredConfigText)

const enumMapGenerator = json2keymap(['value'], 'enumType', [''])

export const enumTextMap = json2keymap(['enumType', 'value'], 'text', ['TBD'])(enumMap)

export const jsonMapping = {
  zone: {
    label: 'Zone',
    configMap: configMapGenerator(zoneKeyMap),
    enumMap: enumMapGenerator(zoneKeyMap)
  },
  wlan: {
    label: 'WLAN',
    configMap: configMapGenerator(wlanKeyMap),
    enumMap: enumMapGenerator(wlanKeyMap)
  },
  apGroup: {
    label: 'AP Group',
    configMap: configMapGenerator(apGroupKeyMap),
    enumMap: enumMapGenerator(apGroupKeyMap)
  },
  ap: {
    label: 'AP',
    configMap: configMapGenerator(apKeyMap, apSpecificKeyMap),
    enumMap: enumMapGenerator(apKeyMap, apSpecificKeyMap)
  }
}
