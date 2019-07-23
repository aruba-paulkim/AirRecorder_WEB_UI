
function ar_execute(form) {
	form.submit();
}

function sel_command(form, value) {
	form.command.text="";
	form.command.text="";
}




function addDevice() {
	window.location = '/device/0';
}

function deleteDevice(seq) {
	if(confirm("삭제하시겠습니까?")) {
		window.location = '/device/'+seq+'/delete';
	}
}




function addCommand() {
	window.location = '/command/0';
}

function deleteCommand(seq) {
	if(confirm("삭제하시겠습니까?")) {
		window.location = '/command/'+seq+'/delete';
	}
}





function deleteHistory(seq) {
	if(confirm("삭제하시겠습니까?")) {
		window.location = '/history/'+seq+'/delete';
	}
}


