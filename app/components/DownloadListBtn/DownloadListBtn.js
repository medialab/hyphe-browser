import './DownloadListBtn.styl'

import React from 'react'
import { FormattedMessage as T } from 'react-intl'


export default ({
  isDisabled,
  onClickDownload
}) => (
  <button
    className="download-list-btn"
    disabled={ isDisabled }
    onClick={ onClickDownload }
  >
    <T id="sidebar.contextual.downloadToCSV" />
    <span>&nbsp;</span>
    <span className="ti-download" />
  </button>
)