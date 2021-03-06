import React from 'react'
//import MenuBar from 'appirio-tech-react-components/components/MenuBar/MenuBar'
import moment from 'moment'
import MediaQuery from 'react-responsive'
//import FooterV2 from '../FooterV2/FooterV2'
import { NEW_PROJECT_PATH, SCREEN_BREAKPOINT_MD } from '../../config/constants'

require('./Footer.scss')

const Footer = () => {
  const currentYear = moment().format('YYYY')
  /*const otherNavigationItems = [
    {img: '', text: 'Aboutss', link: 'https://www.topcoder.com/company/', target: '_blank'},
    {img: '', text: 'Contact us', link: 'https://www.topcoder.com/contact-us/', target: '_blank'},
    {img: '', text: 'Privacy', link: 'https://www.topcoder.com/privacy-policy/', target: '_blank'},
    {img: '', text: 'Terms', link: 'https://connect.topcoder.com/terms', target: '_blank'},
    {img: '', text: 'Our Process', link: 'https://www.topcoder.com/solutions/how-it-works/', target: '_blank'}
  ]*/
  const isProjectDetails = /projects\/\d+/.test(window.location.pathname)
  const isCreateProject = window.location.pathname.startsWith(NEW_PROJECT_PATH)
  const isNotificationsPage = window.location.pathname.startsWith('/notifications')
  const isSettingsPage = window.location.pathname.startsWith('/settings/')

  // TODO this looks like a bad way of doing it, I think it should be re-factored
  const shouldHideOnDesktop = isProjectDetails || isCreateProject || isNotificationsPage || isSettingsPage

  return (
    <MediaQuery minWidth={SCREEN_BREAKPOINT_MD}>
      {(matches) => {
        if (matches) {
          return (shouldHideOnDesktop ? null :
            <div className="Footer">
              <p className="copyright-notice">© Topcoder { currentYear }</p>
              {/*<div className="footer-menu">
                <MenuBar items={otherNavigationItems} orientation="horizontal" mobileBreakPoint={SCREEN_BREAKPOINT_MD - 1} />
          </div>*/}
            </div>
          )
        } else {
          {/* never show footer on mobile */}
          return null
        }
      }}
    </MediaQuery>
  )
}

export default Footer
