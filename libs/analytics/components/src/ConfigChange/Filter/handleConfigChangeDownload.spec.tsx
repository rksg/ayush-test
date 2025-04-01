/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { ConfigChange, getConfigChangeEntityTypeMapping, TableProps } from '@acx-ui/components'
import { get }                                                        from '@acx-ui/config'
import { PathFilter }                                                 from '@acx-ui/utils'

import { configChanges } from '../__tests__/fixtures'

import { handleConfigChangeDownload } from './handleConfigChangeDownload'

const mockGet = jest.mocked(get)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('handleConfigChangeDownload', () => {
  const columns: TableProps<ConfigChange>['columns'] = [
    {
      title: 'Timestamp',
      width: 130,
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: {},
      defaultSortOrder: 'descend'
    },
    {
      title: 'Entity Type',
      width: 100,
      dataIndex: 'type',
      key: 'type',
      sorter: {},
      defaultSortOrder: 'descend',
      filterable: true
    },
    {
      title: 'Entity Name',
      key: 'name',
      dataIndex: 'name',
      sorter: {},
      defaultSortOrder: 'descend',
      searchable: true
    },
    {
      title: 'Configuration',
      key: 'key',
      dataIndex: 'key',
      sorter: {},
      defaultSortOrder: 'descend'
    },
    {
      title: 'Change From',
      key: 'oldValues',
      dataIndex: ['oldValues'],
      align: 'center',
      sorter: {},
      defaultSortOrder: 'descend'
    },
    {
      title: 'Change To',
      key: 'newValues',
      dataIndex: ['newValues'],
      align: 'center',
      sorter: {},
      defaultSortOrder: 'descend'
    }
  ]
  const originalBlob = global.Blob
  beforeEach(() => {
    mockGet.mockReturnValue('true')
    global.Blob = jest.fn(() => ({
      type: 'text/csv;charset=utf-8;',
      arrayBuffer: jest.fn()
    } as unknown as Blob))

    global.URL.createObjectURL = jest.fn(() => 'mock-url')
  })
  afterEach(() => {
    global.Blob = originalBlob
  })
  it('downloadConfigChangeList triggers download correctly', () => {
    const data = [...configChanges,
      {
        timestamp: '1685427082100',
        type: 'zone',
        name: 'Config_change_WLAN2',
        key: 'initialState.ccmZone.management_identifiers.map_entries.venueName',
        oldValues: ['--'],
        newValues: ['--']
      }]
    const downloadSpy = jest.fn()
    const anchorMock = document.createElement('a')
    jest.spyOn(document, 'createElement').mockReturnValue(anchorMock)
    anchorMock.click = downloadSpy
    handleConfigChangeDownload(data, columns, getConfigChangeEntityTypeMapping(true), {
      startDate: '2023-08-22T10:19:00+08:00',
      endDate: '2023-08-23T10:19:00+08:00'
    } as PathFilter)
    expect(downloadSpy).toBeCalledTimes(1)
    expect(global.Blob).toHaveBeenCalledWith(
      [ '"Timestamp","Entity Type","Entity Name","Configuration","Change From","Change To"\n' +
        '"2023-05-30T06:11:22+00:00","Zone","Config_change_WLAN2","Name","Config_change_WLAN","Config_change_WLAN2"\n' +
        '"2023-05-30T06:11:22+00:00","AP","94:B3:4F:3D:21:80","initialState.ccmAp.radio24g.radio.channel_select_mode",,"Background scanning"\n' +
        '"2023-05-30T06:11:22+00:00","AP","94:B3:4F:3D:21:80","initialState.ccmAp.radio24g.radio.channel_width",,"Auto"\n' +
        '"2023-05-30T06:11:22+00:00","WLAN","!!R770_url_sanity","initialState.CcmWlan.firewall.firewall_url_filtering_policy.enabled","false","true"\n' +
        '"2023-05-30T06:11:22+00:00","WLAN","ER-12560_1","BSS Min. Rate","12 Mbps","Default"\n' +
        '"2023-05-30T06:11:22+00:00","Zone","23A-IND-BNG-D23-Home","initialState.ccmZone.radio24g.radio.bg_scan","Disabled","Enabled"\n' +
        '"2023-05-30T06:11:22+00:00","Zone","23A-IND-BNG-D23-Home","initialState.ccmZone.radio5g.indoor_channel_range","149, 153, 157, 161, 36, 40, 44, 48","100, 104, 108, 112, 116, 120, 124, 128, 132"\n' +
        '"2023-05-30T06:11:22+00:00","Zone","someTest","unknown",,\n' +
        '"2023-05-30T06:11:22+00:00","AP","94:B3:4F:3D:21:80","initialState.ccmAp.radio24g.radio.channel_fly_mtbc",,"480"\n' +
        '"2023-05-30T06:11:22+00:00","IntentAI","Config_change_WLAN2","AI Operations: Dynamic vs Static Channel capability on 2.4 GHz radio",,"Apply"\n' +
        '"2023-05-30T06:11:22+00:00","IntentAI","94:B3:4F:3D:21:80","AI Operations: Dynamic vs Static Channel capability on 5 GHz radio",,"Apply"\n' +
        '"2023-05-30T06:11:22+00:00","Zone","Config_change_WLAN2","Name","-","-"\n'],
      { type: 'text/csv;charset=utf-8;' }
    )
  })
})
