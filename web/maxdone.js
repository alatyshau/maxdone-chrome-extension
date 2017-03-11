
var siteName = window.location.hostname;
if (siteName.startsWith("www.")) {
    siteName = siteName.substring(4);
}

function startTimer(taskid, myElem) {
    var startedAt = {};
    startedAt[taskid] = Date.now();
    chrome.storage.local.set(startedAt);
    myElem.parentElement.classList.toggle('highlightedRow');

}

function stopTimer(taskid, myElem) {
    chrome.storage.local.get(taskid, function(result) {
        const timeElapsed = Date.now() - result[taskid];
        var oldTitle = myElem.nextElementSibling.getAttribute("title");
        const newTitle = addTimeToTitle(oldTitle, timeElapsed)
        myElem.nextElementSibling.setAttribute("title", newTitle);
        myElem.parentElement.classList.toggle('highlightedRow');
        // save changes
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', `//maxdone.micromiles.co/services/v1/tasks/${taskid}/title`);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status !== 200) {
                console.log('Title change failed: ' + xhr.status);
            }
        };
        console.log(newTitle);
        xhr.send(newTitle);
    });
}

function extractTime(taskTitle) {
    var taskDurationRegexp = /\[(\d+(?:\.\d+)?)(m|м|h|ч)?\]$/;
    var matchResult = taskDurationRegexp.exec(taskTitle);
    var minutes = 0;
    if (matchResult) {
        var numPart = matchResult[1];
        if (numPart == "05") {
            numPart = "0.5";
        }
        minutes = parseFloat(numPart);
        var unit = matchResult[2];
        if (typeof unit == "undefined" || "hч".indexOf(unit) != -1) {
            minutes *= 60;
        }
    }
    return minutes;
}

// add time spent on task to end of task title
function addTimeToTitle(title, timeInMs) {
    if (title.endsWith("]")) {
        // add time to existing time
        const newTimeSpent = extractTime(title) + Math.round(timeInMs / 60000);
        title = `${title.slice(0, title.lastIndexOf('[')-1)} [${prettyMinutes(newTimeSpent)}]`;
    } else {
        // just add time in minutes to task title
        title += ` [${prettyMinutes(Math.round(timeInMs/60000))}]`;
    }
    return title;
}

// convert minutes to human friendly form of XXч YYм
function prettyMinutes(mins, hours = false) {
    var minutesHTML = '';
    const minutes = Math.round(mins);
    var mm = hours ? minutes % 60 : minutes;
    if (hours) {
        var hh = (minutes - mm) / 60;
        if (hh > 0) {
            minutesHTML += hh + "ч";
        }
    }
    if (mm > 0) {
        if (hh > 0) {
            minutesHTML += " ";
        }
        minutesHTML += mm + "м";
    }
    return minutesHTML;
}

function rebuildChevrons(highlightedTasks, options) {
    var taskRowInfoBlocks = document.getElementsByClassName("taskRowInfoBlock");

    var todayMinutes = 0;
    var weekMinutes = 0;
    var laterMinutes = 0;
    var completedPlannedMinutes = 0;
    var completedActualMinutes = 0;

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
                if (dateVal) {
                    // Trim time part
                    dateVal = dateVal.replace(/ @ .*/, '')
                }
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                today.setMilliseconds(0);
                var date;
                if (dateVal == "сегодня") {
                    date = today;
                } else if (dateVal == "вчера") {
                    if (options.overdueToday) {
                        date = today;
                    } else {
                        date = today;
                        date.setDate(date.getDate() - 1);
                    }
                } else if (dateVal == "завтра") {
                    date = today;
                    date.setDate(date.getDate() + 1);
                } else {
                    var dateSegments = dateVal.split("/");
                    date = new Date();
                    date.setFullYear(dateSegments[2]);
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    date.setMonth(dateSegments[1] - 1, dateSegments[0]);
                    if (options.overdueToday && date < today) {
                        date = today;
                    }
                }
                day = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"][date
                    .getDay()
                ];
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
                var taskid = myElem.nextElementSibling.nextElementSibling
                    .getAttribute("taskid");
                if (highlightedTasks[taskid] == "YELLOW") {
                    highlightedTasks[taskid] = "NO";
                    if (options.activeTaskTimer) stopTimer(taskid, myElem.nextElementSibling);
                } else {
                    highlightedTasks[taskid] = "YELLOW";
                    if (options.activeTaskTimer) startTimer(taskid, myElem);
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
                    if (options.activeTaskTimer) stopTimer(taskid, myElem);
                } else {
                    highlightedTasks[taskid] = "YELLOW";
                    if (options.activeTaskTimer) startTimer(taskid, myElem);
                }
            });
            if (day) dayInfoElem.innerText = day;
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
                category = bottomElem.innerText.replace(/[ ,.#{}!?:\/]/g, "-");
                // bottomElem.classList.add("project-" + projectLabel);
                break;
            }
        }
        root.className = chevronElem.rootClassName + " taskBlock-" + category +
            " ";
        if (highlightedTasks[taskElem.getAttribute("taskid")] == "YELLOW") {
            root.classList.add('highlightedRow');
        } else if (highlightedTasks[taskElem.getAttribute("taskid")] == "GREEN") {
            root.classList.add('highlightedRow2');
        }

        // transform into <b>
        var taskTitle = taskElem.title;

        var justWrapped = false;
        var tokens = taskTitle.split("*");
        if (tokens.length > 1) {
            for (var k = 0; k < tokens.length; k++) {
                if (!justWrapped && tokens[k].length > 0 &&
                    tokens[k].trim() == tokens[k]) {
                    tokens[k] = "<span class=\"emphasizedTextInTitle\">" +
                        tokens[k] + "</span>";
                    justWrapped = true;
                } else {
                    justWrapped = false;
                }
                taskElem.innerHTML = tokens.join("*");
            }
        } else {
            taskElem.innerHTML = taskTitle;
        }

        // count week hours
        var section = root.parentElement.parentElement.parentElement;
        if (taskTitle.startsWith("(")) {
            var taskDurationRegexp = /^\((\d+(?:\.\d+)?)(m|м|h|ч)?\)/;
            var matchResult = taskDurationRegexp.exec(taskTitle);
            var minutes = 0;
            if (matchResult) {
                var numPart = matchResult[1];
                if (numPart == "05") {
                    numPart = "0.5";
                }
                minutes = parseFloat(numPart);
                var unit = matchResult[2];
                if (typeof unit == "undefined" || "hч".indexOf(unit) != -1) {
                    minutes *= 60;
                }
            }
            if (minutes > 0) {
                if (section.id == "todayContent") {
                    todayMinutes += minutes;
                } else if (section.id == "weekContent") {
                    weekMinutes += minutes;
                } else if (section.id == "laterContent") {
                    laterMinutes += minutes;
                } else if (section.id == "completedContent") {
                    completedPlannedMinutes += minutes;
                }
            }
            // count actual hours fro completed tasks
        }
        if (section.id == "completedContent" && taskTitle.endsWith("]")) {
            completedActualMinutes += extractTime(taskTitle);
        }
    }

    // console.log("RESULT: " + (todayMinutes / 60) + " -- "
    // + (weekMinutes / 60) + " -- " + (laterMinutes / 60));
    updateHours("todayHeader", todayMinutes > 0 ? `запланировано: ${prettyMinutes(todayMinutes, true)}` : '');
    updateHours("weekHeader", `запланировано: ${prettyMinutes(weekMinutes, true)}`);
    updateHours("laterHeader", `запланировано: ${prettyMinutes(laterMinutes, true)}`);
    var completedSubtotal = `запланированных: ${prettyMinutes(completedPlannedMinutes, true)} `;
    if (options.activeTaskTimer) completedSubtotal += ` -- фактически: ${prettyMinutes(completedActualMinutes, true)}`;
    updateHours("completedHeader", completedSubtotal);

}

