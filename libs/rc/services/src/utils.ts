import { ApiInfo, TableResult } from '@acx-ui/rc/utils'

type MetaBase = { id: string }

export function getMetaList<T extends MetaBase> (
  list: TableResult<T>,
  metaListInfo: { urlInfo: ApiInfo, fields: string[] }
) {
  const httpRequest = metaListInfo.urlInfo
  const body = {
    fields: metaListInfo.fields,
    filters: {
      id: list.data.map((item: { id: string }) => item.id)
    }
  }
  return {
    ...httpRequest, body
  }
}
