
////////////////////////////////////////////////////////////
//////////////////// FINDER FUNCTIONS //////////////////////
////////////////////////////////////////////////////////////
// Copy and pasted from an online demo sorry

function startsWith(haystack, needle) {
    return haystack.slice(0, needle.length) == needle;
}

$(function() {
var demo11 = $('#demo11').finderSelect({children:"tr.expanded"});
        var activeSegments = [""];
        function expandActive(els) {
            els.each(function() {
                var el = $(this);
                var segments = el.attr('data-path').split("/");
                segments.pop();
                var padding = (segments.length - 1) * 20;
                if($.inArray(segments.join("/"), activeSegments)  > -1) {
                    el.find('td').first().css('padding-left',padding);
                    el.removeClass('hidden')
                    el.addClass('expanded');
                } else {
                    el.addClass('hidden');
                    el.removeClass('expanded');
                }
            });

        }

        expandActive($('#demo11').find('tr'));

        $( "#demo11").find("tr.folder").click(function() {
            if($.inArray($(this).attr('data-path'), activeSegments)  > -1) {
                for(var i = activeSegments.length - 1; i >= 0; i--) {
                    if(startsWith(activeSegments[i], $(this).attr('data-path'))) {
                        activeSegments.splice(i, 1);
                    }
                }
                $(this).find('.icon-folder-open').removeClass('icon-folder-open').addClass('icon-folder-close');
                $(this).find('.icon-angle-down').removeClass('icon-angle-down').addClass('icon-angle-right');
            } else {
                activeSegments.push($(this).attr('data-path'));
                $(this).find('.icon-folder-close').removeClass('icon-folder-close').addClass('icon-folder-open');
                $(this).find('.icon-angle-right').removeClass('icon-angle-right').addClass('icon-angle-down');
            }

            expandActive($('#demo11').find('tr'));
        });
});


////////////////////////////////////////////////////////////
/////////////////// TIMELINE FUNCTIONS /////////////////////
////////////////////////////////////////////////////////////

// Load Google timeline API stuff
google.charts.load("current", {packages:["timeline"]});
google.charts.setOnLoadCallback(drawChart);

// Draw the timeline
function drawChart() {
    // Define the timeline params
    var container = document.getElementById('timeline');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Position' });
    dataTable.addColumn({ type: 'string', id: 'Name' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });

    // For each line in the planner, break it down to the relevant parts
    // and add it in the correct format to the datatable for the timeline
    function plannerLineToDict(plannerLine) {
        var start = parseFloat(plannerLine.split(":")[0]);
        var action = plannerLine.split("(")[1].split(" ")[0];
        var agent = plannerLine.split("(")[1].split(" ")[1];
        var duration = parseFloat(plannerLine.split("[")[1].split("]")[0]);
        var end = start + duration;
        console.log("start " + start + ", action " + action + ", agent " + agent + ", dur " + duration + ", end " + end);
        dataTable.addRows([ 
            [ agent, action, new Date(2015, 3, 30, 0, start), new Date(2015, 3, 30, 0, end)],
        ]);
    }
    
    // Get the planner output to display, break it down, and send it to
    // be added to the datatable
    var plannerOutput = $("#plannerOutput").val().split("\n");
    console.log(plannerOutput);
    for (var i=0;i<plannerOutput.length-1;i++){
        plannerLineToDict(plannerOutput[i]);
    }
  
    // Draw the timeline!
    chart.draw(dataTable);
}
