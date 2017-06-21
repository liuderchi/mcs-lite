import React from 'react';
import PropTypes from 'prop-types';
import { withGetMessages } from 'react-intl-inject-hoc';
import Helmet from 'react-helmet';
import request from 'superagent';
import Section1 from '../Section1';
import Section2 from '../Section2';
import Section3 from '../Section3';
import Section4 from '../Section4';
import Section5 from '../Section5';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import messages from './messages';
import { DEFAULT_LOCALE } from '../IntlProvider/IntlProvider';
import { localeMapper } from '../../utils/localeHelper';

const defaultLocaleMapper = localeMapper(DEFAULT_LOCALE);

const GITHUB_API_URL =
  'https://api.github.com/repos/MCS-Lite/mcs-lite-app/releases/latest';

class App extends React.Component {
  static propTypes = {
    // React-intl I18n
    getMessages: PropTypes.func.isRequired,

    // React-Router HOC
    router: PropTypes.object.isRequired,
  };
  state = {
    tag: null,
  };
  componentDidMount() {
    request
      .get(GITHUB_API_URL)
      .end((err, res) => this.setState({ tag: res.body.tag_name }));
  }
  render() {
    const { getMessages: t, router } = this.props;
    const { tag } = this.state;
    // Remind: fix for netlify redirect to lower case path
    const locale = defaultLocaleMapper(router.params.locale);

    return (
      <div>
        {/* 1. Helmet */}
        <Helmet titleTemplate={`%s | ${t('titleTemplate')}`}>
          <title>{t('title')}</title>
        </Helmet>

        <Header locale={locale} />

        <Section1 tag={tag} />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 tag={tag} />

        <Footer />
      </div>
    );
  }
}

App.displayName = 'App';
App.propTypes = {
  // React-intl I18n
  getMessages: PropTypes.func.isRequired,
};

export default withGetMessages(messages, 'App')(App);