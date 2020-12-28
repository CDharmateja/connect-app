import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ProjectStatusChangeConfirmation from './ProjectStatusChangeConfirmation'
import cn from 'classnames'
import _ from 'lodash'
import enhanceDropdown from 'appirio-tech-react-components/components/Dropdown/enhanceDropdown'
import Tooltip from 'appirio-tech-react-components/components/Tooltip/Tooltip'
import {
  PROJECT_STATUS,
  PROJECT_STATUS_COMPLETED,
  PROJECT_STATUS_CANCELLED,
  PROJECT_STATUS_DRAFT,
  TOOLTIP_DEFAULT_DELAY
} from '../../config/constants'
import CarretDownNormal9px from '../../assets/icons/arrow-9px-carret-down-normal.svg'
import { hasPermission } from '../../helpers/permissions'
import { PERMISSIONS } from '../../config/permissions'


const hocStatusDropdown = (CompositeComponent, statusList) => {
  class StatusDropdown extends Component {
    shouldDropdownUp() {
      if (this.refs.dropdown) {
        const bounds = this.refs.dropdown.getBoundingClientRect()
        const windowHeight = window.innerHeight

        return bounds.top > windowHeight / 2
      }

      return false
    }

    render() {
      const { canEdit, isOpen, handleClick, onItemSelect, showText, withoutLabel, unifiedHeader, status } = this.props
      const selected = statusList.filter((opt) => opt.value === status)[0] || PROJECT_STATUS[0]
      if (!selected) {
        return null
      }

      this.shouldDropdownUp()
      return (
        <div className="project-status-dropdown" ref="dropdown">
          <div
            className={cn('status-header', 'status-' + selected.value, { active: isOpen, editable: canEdit })}
            onClick={handleClick}
          >
            <CompositeComponent
              status={selected}
              showText={showText}
              withoutLabel={withoutLabel}
              unifiedHeader={unifiedHeader}
            />
            { canEdit && <i className="caret" >
              <CarretDownNormal9px className="icon-carret-down-normal" />
            </i> }
          </div>
          { isOpen && canEdit &&
            <div className={cn('status-dropdown', { 'dropdown-up': this.shouldDropdownUp() })}>
              <div className="status-header">Project Status</div>
              <ul>
                {
                  statusList.sort((a, b) => a.order - b.order).map((item) => {
                    const selectItem = (
                      <li key={item.value}>
                        <a
                          href="javascript:"
                          className={cn('status-option', 'status-' + item.value, { active: item.value === status, disabled: item.disabled })}
                          onClick={(e) => {
                            if (!item.disabled)
                              onItemSelect(item.value, e)
                          }}
                        >
                          <CompositeComponent status={item} showText />
                        </a>
                      </li>
                    )

                    return item.toolTipMessage ? (
                      <Tooltip theme="light" tooltipDelay={TOOLTIP_DEFAULT_DELAY} key={item.value} usePortal>
                        <div className="tooltip-target">
                          {selectItem}
                        </div>
                        <div className="tooltip-body">
                          {item.toolTipMessage}
                        </div>
                      </Tooltip>
                    ) : selectItem
                  })
                }
              </ul>
            </div>
          }
        </div>
      )
    }
  }

  return StatusDropdown
}

const editableProjectStatus = (CompositeComponent) => class extends Component {
  constructor(props) {
    super(props)
    this.state = { showStatusChangeDialog : false }
    this.hideStatusChangeDialog = this.hideStatusChangeDialog.bind(this)
    this.showStatusChangeDialog = this.showStatusChangeDialog.bind(this)
    this.changeStatus = this.changeStatus.bind(this)
    this.handleReasonUpdate = this.handleReasonUpdate.bind(this)
    this.getProjectStatusDropdownValues = this.getProjectStatusDropdownValues.bind(this)
  }

  componentWillReceiveProps() {
    this.setState({ showStatusChangeDialog : false })
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  showStatusChangeDialog(newStatus) {
    if (newStatus === PROJECT_STATUS_COMPLETED || newStatus === PROJECT_STATUS_CANCELLED) {
      this.setState({ newStatus, showStatusChangeDialog : true })
    } else {
      (this.props.projectId) ? this.props.onChangeStatus(this.props.projectId, newStatus) : this.props.onChangeStatus(newStatus)
    }
  }

  hideStatusChangeDialog() {
    // set flag off for showing the status change dialog
    // resets the status change reason so that it starts from fresh on next status change
    this.setState({ showStatusChangeDialog : false, statusChangeReason: null })
  }

  changeStatus() {
    (this.props.projectId) ?
      this.props.onChangeStatus(this.props.projectId, this.state.newStatus, this.state.statusChangeReason)
      : this.props.onChangeStatus(this.state.newStatus, this.state.statusChangeReason)

  }

  handleReasonUpdate(reason) {
    this.setState({ statusChangeReason : _.get(reason, 'value') })
  }

  getProjectStatusDropdownValues(status) {
    const statusList = status === PROJECT_STATUS_DRAFT
      // if current status, is "Draft" which is deprecated, then show it on the list
      ? [{color: 'gray', name: 'Draft', fullName: 'Project is in draft', value: PROJECT_STATUS_DRAFT, order: 2, dropDownOrder: 1 }].concat(PROJECT_STATUS)
      // otherwise don't show deprecated status
      : PROJECT_STATUS

    if (hasPermission(PERMISSIONS.EDIT_PROJECT_STATUS_TO_SPECIAL)) {
      return statusList
    } else {
      return statusList.map((statusOption) => {
        // if option is not special anyone can choose it
        // also, don't disable special option, if it's the current value
        if (!statusOption.isSpecial || statusOption.value === status) {
          return statusOption
        }

        return {
          ...statusOption,
          disabled: true,
          toolTipMessage: 'Only managers and admins can change to this status'
        }
      })
    }
  }

  render() {
    const { showStatusChangeDialog, newStatus, statusChangeReason } = this.state
    const { canEdit, status } = this.props
    const PROJECT_STATUS_VALUES = this.getProjectStatusDropdownValues(status)
    const StatusDropdown = canEdit
      ? enhanceDropdown(hocStatusDropdown(CompositeComponent, PROJECT_STATUS_VALUES))
      : hocStatusDropdown(CompositeComponent, PROJECT_STATUS_VALUES)
    return (
      <div className={cn('EditableProjectStatus', {'modal-active': showStatusChangeDialog})}>
        <div className="modal-overlay" onClick={ this.hideStatusChangeDialog }/>
        <StatusDropdown {...this.props } onItemSelect={ this.showStatusChangeDialog } />
        { showStatusChangeDialog &&
          <ProjectStatusChangeConfirmation
            newStatus={ newStatus }
            onConfirm={ this.changeStatus }
            onCancel={ this.hideStatusChangeDialog }
            onReasonUpdate={ this.handleReasonUpdate }
            statusChangeReason={ statusChangeReason }
          />
        }
      </div>
    )
  }
}

editableProjectStatus.propTypes = {
  /**
   * Boolean flag to control editability of the project status. It does not render the dropdown if it is not editable.
   */
  canEdit: PropTypes.bool,
  /**
   * String representing project status
   */
  status: PropTypes.string
}

export default editableProjectStatus