function updateHours(headerId, title) {
    var headerEl = document.getElementById(headerId);
    if (headerEl != null) {
        var lastElem = headerEl.lastElementChild;
        var hoursElemId = headerId + "-HoursEl";
        var minutesHTML = `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -- ${title}`;
        var hoursEl = lastElem.lastElementChild;
        if (hoursEl.id == hoursElemId) {
            hoursEl.innerHTML = minutesHTML;
        } else {
            hoursEl = document.createElement("span");
            hoursEl.id = hoursElemId;
            hoursEl.innerHTML = minutesHTML;
            lastElem.appendChild(hoursEl);
        }
    }
}

if (siteName == "maxdone.micromiles.co") {
    var mainContainer = document.getElementById("mainContainer");
    if (!mainContainer.observingChanges) {
        mainContainer.observingChanges = true;

        // Use default value overdueToday = true.
        chrome.storage.sync.get({
            overdueToday: true,
            activeTaskTimer: false
        }, function(options) {
            setupObserver(options);
        });
    }
}

function setupObserver(options) {
    var highlightedTasks = [];
    rebuildChevrons(highlightedTasks, options);

    var scheduled = false;
    var observer = new MutationObserver(function(mutations) {
        if (!scheduled) {
            scheduled = true;
            setTimeout(function() {
                scheduled = false;
                observer.disconnect();
                rebuildChevrons(highlightedTasks, options);
                observer.observe(mainContainer, {
                    childList: true,
                    subtree: true
                });
            }, 100);
        }
    });
    observer.observe(mainContainer, {
        childList: true,
        subtree: true
    });
}

/*
 http://stackoverflow.com/questions/25335648/how-to-intercept-all-ajax-requests-made-by-different-js-libraries
 */

// (function(open) {
//     console.log("Within!");
//
//     XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
//         console.log("Before calling.." + method + " " + url);
//
//         this.addEventListener("readystatechange", function() {
//             console.log(this.readyState); // this one I changed
//         }, false);
//
//         open.call(this, method, url, async, user, pass);
//     };
//     console.log("Done!");
// })(XMLHttpRequest.prototype.open);
//
//
// function doCall123456() {
//     var x = new XMLHttpRequest();
//     x.open("POST",
//         "https://maxdone.micromiles.co/services/v1/tasks");
//     x.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//     var
//         data = JSON.stringify({
//             "project": false,
//             "allDay": true,
//             "path": "",
//             "childrenIds": [],
//             "title": "QWERTY !!!",
//             "userId": "",
//             "goalId": null,
//             "goalTenantId": null,
//             "goalMilestoneId": "",
//             "delegatedTargetUserId": "",
//             "delegatedTargetTaskId": "",
//             "delegatedSourceTaskId": "",
//             "contextId": "",
//             "dueDate": "",
//             "startDatetime": "",
//             "notes": "",
//             "recurRule": null,
//             "recurChildId": "",
//             "recurParentId": "",
//             "done": false,
//             "taskType": "TODAY",
//             "calculatedTaskType": "INBOX",
//             "completionDate": "",
//             "timeZone": "America/New_York",
//             "checklistItems": [],
//             "priority": "56",
//             "hideUntilDate": null,
//             "state": "ACTIVE"
//         });
//     x.send(data);
//
//     window.alert(x);
//
//     if (x.status == 200) {
//         window.alert(x.status + "\n" + x.responseText);
//     } else {
//         window.alert(x.status + "\n" + x.statusText);
//     }
// }
//
// //doCall123456();
