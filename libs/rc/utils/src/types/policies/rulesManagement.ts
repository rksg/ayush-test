
export interface AdaptivePolicySet {
  id: string,
  name: string,
  description: string
}

export interface RuleTemplate {
  id: string,
  name: string,
  description: string,
  ruleType: RuleType,
  templateReturnType: TemplateReturnType
}

export interface RuleAttribute {
  id: string,
  name: string,
  attributeTextMatch: string,
  attributeType: string
}

export interface AccessCondition {
  id: string,
  name: string,
  templateAttributeId: string,
  evaluationRule: EvaluationRule
}

export interface EvaluationRule {
  criteriaType: string,
  regexStringCriteria: string
}

export enum RuleType {
  BASE = 'BASE',
  RADIUS = 'RADIUS',
  DPSK = 'DPSK'
}

export enum TemplateReturnType {
  NONE = 'NONE',
  RADIUS_ATTRIB_GROUP = 'RADIUS_ATTRIB_GROUP'
}

export enum CriteriaOption {
  BOOLEAN = 'BooleanCriteria',
  STRING = 'StringCriteria',
  NUMBER = 'NumberCriteria',
  DATE_RANGE = 'DateRangeCriteria'
}

