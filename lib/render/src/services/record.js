
const rcrd = window._hdata;

export default ( function() {
    return {
        getPlanName: () => {
            return rcrd.plan;
        },
        getPlanTitle: () => {
            return rcrd.title;
        },
        getFormatedJson: () => {
            return JSON.stringify(rcrd, null, 2);
        },
        getSummary: () => {
            return rcrd.summary;
        },
        getStageStories: () => {
            const stages = [];
            for ( let i = 0; i < rcrd.stages.length; i++ ) {
                const obj = { stage: rcrd.stages[i].stage, stories: [] };
                for ( let j = 0; j < rcrd.stages[i].stories.length; j++ ) {
                    const st = {
                        story: rcrd.stages[i].stories[j].story,
                        loopStatus: rcrd.stages[i].stories[j].summary.loopStatus,
                        status: true,
                        stageIdx: i,
                        storyIdx: j
                    };
                    for ( const sts of st.loopStatus ) {
                        st['status'] = st['status'] && sts;
                    }
                    obj.stories.push(st);
                }
                stages.push(obj);
            }
            return stages;
        },
        getStory: ( stageIdx, storyIdx ) => {
            return rcrd.stages[stageIdx].stories[storyIdx];
        }
    };
}() );
