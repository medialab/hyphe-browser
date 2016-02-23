import { PropTypes } from 'react'

const { shape, string, bool, object, func } = PropTypes


export const tabShape = shape({
  url: string.isRequired,
  id: string.isRequired,
  title: string,
  icon: string,
  loading: bool,
  error: object,
  fixed: bool,
  navigable: bool
})

export const eventBusShape = shape({
  on: func.isRequired,
  off: func.isRequired,
  emit: func.isRequired
})
