export const MAX_SEGMENT_PER_VENUE = 10000
export const MAX_DEVICE_PER_SEGMENT = 253

export const edgePinDefaultPayloadFields = [
  'id', 'name',
  'venueId', 'venueName',
  'edgeClusterInfo',
  'personaGroupId',
  'vxlanTunnelProfileId',
  'tunneledWlans',
  'distributionSwitchInfos',
  'accessSwitchInfos',
  'serviceStatus',
  'tunnelNumber',
  'edgeAlarmSummary'
]

// the logic is from https://ruckus.atlassian.net/wiki/spaces/ACX/pages/31319369/Auto+Expand+NSG+Script+for+External+DHCP+server

function cidrToSubnetMask (cidr: number) {
  if (cidr < 0 || cidr > 32) {
    throw new Error('Invalid CIDR prefix length')
  }

  const mask = new Uint8Array(4)
  mask.fill(0)
  for (let i = 0; i < cidr; i++) {
    mask[Math.floor(i / 8)] |= 1 << (7 - (i % 8))
  }

  return Array.from(mask).join('.')
}

function generateISCDHCPConfig (
  dhcpGwAddr: number[],
  dhcpPoolStart: number[],
  dhcpPoolEnd: number[],
  cidr: number
) {
  let buffer = ''

  for (let i = 0; i < dhcpGwAddr.length; i++) {
    if (dhcpPoolStart[i] === 0) {
      break
    }
    const subnet = calculateSubnetAddress(dhcpPoolStart[i], cidr)

    buffer += `subnet ${subnet} netmask ${cidrToSubnetMask(cidr)} {\n`
    buffer += `    range ${int2ip(dhcpPoolStart[i])} ${int2ip(dhcpPoolEnd[i])};\n`
    buffer += `    option routers ${int2ip(dhcpGwAddr[i])};\n`
    buffer += '}\n\n'
  }

  return buffer
}

function generateKeaDHCPConfig (
  dhcpGwAddr: number[],
  dhcpPoolStart: number[],
  dhcpPoolEnd: number[],
  cidr: number
) {
  let buffer = ''

  // Add Kea DHCP configuration header
  buffer += `{
    "Dhcp4": {
      "subnet4": [`

  // Generate subnet blocks for each DHCP pool
  for (let i = 0; i < dhcpGwAddr.length; i++) {
    if (dhcpPoolStart[i] === 0) {
      break
    }
    buffer += `{
        "subnet": "${calculateSubnetAddress(dhcpPoolStart[i], cidr)}/${cidr}",
        "pools": [
          { "pool": "${int2ip(dhcpPoolStart[i])} - ${int2ip(dhcpPoolEnd[i])}" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "${int2ip(dhcpGwAddr[i])}"
          }
        ]
      },`
  }

  // Remove the trailing comma from the last subnet block
  buffer = buffer.slice(0, -1)

  // Add Kea DHCP configuration footer
  buffer += `
      ]
    }
  }`

  return buffer
}

function ip2Long (ip: string) {
  const parts = ip.split('.')
  let long = 0
  for (let i = 0; i < 4; i++) {
    long = (long << 8) + parseInt(parts[i], 10)
  }
  return long >>> 0
}

function int2ip (ipInt: number) {
  const octet1 = (ipInt >> 24) & 255
  const octet2 = (ipInt >> 16) & 255
  const octet3 = (ipInt >> 8) & 255
  const octet4 = ipInt & 255

  return `${octet1}.${octet2}.${octet3}.${octet4}`
}


function calculateSubnetAddress (ipInt: number, cidr: number) {
  const subnetMaskInt = (0xffffffff << (32 - cidr)) >>> 0
  const subnetAddressInt = ipInt & subnetMaskInt
  const subnetAddress = int2ip(subnetAddressInt)
  return subnetAddress
}

function calculateDHCPPool (ipStart: number, ipEnd: number, panNum: number, panSize: number):
[number[], number[], number[], number] {
  let tempPanSize = 0
  let i = 2 // (32 - i) is prefix length, since max usable prefix length for MDU is 30, so i won't be 0 and 1.

  while (i <= 32) {
    tempPanSize = 1 << i
    if (tempPanSize >= panSize + 3) {
      break
    }
    i++
  }

  const PANIPSize = tempPanSize
  const PANNetNumberMaskBits = 32 - i

  // Determine the first and last usable IP address based on ip_start and ip_end
  // Usable means Ip subnet will be used for DHCP pool.
  const pinIPStart = ipStart >= 2
    ? Math.floor((ipStart - 2) / PANIPSize + 1) * PANIPSize
    : 0
  const pinIPEnd = Math.floor((ipEnd + 2) / PANIPSize) * PANIPSize - 1

  // Determine if pan_num can be allowed based on given dhcp ip range
  const pinPANNumMax = Math.floor((pinIPEnd - pinIPStart + 1) / PANIPSize)
  if (pinPANNumMax < panNum) {
    throw new Error(`error: DHCP pool size is too small to configure ${panNum} PANs
    Currently range can hold ${pinPANNumMax} number of PANs`)
  }

  const dhcpGwAddr = []
  const dhcpPoolStart = []
  const dhcpPoolEnd = []

  // Given a pool index i, calculate DHCP pool range and GW address
  for (let i = 0; i < panNum; i++) {
    const baseIP = i * PANIPSize + pinIPStart
    dhcpGwAddr[i] = baseIP + 1
    dhcpPoolStart[i] = baseIP + 2
    dhcpPoolEnd[i] = baseIP + PANIPSize -2
  }

  return [dhcpGwAddr, dhcpPoolStart, dhcpPoolEnd, PANNetNumberMaskBits]
}

export function genDhcpConfigByPinSetting
(
  ipStart: string,
  ipEnd: string,
  panSize: number,
  devicePerPan: number
) {
  const [dhcpGwAddr, dhcpPoolStart, dhcpPoolEnd, cidr] = calculateDHCPPool(
    ip2Long(ipStart),
    ip2Long(ipEnd),
    panSize,
    devicePerPan
  )

  return {
    keaDhcpConfig: generateKeaDHCPConfig(dhcpGwAddr, dhcpPoolStart, dhcpPoolEnd, cidr),
    iscDhcpConfig: generateISCDHCPConfig(dhcpGwAddr, dhcpPoolStart, dhcpPoolEnd, cidr)
  }
}