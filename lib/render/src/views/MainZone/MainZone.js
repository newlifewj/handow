/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import { withRouter } from 'react-router-dom';

import PropType from 'prop-types';
import style from './MainZone.scss';

import Paper from '@material-ui/core/Paper';
import Pie from '../Summary/SummaryChart/SummaryChart';
import Stages from '../Summary/Stages/Stages';
import Detail from '../Detail/Detail';

import record from '../../services/record';
import storyTitle from '../Head/headStoryTitle';
import { withWidth } from '@material-ui/core';

class MainZone extends React.Component {
    constructor(props) {
        super(props);
        this.state = { story: null, _$_: false };

        this.toStory = (story) => {
            storyTitle.set(story.story);
            this.setState({ story: story });
            eventBus.emit( eventBus.labels.headUpdate );
        };
    }
    render() {
        return (
            <Paper elevation={1} className={cx(style.zone)}
                style={{ padding: this.props.width == 'xs' ? '3px 3px' : this.props.width == 'sm' ? '15px 5%' : '15px 8%' }}>
                { storyTitle.title() === null &&
                    <div h4w='summary-page-ctner'>
                        <div className={cx(style.title)}>
                            Summary
                        </div>
                        <Pie />
                        <Stages toStory={this.toStory} />
                    </div>
                }
                { storyTitle.title() !== null &&
                        <div h4w='detail-page-ctner'>
                            <Detail story={record.getStory(this.state.story.stageIdx, this.state.story.storyIdx)} />
                        </div>
                }
                { this.state.activePage === "json" &&
                        <pre>{record.getFormatedJson()}</pre>
                }
            </Paper>
        );
    }
    componentDidMount() {
        eventBus.on( eventBus.labels.viewUpdate, () => {
            this.setState( { _$_: !this.state._$_ } );
        } );
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
        this.setState = () => {};
    }
}

MainZone.defaultProps = {
    propA: "STRING"
};

export default withWidth()(MainZone);

