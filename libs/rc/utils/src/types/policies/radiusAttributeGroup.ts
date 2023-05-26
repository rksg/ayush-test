export interface RadiusAttribute {
  id: string,
  name: string,
  vendorName: string,
  showOnDefault: boolean,
  dataType: string
}

export interface AttributeAssignment {
  id?: string,
  attributeName: string,
  operator: OperatorType,
  attributeValue: string,
  dataType: DataType,
  operatorName?: string
}

export interface RadiusAttributeGroup {
  id?: string,
  name: string,
  description?: string,
  attributeAssignments: AttributeAssignment []
}

export interface RadiusAttributeVendor{
  supportedVendors: string []
}

export interface treeNode {
  value: string
  title: string
  selectable: boolean
  children?: treeNode [] | undefined
  isLeaf: boolean,
  dataType?: string
}

export interface Assignment {
  id?:string,
  externalAssignmentIdentifier: string,
  serviceName: string
}

export enum OperatorType {
  ADD = 'ADD',
  ADD_REPLACE = 'ADD_REPLACE',
  DOES_NOT_EXIST = 'DOES_NOT_EXIST'
}

export enum DataType {
  ABINARY = 'ABINARY',
  BYTE = 'BYTE',
  COMBO_IP = 'COMBO_IP',
  ETHER = 'ETHER',
  IFID = 'IFID',
  INTEGER = 'INTEGER',
  IPADDR = 'IPADDR',
  IPV6ADDR = 'IPV6ADDR',
  IPV6PREFIX = 'IPV6PREFIX',
  OCTETS = 'OCTETS',
  OTHER = 'OTHER',
  STRING = 'STRING',
  SIGNED = 'SIGNED',
  SHORT = 'SHORT',
  TLV = 'TLV'
}
