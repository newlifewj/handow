/**
 * Copy the template and refactor it to any component class
 */

import { React, Router, Route, Switch, Prompt, Redirect, Link, NavLink, setting, cx, joinURL, eventBus }
        from '../../../Depends.js';
import { FormattedMessage as FmtMsg, FormattedHTMLMessage as FmtHtml } from 'react-intl';
import PropType from 'prop-types';

import record from '../../../services/record';

import style from './Stages.scss';

export default class Stages extends React.Component {
    constructor(props) {
        super(props);
        this.state = { stages: [] };
        this.setStages = (stages) => {
            this.setState( { stages: stages } );
        };
    }
    render() {
        return (
            <div className={cx(style.list)} xs={12}>
                <div className={cx(style.title)} h4w='summary-stages-title'>
                    Test plan was running in <b h4w='summary-stages-count'>{this.state.stages.length}</b> stages
                </div>
                { this.state.stages.map( (stage, idx) => (
                    <div key={idx} className={cx(style.stageItem)}>
                        <div name='title' h4w='summary-stage-title'>{stage.stage}</div>
                        { stage.stories.map( (story, _idx) => (
                            <div key={_idx} className={cx(style.story)} onClick={(e) => this.props.toStory(story)}>
                                <div name="loop-indicator" h4w='summary-story-status-status'>
                                    { story.loopStatus.map( (status, __idx) => (
                                        <div key={__idx} style={{ backgroundColor: status ? "green" : "red" }}></div>
                                    ) )}
                                </div>
                                <div h4w='summary-story-name' style={{ color: story.status ? 'green' : 'red', minWidth: '100px' }}>
                                    { story.story }
                                </div>
                            </div>
                        ) )}
                    </div>
                ) ) }
            </div>
        );
    }
    componentDidMount() {
        const stageStories = record.getStageStories();

        this.setStages( stageStories );
    }
    componentDidUpdate() { }
    componentWillUnmount() { this.setState = () => {}; }
}

Stages.defaultProps = {
    propA: "STRING"
};
