///// Functions for the front-end side of the site /////

///// VARIABLES /////
var formValid = false;

///// ON START FUNCTIONS /////
updateParamsOnDropdown(); // To make sure the default selected task has shown parameters
$("#task-choice").change(updateParamsOnDropdown ); // Change the shown params when dropdown task changes
$(function() {
    $(".sortable").sortable();
});


// Edit Tasks: toggle out the sidebar, fill in the blanks, and show the relevant param spaces
function editTask(element, tasks2) {    //<!-- should  probably do this with database? just iterate over tasks? -->
    $(".editTask_robo_param").hide(); 
    // menu toggle with id
    $("#wrapper").addClass("toggled");
    $("#editTask_id").val(element.id);

    var thisTask; 
    tasks2.forEach( function( task ){
        if (task._id == element.id) {
            thisTask = task;
        }
    });

    $.getJSON("json_data/message_lookup.json", function(data) { 
        console.log(thisTask["descript"]);
        $("#editTask_form_descript").val(thisTask["descript"]);
        for (key in data[thisTask["descript"]]["parameters"]){
            $("#editTask_form_"+key).val(thisTask[key]);
            $("#editTask_"+key).show();
        }
    });
}

// Task Inventory: look at all the tasks, find their order, and display
function taskInventory() {    //<!-- should  probably do this with database? just iterate over tasks? -->
    var divs = document.getElementsByClassName("task");
    var div2 = document.getElementById("taskInventoryList");
    var divsList = []
    div2.innerHTML = "List starts here"
    for(var i = 0; i < divs.length; i++){
        divsList.push([divs[i].id, divs[i].getBoundingClientRect().left]);
        // div2.innerHTML += "<br>" + divs[i].id + ", " + divs[i].getBoundingClientRect().left;
    }  
    divsList.sort(function(a,b) {return a[1] > b[1]; });
    console.log(divsList);
    for(var i = 0; i < divsList.length; i++){
        div2.innerHTML += "<br>" +divsList[i];
    }
    return divsList;
}

// Called when page loaded or dropdown changed; 
function updateParamsOnDropdown() {
    console.log($(this).context);
    var key = "";
    // if the dropdown hasn't been changed yet, show the params for transport_empty
    if ($(this).context == undefined) {
        console.log("whooo");
        var key = "transport_empty";
    }
    else {
        key = $(this).val();
    }
    // var $dropdown = $(this);
    // console.log($dropdown.val());
    // $.getJSON("json_data/dropdown_choices.json", function(data) { 
    $.getJSON("json_data/message_lookup.json", function(data) { 

        // var key = $dropdown.val();
        var vals = [];
        for (param in data[key]["parameters"]){
            vals.push(param);
        }
        $(".robo_param").hide();
        $.each(vals, function(index, value) {

            $("#"+value).show();
        });

    });
}

// Save Workspace: save and preserve the order of the tasks currenlty on the timeline
function saveWorkspace() {
    divslist = taskInventory();
    divsdict = {};
    for (var i=0; i<divslist.length; i++) {
        divsdict[divslist[i][0]] = i
    }
    console.log(divsdict);
    $.post("/saveworkspace", divsdict, function(){ //data, status){
        // console.log("Data: " + data + "\nStatus: " + status);
        console.log("hi");
    });
}

///// FORM VERIFICATION /////

// When submitting new task form, first check if the values are valid
$('#myBigForm').submit(function (evt) {
    if (validateMyForm() == false) {
      evt.preventDefault();
    }
});

// Check if the form is valid. If it is, let it be submitted. If not, don't. 
function validateMyForm()
{
  if (formValid) { 
    return true;
  }
  alert("Please correct invalid form entries.");
  return false;
}

// If the input is invalid, make the box turn red and say that the form isn't valid
function updateInvalidInput(element){
    element.addClass("has-error");
    element.addClass("has-feedback");
    element.find('span').show();
    formValid = false;
    console.log("should fuck it up");
}

// If the input is valid, undo anything from the updateInvalidInput functoin
function updateValidInput(element){
    element.removeClass("has-error");
    element.removeClass("has-feedback");
    element.find('span').hide();
    formValid = true;
    console.log("should un-fuck it up");
}


// Form validation for param grasp_effort
$( "#grasp_effort" ).focusout(function() {
    if ($(this).find('input').val() < 0 || $(this).find('input').val() > 100) {
        updateInvalidInput($(this));
    }
    else {
        updateValidInput($(this));
    }
});



