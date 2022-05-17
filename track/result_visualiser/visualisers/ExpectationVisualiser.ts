import React from "react"

interface Expectation<Args, Meta> {
  name: string
  success: boolean
  critical: boolean
  message: string
  args: Args
  meta: Meta
}

export interface ExpectationVisualiser<
  Args extends Record<string, any>,
  Meta extends Record<string, any> = {}
> {
  Title?: React.FC<{ expectation: Expectation<Args, Meta> }>
  Body?: React.FC<{ expectation: Expectation<Args, Meta> }>
}
