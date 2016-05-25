var siteName = window.location.hostname;
if (siteName.startsWith("www.")) {
	siteName = siteName.substring(4);
}

function rebuildChevrons(highlightedTasks) {
	var taskRowInfoBlocks = document.getElementsByClassName("taskRowInfoBlock");

	for (var i = 0; i < taskRowInfoBlocks.length; i++) {
		var root = taskRowInfoBlocks[i];

		// construct chevron div
		var chevronElem = root.firstElementChild;
		var taskElem;
		if (!chevronElem.classList.contains("taskChevron")) {
			var day = "";
			taskElem = root.firstElementChild;
			var dateElem = taskElem.nextElementSibling.firstElementChild;
			if (dateElem && dateElem.classList.contains("date")) {
				var dateVal = dateElem.innerText;
				var today = new Date();
				today.setHours(0);
				today.setMinutes(0);
				today.setSeconds(0);
				today.setMilliseconds(0);
				var date;
				if (dateVal == "сегодня" || dateVal == "вчера") {
					date = today;
				} else if (dateVal == "завтра") {
					date = today;
					date.setDate(date.getDate() + 1);
				} else {
					var dateSegments = dateVal.split("/");
					date = new Date();
					date.setFullYear(dateSegments[2]);
					date.setMonth(dateSegments[1] - 1);
					date.setDate(dateSegments[0]);
					date.setHours(0);
					date.setMinutes(0);
					date.setSeconds(0);
					date.setMilliseconds(0);
					if (date < today) {
						date = today;
					}
				}
				day = [ "ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС" ][date
						.getDay()];
			}

			chevronElem = document.createElement('div');
			chevronElem.className = "taskChevron";
			chevronElem.rootClassName = root.className;
			root.insertBefore(chevronElem, taskElem);

			var taskHighlighter = document.createElement('div');
			taskHighlighter.className = "taskHighlighter";
			taskHighlighter.addEventListener("mouseenter", function(e) {
				e.target.className = 'taskHighlighter-on';
			});
			taskHighlighter.addEventListener("mouseleave", function(e) {
				e.target.className = 'taskHighlighter';
			});
			taskHighlighter.addEventListener("click", function(e) {
				var myElem = e.target;
				var taskid = myElem.nextElementSibling.nextElementSibling.getAttribute("taskid");
				if (highlightedTasks[taskid] == "YELLOW") {
					highlightedTasks[taskid] = "NO";
//					highlightedTasks[taskid] = "GREEN";
					myElem.parentElement.classList.toggle('highlightedRow');
//					myElem.parentElement.classList.toggle('highlightedRow2');
//				} else if (highlightedTasks[taskid] == "GREEN") {
//					highlightedTasks[taskid] = "NO";
//					myElem.parentElement.classList.toggle('highlightedRow2');
				} else {
					highlightedTasks[taskid] = "YELLOW";
					myElem.parentElement.classList.toggle('highlightedRow');
				}
			});
			taskHighlighter.innerText = "☻";
			root.insertBefore(taskHighlighter, taskElem);
			
			var dayInfoElem = document.createElement('div');
			dayInfoElem.className = "dayInfoElem";
			dayInfoElem.addEventListener("mouseenter", function(e) {
				e.target.className = 'dayInfoElem-on';
			});
			dayInfoElem.addEventListener("mouseleave", function(e) {
				e.target.className = 'dayInfoElem';
			});
			dayInfoElem.addEventListener("click", function(e) {
				var myElem = e.target;
				var taskid = myElem.nextElementSibling.getAttribute("taskid");
				if (highlightedTasks[taskid] == "YELLOW") {
					highlightedTasks[taskid] = "NO";
//					highlightedTasks[taskid] = "GREEN";
					myElem.parentElement.classList.toggle('highlightedRow');
//					myElem.parentElement.classList.toggle('highlightedRow2');
//				} else if (highlightedTasks[taskid] == "GREEN") {
//					highlightedTasks[taskid] = "NO";
//					myElem.parentElement.classList.toggle('highlightedRow2');
				} else {
					highlightedTasks[taskid] = "YELLOW";
					myElem.parentElement.classList.toggle('highlightedRow');
				}
			});
			dayInfoElem.innerText = day;
			root.insertBefore(dayInfoElem, taskElem);
		} else {
			taskElem = root.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling;
		}

		// reflect right color in chevron div
		var bottomElems = root.lastElementChild.children;
		var category = null;
		for (var k = 0; k < bottomElems.length; k++) {
			var bottomElem = bottomElems[k];
			if (bottomElem.classList.contains("project-label")) {
				category = bottomElem.innerText.replace(/[ ,.#{}]/g, "-");
				// bottomElem.classList.add("project-" + projectLabel);
				break;
			}
		}
		root.className = chevronElem.rootClassName + " taskBlock-" + category + " ";
		if (highlightedTasks[taskElem.getAttribute("taskid")] == "YELLOW") {
			root.classList.add('highlightedRow');
		} else if (highlightedTasks[taskElem.getAttribute("taskid")] == "GREEN") {
			root.classList.add('highlightedRow2');
		}

		// transform * into <b>
		var taskTitle = taskElem.title;

		var justWrapped = false;
		var tokens = taskTitle.split("*");
		if (tokens.length > 1) {
			for (var k = 0; k < tokens.length; k++) {
				if (!justWrapped && tokens[k].length > 0
						&& tokens[k].trim() == tokens[k]) {
					tokens[k] = "<span class=\"emphasizedTextInTitle\">" + tokens[k] + "</span>";
					justWrapped = true;
				} else {
					justWrapped = false;
				}
				taskElem.innerHTML = tokens.join("*");
			}
		} else {
			taskElem.innerHTML = taskTitle;
		}
	}
}

if (siteName == "maxdone.micromiles.co") {
	var mainContainer = document.getElementById("mainContainer");
	if (!mainContainer.observingChanges) {
		mainContainer.observingChanges = true;

		var highlightedTasks = [];
		rebuildChevrons(highlightedTasks);

		var scheduled = false;
		var observer = new MutationObserver(function(mutations) {
			if (!scheduled) {
				scheduled = true;
				setTimeout(function() {
					scheduled = false;

					rebuildChevrons(highlightedTasks);
				}, 1000);
			}
		});
		observer.observe(mainContainer, {
			childList : true,
			subtree : true
		});
	}
}

/*
 * http://stackoverflow.com/questions/25335648/how-to-intercept-all-ajax-requests-made-by-different-js-libraries
 * (function(open) { console.log("Within!"); XMLHttpRequest.prototype.open =
 * function(method, url, async, user, pass) { console.log("Before calling.." +
 * method + " " + url); this.addEventListener("readystatechange", function() {
 * console.log(this.readyState); // this one I changed }, false);
 * 
 * open.call(this, method, url, async, user, pass); }; console.log("Done!");
 * })(XMLHttpRequest.prototype.open);
 */

/*
 * function doCall123456() { var x = new XMLHttpRequest(); x.open("POST",
 * "https://maxdone.micromiles.co/services/v1/tasks");
 * x.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); var
 * data = JSON.stringify({ "project" : false, "allDay" : true, "path" : "",
 * "childrenIds" : [], "title" : "QWERTY !!!", "userId" : "", "goalId" : null,
 * "goalTenantId" : null, "goalMilestoneId" : "", "delegatedTargetUserId" : "",
 * "delegatedTargetTaskId" : "", "delegatedSourceTaskId" : "", "contextId" : "",
 * "dueDate" : "", "startDatetime" : "", "notes" : "", "recurRule" : null,
 * "recurChildId" : "", "recurParentId" : "", "done" : false, "taskType" :
 * "TODAY", "calculatedTaskType" : "INBOX", "completionDate" : "", "timeZone" :
 * "America/New_York", "checklistItems" : [], "priority" : "56", "hideUntilDate" :
 * null, "state" : "ACTIVE" }); x.send(data);
 * 
 * window.alert(x);
 * 
 * if (x.status == 200) { window.alert(x.status + "\n" + x.responseText); } else {
 * window.alert(x.status + "\n" + x.statusText); } }
 * 
 * doCall123456();
 */