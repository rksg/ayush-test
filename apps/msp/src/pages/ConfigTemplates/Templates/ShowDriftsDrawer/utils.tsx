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

export function DriftInstanceRow (props: { head: React.ReactNode, body: React.ReactNode }) {
  const { head, body } = props
  return <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
    <div style={{ flex: '0 0 26px' }}>{head}</div>
    <div style={{ flex: '1 1 auto' }}>{body}</div>
  </div>
}
