export interface AdaptivePolicySet {
  id: string,
  name: string,
  description: string
}

export interface AdaptivePolicy {
  id: string,
  name: string,
  description: string,
  policyType: string,
  onMatchResponse: string
}

export interface PrioritizedPolicy {
  policyId: string,
  priority?: number
}

export interface RuleTemplate {
  id: string,
  name: string,
  description: string,
  ruleType: RuleType,
  returnType: TemplateReturnType
}

export interface RuleAttribute {
  id: string,
  name: string,
  attributeTextMatch: string,
  attributeType: string
}

export interface AccessCondition {
  id: string,
  name?: string,
  templateAttributeId: number | null,
  evaluationRule: EvaluationRule,
  policyId?: string
}

export interface CriteriaFormData {
  criteriaType: string,
  attributeValue: string,
  when: string,
  start: string,
  end: string
}

export interface EvaluationRule {
  criteriaType: CriteriaOption,
  regexStringCriteria?: string,
  booleanCriteria?: boolean,
  numberCriteria?: number,
  dateRangeCriteria?: DateRangeCriteria
}

export interface DateRangeCriteria {
  when: string,
  startTime: string,
  endTime: string
}

export enum RuleType {
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

