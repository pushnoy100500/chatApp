// Initialize global user 
// (a good idea to store the information you need
// when sending messages here)
var CURRENT_USER = null;
var CURRENT_MESSAGES = null;
var RECEIVED_MESSAGES = [];
// sendMessage() sends a message to the API
function sendMessage() {
	console.log(CURRENT_USER);
	console.log($('#messageToSend').val());
	var dataBlock = {
		userID: "9529dd05d6e54a02",
		message: $('#messageToSend').val()
	};
		console.log(dataBlock);
		event.preventDefault();
	$.ajax({
		url: "http://45.55.83.78/messages",
		type: "POST",
		data: dataBlock,
		xhrFields: { 
	  	withCredentials:true 
	    },
		success: function(data) {
			console.log('success');
			console.log(data);
			//$('#chat-window').append(msg(new Date(), "me", $('#messageToSend').val()));
			scrollBottom($('#chat-window'), 1000);
			$('#messageBox').val('');
		},
		error: function(data) {console.log("error",	data);}
	});
}

$('#sendForm').submit(function() {
	sendMessage();
	$('#messageToSend').val("");
});

// getMessages() gets all messages from the API.
// we can use diff() to get only the new ones.
function getMessages() {
	$.ajax({
		url: "http://45.55.83.78/messages",
		type: "GET",
		xhrFields: { 
	  	withCredentials:true 
	    },
		success:function(data){
			console.log(data);
			CURRENT_MESSAGES = data;
	  		for(var i = 0; i < data.length; i++) {
	  			$('#chat-window').append(msg(data[i].timestamp, data[i].username, data[i].message, data[i].userID));
	  		}
	  		scrollBottom($('#chat-window'), 1000);
	  },
	  error:function(data){
	  	console.log(data); 
	  		  }
	});
}

//generates an html of the message to put on the screen sets the username to 'me' for messages that have been sent from
// the current profile
function msg(timePoint, username, message, id) {
	var tempName = "";
	console.log(id);
	if(id == CURRENT_USER) {
		tempName = "Me";
	} else {
		tempName = username;
	}
return '<div class="msgText"><p class="from">' + getReadableTime(timePoint) + ' ' + tempName + ': </p><p>' + message + '</p></div>';
}
// login() logs in a user by creating a session
function login(uname, upass) {
	event.preventDefault();
	$.ajax({
	  url: "http://45.55.83.78/users/login",
	  type: "POST",
	  data: {
	  	username: uname,
	  	password: upass
	  },
	  xhrFields: { 
	  	withCredentials:true 
	  },
	  success:function(data){
	   	CURRENT_USER = data.uid;
	  	sessionStorage.setItem("username", $('#username').val());
	  	sessionStorage.setItem("password", $('#password').val());
        getMessages();
        return true;
	  },
	  error:function(data){
	  	console.log(data);
	  	return false;
	  }
	});

}
$('body').ready(function() {
	var uname = sessionStorage.getItem("username");
	var upass = sessionStorage.getItem("password");
	if (uname !== null || upass !== null) {
		login(uname, upass);
		$('#username').val(uname);
		$('#password').val(upass);
	} else {
		return false;
	}
});	
$('#loginForm').submit(function() {
		login($('#username').val(), $('#password').val());
		setInterval(function() {
		$.ajax({
			url: "http://45.55.83.78/messages",
			type: "GET",
			xhrFields: { 
		  	withCredentials:true 
		    },
			success:function(data){
			RECEIVED_MESSAGES = data;
		    },
		 	error:function(data){
		  	console.log(data); 
	  	    }
		});		
		if(RECEIVED_MESSAGES.length > CURRENT_MESSAGES.length) {
			console.log('got new message/s');
			for(var i = CURRENT_MESSAGES.length; i < RECEIVED_MESSAGES.length; i++) {
			$('#chat-window').append(msg(RECEIVED_MESSAGES[i].timestamp, RECEIVED_MESSAGES[i].username, RECEIVED_MESSAGES[i].message, RECEIVED_MESSAGES[i].userID));
			scrollBottom($('#chat-window'), 700);
			}
			CURRENT_MESSAGES = RECEIVED_MESSAGES.slice();
		}
	}, 1000);
});
// signup() creates an account that we can sign in with
function signup() {

}
function logOut() {
	event.preventDefault();	
	$.ajax({
		url: "http://45.55.83.78/users/logout",
		type: "POST",
		xhrFields: { 
		withCredentials: true 
		},
		success: function(data) {
		sessionStorage.setItem("username", "");
	  	sessionStorage.setItem("password", "");
	  	$('#username').val("");
	  	$('#password').val("");
	  	$('#chat-window').empty();
		console.log(data);
		},
		error: function(data) {
		console.log(data);
		} 		
	});
}
$('#signout').click(function() {
	logOut();
});	

// HELPERS -------
// You can use these and modify them to fit your needs. 
// If you are going to use them, make sure you understand
// how they work!

// Helper - returns all elements in an array A, that are not in B
function diff(a, b) {
	var bIds = {}
	b.forEach(function(obj){
	    bIds[obj.id] = obj;
	});
	return a.filter(function(obj){
	    return !(obj.id in bIds);
	});
}

// Helper - scrolls to the bottom of the messages div
function scrollBottom(element, duration) {
	element.animate({ scrollTop: element[0].scrollHeight}, duration);
}

// Helper - turns JavaScript timestamp into something useful
function getReadableTime(stamp) {
	var time = new Date()
	time.setTime(stamp)
	return time.getMonth()+"/"+time.getDate()+" "+pad(time.getHours(),2)+":"+pad(time.getMinutes(),2);
}

// Helper - pads a number with zeros to a certain size. Useful for time values like 10:30.
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s ;
    return s;
}

// Prints a useful error message to the console. Used when AJAX fails. A message can help us find the problem
function error(data, message) {
	console.log('Error '+message+': '+JSON.stringify(JSON.parse(data.responseText)))
}