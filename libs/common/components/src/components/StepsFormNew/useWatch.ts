import { Form, FormInstance } from 'antd'
import { NamePath }           from 'antd/lib/form/interface'

// doesn't support NamePath
export function useWatch <Record, Key extends keyof Record> (
  path: Key,
  form: FormInstance<Record>
): Record[Key] {
  const p = path as NamePath
  // The || is to ensure there is no delay in getting the value
  // Which is to prevent unnecessary trigger of certain useEffect
  return Form.useWatch(p, form) || form.getFieldValue(p)
}
