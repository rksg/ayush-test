import { ConfigTemplateDriftRecord } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export function filterDriftRecordIdByName (input: ConfigTemplateDriftRecord[]): ConfigTemplateDriftRecord[] {
  return input.filter((record: ConfigTemplateDriftRecord) => {
    if (record.path.endsWith('Id')) {
      const isNameRecordExisted = input.some((item: ConfigTemplateDriftRecord) => {
        return item.path === `${record.path}Name`
      })
      return !isNameRecordExisted
    } else if (/Id\/\d+$/.test(record.path)) {
      const isNameRecordExisted = input.some((item: ConfigTemplateDriftRecord) => {
        return item.path === record.path.replace(/(Id)\/(\d+)$/, (match, p1, p2) => `IdName/${p2}`)
      })

      return !isNameRecordExisted
    }

    return true
  })
}
