export interface RadiusAttribute {
  id: string,
  name: string,
  vendorName?: string,
  showOnDefault: boolean,
  dataType: string
}

export interface AttributeAssignment {
  id?: string,
  attributeName: string,
  operator: string,
  attributeValue: string,
  dataType: string
}

export interface RadiusAttributeGroup {
  id: string,
  name: string,
  description?: string,
  attributeAssignments: AttributeAssignment []
}
