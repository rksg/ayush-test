import { Table, TableProps, NestedTableExpandableDefaultConfig } from '..'

const expandedRowRender = (data: Record<string, unknown>[]) => {
  const columns: TableProps<typeof data[0]>['columns'] = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' }
  ]

  return <Table columns={columns} dataSource={data} stickyHeaders={false} />
}

const expandedData = [{
  key: '1',
  date: '2014-12-24 23:12:00',
  name: 'This is production name',
  upgradeNum: 'Upgraded: 56'
}, {
  key: '2',
  date: '2014-12-24 23:18:00',
  name: 'This is production name',
  upgradeNum: 'Upgraded: 57'
}, {
  key: '3',
  date: '2014-12-24 23:25:00',
  name: 'This is production name',
  upgradeNum: 'Upgraded: 58'
}]

const columns: TableProps<typeof data[0]>['columns'] = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Platform', dataIndex: 'platform', key: 'platform' },
  { title: 'Version', dataIndex: 'version', key: 'version' },
  { title: 'Upgraded', dataIndex: 'upgradeNum', key: 'upgradeNum' },
  { title: 'Creator', dataIndex: 'creator', key: 'creator' },
  { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' }
]

const data: Record<string, unknown>[] = [{
  key: '0',
  name: 'Screem',
  platform: 'iOS',
  version: '10.3.4.5654',
  upgradeNum: 500,
  creator: 'Jack',
  createdAt: '2014-12-24 23:12:00',
  expandedRecord: expandedData.slice(0, 2)
}, {
  key: '1',
  name: 'Screem',
  platform: 'iOS',
  version: '10.3.5.5654',
  upgradeNum: 505,
  creator: 'Anne',
  createdAt: '2014-12-24 23:12:00',
  expandedRecord: expandedData.slice(2, 3)
}, {
  key: '2',
  name: 'Screem',
  platform: 'iOS',
  version: '10.3.6.5654',
  upgradeNum: 506,
  creator: 'Will',
  createdAt: '2014-12-24 23:12:00',
  expandedRecord: expandedData
}]

export function NestedTable () {
  return (<>
    Nested Table
    <Table
      columns={columns}
      expandable={{
        ...NestedTableExpandableDefaultConfig,
        expandedRowRender: (data) =>
          expandedRowRender(data.expandedRecord as Record<string, unknown>[]),
        defaultExpandedRowKeys: ['0']
      }}
      dataSource={data}
    />
  </>)
}
