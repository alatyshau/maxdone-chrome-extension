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
		if (!chevronElem.classList.contains("taskChevron")) {
			var day = "??";
			var taskElem = root.firstElementChild;
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
				day = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"][date.getDay()];
			}

			var chevronElem = document.createElement('div');
			chevronElem.className = "taskChevron";
			root.insertBefore(chevronElem, taskElem);

			var taskHighlighter = document.createElement('div');
			// console.log(taskElem.getAttribute("taskid") + " - " +
			// taskElem.className + " - " + taskElem.title);
			if (highlightedTasks[taskElem.getAttribute("taskid")] == "YES") {
				root.classList.add('highlightedRow');
			}
			taskHighlighter.className = "taskHighlighter";
			taskHighlighter.addEventListener("mouseenter", function(e) {
				e.target.className = 'taskHighlighter-on';
			});
			taskHighlighter.addEventListener("mouseleave", function(e) {
				e.target.className = 'taskHighlighter';
			});
			taskHighlighter.addEventListener("click", function(e) {
				var myElem = e.target;
				var taskid = myElem.nextElementSibling.getAttribute("taskid");
				if (highlightedTasks[taskid] == "YES") {
					highlightedTasks[taskid] = "NO";
				} else {
					highlightedTasks[taskid] = "YES";
				}
				myElem.parentElement.classList.toggle('highlightedRow');
			});
			taskHighlighter.innerText = day;
			root.insertBefore(taskHighlighter, taskElem);
		}

		// reflect right color in chevron div
		var bottomElems = root.lastElementChild.children;
		var projectLabel = null;
		for (var k = 0; k < bottomElems.length; k++) {
			var bottomElem = bottomElems[k];
			if (bottomElem.classList.contains("project-label")) {
				projectLabel = bottomElem.innerText;
				bottomElem.classList.add("project-" + projectLabel);
				break;
			}
		}
		chevronElem.className = "taskChevron chevron-" + projectLabel;
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