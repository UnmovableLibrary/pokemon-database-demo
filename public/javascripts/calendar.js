(function() {
	var MONTH = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
	var WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var current_year = 2016;
	var current_month = 6;
	var width = 200;
	var app = document.querySelector('#calendar');
	var app_header = document.querySelector('#calendar_header');
	var app_weekdays = document.querySelector('#calendar_weekdays');
	var app_content = document.querySelector('#calendar_content');

	/* 获得当前年份和月份 */
	function getCurrentYearAndMonth() {
		var date = new Date();
		current_year = date.getFullYear();
		current_month = date.getMonth() + 1;
	}

	/* 获得某月天数 */
	function getDays(year, month) {
		return (new Date(year, month, 0)).getDate();
	}

	/* 获得星期数 */
	function getWeekday(year, month, date) {
		return (new Date(year, month - 1, date)).getDay();
	}

	/* 获得完整日期 年 /月 /日 */
	function getFullDate(e) {
		return e.getFullYear() + "/" + (e.getMonth() + 1) + "/" + e.getDate();
	}

	/* 判断与当前时间是否相等 */
	function compare(e) {
		return getFullDate(new Date) == getFullDate(e);
	}

	/* 生成当前月的日期表 */
	function genAMonth() {
		var month = [];
		for (var i = 1; i < getDays(current_year, current_month) + 1; i++) {
			month.push({
				day: i,
				weekday: WEEKDAY[getWeekday(current_year, current_month, i)]
			});
		}
		return month;
	}

	/* 生成星期栏 */
	function genWeekday() {
		app_weekdays.innerHTML = "";
		for (var i = 0; i < 7; i++) {
			var child = document.createElement('div');
			child.innerHTML = WEEKDAY[i].substring(0, 3);
			app_weekdays.appendChild(child);
		}
	}

	function styleIt() {
		app.style.cssText = "width: " + width + "px";
		app_weekdays.style.cssText = "width: " + width + "px";
		app_content.style.cssText = "width: " + width + "px";
		app_header.style.cssText = "height: " + width / 8 + "px; line-height: " + width / 8 + "px;";

		var divs = document.querySelectorAll("#calendar > div > div");
		for (var i = 0, len = divs.length; i < len; i++) {
			divs[i].style.cssText = "width: " + width / 7 + "px; height: " + width / 7 + "px; line-height: " + width / 7 + "px;";
		}

		var icons = document.querySelectorAll("i[class^='icon-chevron']");
		for (i = 0; i < 2; i++) {
			icons[i].style.cssText = "line-height: " + width / 8 + "px;";
		}
	}

	function calculate() {
		genWeekday();
		var month = genAMonth();
		var day = 0;
		var flag = false;
		app_content.innerHTML = "";
		while (!flag) {
			if (WEEKDAY[day] == month[0].weekday) {
				flag = true;
			} else {
				var blank = document.createElement('div');
				blank.className = "blank";
				app_content.appendChild(blank);
				day++;
			}
		}

		for (var i = 0; i < 42 - day; i++) {
			if (i >= month.length) {
				var blank = document.createElement('div');
				blank.className = "blank";
				app_content.appendChild(blank);
			} else {
				var date = month[i].day;
				/*var dates = app.locals.activeDates;
				dates.forEach(function(dat) {
					var d = (getFullDate(dat) == getFullDate(new Date(current_year, current_month - 1, date))) ? 'today' : '';


					var el = document.createElement('div');
					if (d) el.className = d;
					el.innerHTML = date;
					app_content.appendChild(el);
				})*/
				var d = compare(new Date(current_year, current_month - 1, date)) ? 'today' : '';

				var el = document.createElement('div');
				if (d) el.className = d;
				el.innerHTML = date;
				app_content.appendChild(el);

			}
		}

		app_header.querySelector('h1').innerText = MONTH[current_month - 1] + " " + current_year;
		styleIt();
	}

	app_header.addEventListener("click", function(e) {
		var target;
		if (e.target.nodeName.toLowerCase() == "i") {
			target = e.target;
		} else {
			return;
		}

		var exec = function(e) {
			current_month = e === "next" ? current_month + 1 : current_month - 1;
			if (current_month < 1) {
				current_month = 12;
				current_year--;
			} else if (current_month > 12) {
				current_month = 1;
				current_year++;
			}
			calculate();
		};

		if (target.className.indexOf("left") != -1) {
			exec("previous");
		} else {
			exec("next");
		}
	})

	getCurrentYearAndMonth();
	calculate();
})();
