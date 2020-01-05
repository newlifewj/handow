
export default ( function() {
    let _title = null;
    return {
        title: () => _title,
        set: (title) => {
            _title = title;
        }
    };
}() );
