var hide = true;

$(document).click(function(event) {
    const _class = $(event.target).attr('class');
    if(_class !== undefined && _class.includes('stacktrace')) {
        $(event.target).parent().parent().next('tr').toggle();
    }
    
    if(_class !== undefined && _class.includes('js_triggerable')) {
        const _trParrent = $(event.target).parent().parent();
        if(hide) {
            $(_trParrent).nextUntil('.warning').css('display', 'none');
            hide = !hide;
        } else {
            $(_trParrent).nextUntil('.warning').css('display', 'table-row')
            hide = !hide;
        }
    }

});