import React from 'react'


// corpus.memory_structure.webentities.DISCOVERED/IN/OUT/UNDECIDED

export default ({ counters }) => (
  <div className="corpus-statuses">
    <span className="corpus-status corpus-status-IN" title="IN">{ counters.IN }</span>
    <span className="corpus-status corpus-status-UNDECIDED" title="UNDECIDED">{ counters.UNDECIDED }</span>
    <span className="corpus-status corpus-status-OUT" title="OUT">{ counters.OUT }</span>
    <span className="corpus-status corpus-status-DISCOVERED" title="DISCOVERED">{ counters.DISCOVERED }</span>
  </div>
)
