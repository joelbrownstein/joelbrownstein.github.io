$("#row-errors").hide();
var $TABLE = $('#table-keywords-hdu-0');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');
    	
$('.table-add').click(function () {
var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
$TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
$(this).parents('tr').detach();
});

$('.table-up').click(function () {
var $row = $(this).parents('tr');
if ($row.index() === 1) return; // Don't go above the header
$row.prev().before($row.get(0));
});

$('.table-down').click(function () {
var $row = $(this).parents('tr');
$row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.click(function () {
var $rows = $TABLE.find('tr:not(:hidden)');
var headers = [];
var data = [];

// Get the headers (add special header logic here)
$($rows.shift()).find('th:not(:empty)').each(function () {
headers.push($(this).text().toLowerCase());
});

// Turn all existing rows into a loopable array
$rows.each(function () {
var $td = $(this).find('td');
var h = {};

// Use the headers from earlier to name our hash keys
headers.forEach(function (header, i) {
h[header] = $td.eq(i).text();
});

data.push(h);
});

// Output the result
$EXPORT.text(JSON.stringify(data));
});

function validate(data) {
    var html = "";
    for (var key in data['errors']) {
        html = html + '<li class="list-group-item">'+data['errors'][key]+' ('+key+')</li>';
        $("#"+key).removeClass('ink-field');
        $("#"+key).addClass('invalid-field');
    }
    $("#list-errors").html(html);
    $("#row-errors").show();
}
function submit() {
    $("#row-errors").hide();
    $("[id^=field-]").removeClass('invalid-field');
    $("[id^=field-]").addClass('ink-field');
    for (var id in field) {
        var current_field = $("#"+id).html();
        if (field[id] != current_field) {
            console.log(JSON.stringify(current_field));
            var from_id = "edit-from-"+id;
            var to_id = "edit-to-"+id;
            var to_field = $("#"+to_id);
            var has_inner_quotation = current_field.indexOf('\"');
            if (has_inner_quotation) { current_field = current_field.replace(/\"/g, "%22"); }
            var to_input = '<input type="hidden" id="'+to_id+'" name="'+to_id+'" value="'+current_field+'" />';
            if ( $("#"+to_id).length ) {
                $("#"+to_id).replaceWith(to_input);
            } else {
                var from_input = '<input type="hidden" id="'+from_id+'" name="'+from_id+'" value="'+field[id]+'" />';
                $("#form-edit").append(from_input);
                $("#form-edit").append(to_input);
            }
        }
    }
    
    var action = $( "#form-edit" ).attr( 'action' );
    if ( action != null ) {

        var input = $("#form-edit").serialize();
        var jqXHR = $.post(action, input);

        jqXHR.done(function( data, textStatus, jqXHR ) {
            console.log(JSON.stringify(data));
            if (data['clear']==true) {
                location.reload();
            } else if (data['forward']!=null) {
                location.replace(data['forward']);
            } else if (data['errors'] != null) {
                window.scrollTo(0, 0);
                validate(data);
            }
        });

        jqXHR.fail(function( jqXHR, textStatus, errorThrown ) {
            response = jqXHR['responseText'];
            console.error(response);
        });
    }
}

    $("[id^=save-]").click(function(e){
        var save = $(this).attr("id").split('-')[1];
        if (save == 'submit') { submit(); }
        else { alert('debug' + $(this).attr("id")); }
    });


   var field = {};
   $('[contenteditable="true"]').each(function(){
        var id = $(this).attr("id");
        $(this).bind('focus', function() {
            if( !(id in field) ) { field[id] = $(this).html(); }
        });
    });

    $('[contenteditable="true"]').on('paste', function(e) {
        e.preventDefault();
        var text = '';
        if (e.clipboardData || e.originalEvent.clipboardData) {
          text = (e.originalEvent || e).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
          text = window.clipboardData.getData('Text');
        }
        if (document.queryCommandSupported('insertText')) {
          document.execCommand('insertText', false, text);
        } else {
          document.execCommand('paste', false, text);
        }
    });



