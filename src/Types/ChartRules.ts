export interface Attribute {
  name: string
  type: string
}

export interface Any {
  all?: All[]
  fact: string
  operator: string
  value?: number
}

export interface All {
  any?: Any[]
  fact: string
  operator: string
  value?: number
  all?: All[]
}

export interface Conditions {
  all: All[]
}

export interface Params {
  colorField: string
  angleField: string
  xField: string
  yField: string
  seriesField: string
  isStack: string
  isGroup: string
}

export interface Event {
  type: string
  params: Params
}

export interface Decision {
  conditions: Conditions
  event: Event
}

export interface ChartRules {
  name: string
  attributes: Attribute[]
  decisions: Decision[]
}
