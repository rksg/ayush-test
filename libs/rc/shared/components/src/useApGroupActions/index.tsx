import { useApGroupsListQuery } from '@acx-ui/rc/services'

export const defaultApGroupsFilterOptsPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC',
  filters: { isDefault: [false] }
}

export const useApGroupsFilterOpts =
  (filters?: Record<string, unknown[]>)
   : ({ key: string, value: string }[] | boolean) => {

    const payload = {
      ...defaultApGroupsFilterOptsPayload,
      ...(filters && { filters })
    }

    const { apGroupOptions } = useApGroupsListQuery({
      payload,
      enableRbac: true
    }, {
      selectFromResult: ({ data }) => ({
        apGroupOptions: data?.data.map((v) => ({ key: v.id, value: v.name })) || true
      })
    })

    return apGroupOptions
  }