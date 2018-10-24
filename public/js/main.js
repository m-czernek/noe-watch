$(document).click(function(event) {
    const _class = $(event.target).attr('class');
    if(_class !== undefined && _class.includes('stacktrace')) {
        $(event.target).parent().parent().next('tr').toggle();
    }
});