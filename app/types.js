import { PropTypes } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

const { shape, string, bool, object, number } = PropTypes
const { contains, mapOf, setOf, orderedSetOf } = ImmutablePropTypes


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

export const hypheSubStatusShape = contains({
  crawls_pending: number.isRequired,
  crawls_running: number.isRequired
})

export const corpusStatusShape = contains({
  corpus: contains({
    ready: bool,
    crawler:  contains({
      jobs_pending: number.isRequired,
      jobs_running: number.isRequired
    }) // defined only if ready
  }).isRequired,
  hyphe: hypheSubStatusShape.isRequired
})

export const corpusShape = contains({
  corpus_id: string.isRequired,
  name: string.isRequired,
  password: bool,
  status: string.isRequired,
  created_at: number.isRequired,
  last_activity: number.isRequired,
  webentities_in: number.isRequired,
  tagsCategories: orderedSetOf(string).isRequired
})

export const webentityShape = contains({
  id: string.isRequired,
  homepage: string,
  name: string.isRequired,
  status: string.isRequired,
  tags: mapOf(
    /* USER */mapOf(
      /* category */
      setOf(string).isRequired
    ).isRequired
  ).isRequired
})
