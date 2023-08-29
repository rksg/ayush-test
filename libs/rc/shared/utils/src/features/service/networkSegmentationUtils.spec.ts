import { genDhcpConfigByNsgSetting } from './networkSegmentationUtils'

describe('Network Segmentation Utils', () => {

  const keaConfig = `{
    "Dhcp4": {
      "subnet4": [{
        "subnet": "192.168.10.16/28",
        "pools": [
          { "pool": "192.168.10.18 - 192.168.10.27" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.17"
          }
        ]
      },{
        "subnet": "192.168.10.32/28",
        "pools": [
          { "pool": "192.168.10.34 - 192.168.10.43" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.33"
          }
        ]
      },{
        "subnet": "192.168.10.48/28",
        "pools": [
          { "pool": "192.168.10.50 - 192.168.10.59" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.49"
          }
        ]
      },{
        "subnet": "192.168.10.64/28",
        "pools": [
          { "pool": "192.168.10.66 - 192.168.10.75" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.65"
          }
        ]
      },{
        "subnet": "192.168.10.80/28",
        "pools": [
          { "pool": "192.168.10.82 - 192.168.10.91" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.81"
          }
        ]
      },{
        "subnet": "192.168.10.96/28",
        "pools": [
          { "pool": "192.168.10.98 - 192.168.10.107" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.97"
          }
        ]
      },{
        "subnet": "192.168.10.112/28",
        "pools": [
          { "pool": "192.168.10.114 - 192.168.10.123" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.113"
          }
        ]
      },{
        "subnet": "192.168.10.128/28",
        "pools": [
          { "pool": "192.168.10.130 - 192.168.10.139" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.129"
          }
        ]
      },{
        "subnet": "192.168.10.144/28",
        "pools": [
          { "pool": "192.168.10.146 - 192.168.10.155" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.145"
          }
        ]
      },{
        "subnet": "192.168.10.160/28",
        "pools": [
          { "pool": "192.168.10.162 - 192.168.10.171" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.161"
          }
        ]
      },{
        "subnet": "192.168.10.176/28",
        "pools": [
          { "pool": "192.168.10.178 - 192.168.10.187" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.10.177"
          }
        ]
      }
      ]
    }
  }`

  const iscConfig = `subnet 192.168.10.16 netmask 255.255.255.240 {
    range 192.168.10.18 192.168.10.27;
    option routers 192.168.10.17;
}

subnet 192.168.10.32 netmask 255.255.255.240 {
    range 192.168.10.34 192.168.10.43;
    option routers 192.168.10.33;
}

subnet 192.168.10.48 netmask 255.255.255.240 {
    range 192.168.10.50 192.168.10.59;
    option routers 192.168.10.49;
}

subnet 192.168.10.64 netmask 255.255.255.240 {
    range 192.168.10.66 192.168.10.75;
    option routers 192.168.10.65;
}

subnet 192.168.10.80 netmask 255.255.255.240 {
    range 192.168.10.82 192.168.10.91;
    option routers 192.168.10.81;
}

subnet 192.168.10.96 netmask 255.255.255.240 {
    range 192.168.10.98 192.168.10.107;
    option routers 192.168.10.97;
}

subnet 192.168.10.112 netmask 255.255.255.240 {
    range 192.168.10.114 192.168.10.123;
    option routers 192.168.10.113;
}

subnet 192.168.10.128 netmask 255.255.255.240 {
    range 192.168.10.130 192.168.10.139;
    option routers 192.168.10.129;
}

subnet 192.168.10.144 netmask 255.255.255.240 {
    range 192.168.10.146 192.168.10.155;
    option routers 192.168.10.145;
}

subnet 192.168.10.160 netmask 255.255.255.240 {
    range 192.168.10.162 192.168.10.171;
    option routers 192.168.10.161;
}

subnet 192.168.10.176 netmask 255.255.255.240 {
    range 192.168.10.178 192.168.10.187;
    option routers 192.168.10.177;
}\n\n`
  it('genDhcpConfigByNsgSetting successfully', () => {
    const configs = genDhcpConfigByNsgSetting('192.168.10.1','192.168.10.200',10,10)
    expect(configs.keaDhcpConfig).toBe(keaConfig)
    expect(configs.iscDhcpConfig).toBe(iscConfig)
  })

  it('genDhcpConfigByNsgSetting failed', () => {
    const mockedErrorHandler = jest.fn()
    try{
      genDhcpConfigByNsgSetting('10.0.0.1', '10.0.10.100', 100, 20)
    }catch(err) {
      mockedErrorHandler(err)
    }
    expect(mockedErrorHandler).toBeCalledWith(
      new Error(`error: DHCP pool size is too small to configure 100 PANs
    Currently range can hold 82 number of PANs`)
    )
  })

})