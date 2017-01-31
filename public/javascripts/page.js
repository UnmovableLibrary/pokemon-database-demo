(function() {
	var bt = document.querySelector('.slogan i');
	var mainContainer = document.querySelector('.main-container');
	var sideBar = document.querySelector('.side-bar');
	var closed = sideBar.classList.contains('hidden');
	var nav = document.querySelectorAll('.nav > li');
	var logoutBtn = document.querySelector('.logout a');
	var search = document.querySelector('#search');
	var itemList = document.querySelector('.item-list');
	var xhr = null;

	addEventHandler(bt, 'click', function(e) {
		e.stopPropagation();

		if (closed === true) {
			mainContainer.style.transform = 'translateX(-280px)';
			sideBar.classList.remove('hidden');
			sideBar.classList.add('shown');
			closed = false;
		} else {
			mainContainer.style.transform = 'translateX(0px)';
			sideBar.classList.remove('shown');
			sideBar.classList.add('hidden');
			closed = true;
		}
	});

	addEventHandler(sideBar, 'click', function() {
		if (closed === true) {
			mainContainer.style.transform = 'translateX(-280px)';
			sideBar.classList.remove('hidden');
			sideBar.classList.add('shown');
			closed = false;
		}
	});

	for (var i = 0, len = nav.length; i < len; i++) {
		addEventHandler(nav[i], 'mouseover', function handleMouseOver(e) {
			if (e.currentTarget.classList.contains('nav-li') && e.currentTarget.firstElementChild.firstElementChild.childElementCount === 2) {
				e.currentTarget.firstElementChild.firstElementChild.lastElementChild.style.height = '20px';
				e.currentTarget.firstElementChild.firstElementChild.lastElementChild.firstElementChild.style.height = '20px';
				e.currentTarget.style.height = '40px';
			}
		});
		addEventHandler(nav[i], 'mouseout', function handleMouseOut(e) {
			if (e.currentTarget.classList.contains('nav-li') && e.currentTarget.firstElementChild.firstElementChild.childElementCount === 2) {
				e.currentTarget.firstElementChild.firstElementChild.lastElementChild.style.height = '0';
				e.currentTarget.firstElementChild.firstElementChild.lastElementChild.firstElementChild.style.height = '0';
				e.currentTarget.style.height = '24px';
			}
		});
	}

	if (logoutBtn) {
		addEventHandler(logoutBtn, 'click', function (e) {
			if (e.stopPropagation) {
				e.stopPropagation();
			} else if (e.cancelBubble) {
				e.cancelBubble();
			}
		});
	}

	var category = sideBar.querySelector('.nav li:nth-child(3)');
	addEventHandler(category, 'click', function(e) {
		e.preventDefault();
		sideBar.querySelector('.nav').style.opacity = '0';
		sideBar.querySelector('.tags-list').style.cssText = 'transform: translateX(0px)';
	});

	var tags = sideBar.querySelectorAll('.tags-list span');
	for (var i = 0; i < tags.length; i++) {
		tags.item(i).style.fontSize = Math.floor(Math.random() * 10) + 10 + 'px';
		tags.item(i).style.color = getRandomColor();
	}
	var tagList = sideBar.querySelector('.tags-list');
	var tagSelected = '';
	addEventHandler(tagList, 'click', function(e) {
		if (e.target.nodeName.toLowerCase() == 'span') {

			var tagSelected = e.target.innerText;
			if (e.target.classList.contains('selected')) {

				tagSelected = '';
				e.target.style.borderColor = 'transparent';
				e.target.classList.remove('selected');
			} else {

				e.target.classList.add('selected');
				e.target.style.borderColor = e.target.style.color;
				var siblings = getSiblings(e.target);
				siblings.forEach(function(element) {
					element.style.borderColor = 'transparent';
					element.classList.remove('selected');
				});
			}


			var url = '/merch/category?tag=' + encodeURIComponent(tagSelected);
			xhr = new XMLHttpRequest();
			xhr.open('get', url, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					try {
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

							var res = JSON.parse(xhr.responseText);
							var results = res.result;
							if (results.length) {
								var oldOne = document.querySelector('#items');
								var node = document.createElement('div');
								node.id = 'items';
								var innhtml = '';
								results.forEach(function (item) {
									var tags = '';
									//item.tag.forEach(function(t) {
									//	if (t.length) {
									//		tags += '<span class="tag">' + t + '</span>';
									//	}
									//});

									var opts = '';
									if (res.logged) {
										opts += '<span class="op-bt"><a href="/admin/merch/update/' + item.id + '">edit<i class="fa fa-edit"></i></a></span>' +
												'<span class="op-bt remove-post"><a href="/admin/merch/remove/' + item.id + '"">delete<i class="fa fa-trash-o"></i></a></span>';
									}

									innhtml += '<item><div class="entry">' +
										'<a href="/merch/' + item.id + '">' + '<div class="item-image" style="background-image: url(../uploads/' + item.image + ')"></div></a>' +
										'<a href="/merch/' + item.id + '">' + item.title + '</a>' +
										'<div class="entry-company">' + item.company + '</div>' +
										'<div class="entry-series">' + item.series + '</div>' +
										'<div class="entry-category">' + item.category + '</div>' +
										'<div class="entry-meta">' +
											'<span>updated at ' + new Date(item.updated_time).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) + '</span>' +
											tags + opts +
										'</div>' +
										'</div></item>';

								});
								node.innerHTML = innhtml;
								itemList.replaceChild(node, oldOne);
							}

						} else {
							alert("Request was unsuccessful: " + xhr.status);
						}
					} catch (e) {

					}
				}
			};

			xhr.send(null);

		}
	});

	var returnTag = sideBar.querySelector('.tool-bar i:first-child');
	addEventHandler(returnTag, 'click', function() {

		sideBar.querySelector('.tags-list').style.cssText = 'transform: translateX(112%)';
		sideBar.querySelector('.nav').style.opacity = '1';
	});

	addEventHandler(search, 'input', function searchHandler(e) {

		var searchKeyword = search.value;
		var url = '/merch/search?keyword=' + encodeURIComponent(searchKeyword);
		xhr = new XMLHttpRequest();
		xhr.open('get', url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				try {
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

						var res = JSON.parse(xhr.responseText);
						var results = res.result;
						if (results.length) {
							var oldOne = document.querySelector('#items');
							var node = document.createElement('div');
							node.id = 'items';
							var innhtml = '';
							results.forEach(function(item) {
								var tags = '';
								//item.tag.forEach(function(t) {
								//	if (t.length) {
								//		tags += '<span class="tag">' + t + '</span>';
								//	}
								//});

								var opts = '';
								if (res.logged) {
									opts += '<span class="op-bt"><a href="/admin/merch/update/' + item.id + '">edit<i class="fa fa-edit"></i></a></span>' +
											'<span class="op-bt remove-post"><a href="/admin/merch/remove/' + item.id + '">delete<i class="fa fa-trash-o"></i></a></span>';
								}

								innhtml += '<item><div class="entry">' +
									'<a href="/merch/' + item.id + '">' + '<div class="item-image" style="background-image: url(../uploads/' + item.image + ')"></div></a>' +
									'<a href="/merch/' + item.id + '">' + item.title + '</a>' +
									'<div class="entry-company">' + item.company + '</div>' +
									'<div class="entry-series">' + item.series + '</div>' +
									'<div class="entry-category">' + item.category + '</div>' +
									'<div class="entry-meta">' +
										'<span>updated at ' + new Date(item.updated_time).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) + '</span>' +
										tags + opts +
									'</div>' +
									'</div></item>';

							});
							node.innerHTML = innhtml;
							itemList.replaceChild(node, oldOne);
						}

					} else {
						alert("Request was unsuccessful: " + xhr.status);
					}
				} catch (e) {

				}
			}
		};

		xhr.send(null);

	});

	/**
	 *
	 * @param element
	 * @param type
	 * @param callback
     */
	function addEventHandler(element, type, callback) {
		if (element.addEventListener) {
			element.addEventListener(type, callback, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + type, callback);
		} else {
			element['on' + type] = callback;
		}
	}

	function getRandomColor() {
		var r = Math.floor(Math.random() * 100) + 156;
		var a = (Math.random() * 0.5 + 0.4).toFixed(2);
		//var g = Math.floor(Math.random() * 100) + 156;
		//var b = Math.floor(Math.random() * 100) + 156;
		return 'rgba(' + r + ',' + r + ',' + r + ',' + a + ')';
	}

	function getSiblings(node) {
		var children = node.parentNode.children;
		var len = children.length;
		var siblings = [];
		for(var i = 0; i < len; i++) {
			if (children.item(i) !== node) {
				siblings.push(children.item(i));
			}
		}
		return siblings;
	}
})();
