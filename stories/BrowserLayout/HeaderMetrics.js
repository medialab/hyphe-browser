import React from 'react';

const HeaderMetrics = () => (
    <ul className="header-metrics-container">
        <li className="hint--bottom" aria-label="12 webentities included in the corpus"><i className="metrics-icon ti-layout-column3-alt in" /> <span className="metrics">12009 <label>IN</label></span></li>
        <li className="hint--bottom" aria-label="12 webentities in prospection"><i className="metrics-icon ti-layout-column3-alt prospection" /> <span className="metrics">12k <label>prospects.</label></span></li>
        <li className="hint--bottom" aria-label="12 webentities undecided"><i className="metrics-icon ti-layout-column3-alt undecided" /> <span className="metrics">12 <label>UND.</label></span></li>
        <li className="hint--bottom" aria-label="12 webentities excluded from the corpus"><i className="metrics-icon ti-layout-column3-alt out" /> <span className="metrics">3092 <label>OUT</label></span></li>
    </ul>
)

export default HeaderMetrics;