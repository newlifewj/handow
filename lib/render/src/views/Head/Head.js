import { React, cx, eventBus, setting } from '../../Depends';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import { BrowserHistory } from 'react-router';
import style from './Head.scss';
import PropType from 'prop-types';

import Button from '@material-ui/core/Button';

import { withWidth } from '@material-ui/core';

import record from '../../services/record';
import storyTitle from './headStoryTitle';
// import { browserHistory } from 'react-router';

class Head extends React.Component {
    constructor(props) {
        super(props);
        this.state = { _$_: false };
        this.backHome = () => {
            storyTitle.set(null);
            this.setState( { _$_: !this.state._$_ } );
            eventBus.emit( eventBus.labels.viewUpdate );
        };

    }
    render() {
        return (
            <div className={cx(style.head)}>

                <div className={cx(style.logo)} style={{ marginLeft: this.props.width == 'xs' ? '5px' : '30px' }}></div>

                <div id='logo-head' className={style.title}>
                    <span>{window._projectTitle} - {record.getPlanName()}</span>
                    { storyTitle.title() && <span style={{ color: 'dimgrey', fontFamily: 'monospace' }}>&nbsp;|&nbsp;{storyTitle.title()}</span> }
                </div>
                { storyTitle.title() &&
                    <Button variant="contained" color="secondary" size="large"  style={{ margin: "5px 5px 5px auto" }}
                        h4w='button-back-homepage' onClick={ this.backHome }>
                        Homepage
                    </Button>
                }
            </div>
        );
    }
    componentDidMount() {
        // eventBus.on(eventBus.labels.headUpdate, () => this.mounted && this.setState({}) );
        eventBus.on( eventBus.labels.headUpdate, () => {
            this.setState( {} );
        } );
    }
    componentDidUpdate() {
    }
    componentWillUnmount() {
        this.setState = () => {};
    }
}

Head.defaultProps = {
    propA: "STRING"
};

export default withWidth()(Head);