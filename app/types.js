import { PropTypes } from 'react'

const { shape, string, bool, object } = PropTypes


export const tabShape = shape({
  url: string.isRequired,
  id: string.isRequired,
  title: string,
  icon: string,
  loading: bool,
  error: object,
  fixed: bool
})
