var httpd = config().RequestUrl; //请求域名前缀；
$(function() {
	var zoons = zoonData; //动物id数据；

	var anchor_id = "";
	var token = "";
	var client_platform = "";
	tabFn(); //选项切换

//		httpd = "http://119.23.220.172/api/";
//		anchor_id = "244550";
//		token = "42f6b32ea01737fd329d4d59af350e3a";
//		client_platform = "ios";

	/**下注部分**/
	var totalTime = 40; //每局时间40秒
	var betTime = 30; //下注时间30秒
	var resultData = ""; //游戏结果；
	var rollTime = 0; //记录开始旋转到结束时间；
	var rollTimer = ""; //记录开始旋转到结束间隔器；
	var active_i = 0; //记录选择下注金额的数值类型；
	/**旋转部分**/
	var luckNum = -1; //控制循环旋转；
	var fastCir = 0; //记录快速旋转圈数；
	var slowCir = 0; //记录慢速旋转个数；
	var speed = 50; //旋转速度；
	var maxLength = $(".game-loop-item").length; //长度；
	var signCir = maxLength - 1; //坐标旋转到此处，记录一圈；
	var fastCirNum = 3; //快速旋转多少圈，开始减速；
	var slowCirNum = maxLength / 2; //慢速旋转多少个之后，开始出结果；
	var fastTimer = null; //快速旋转定时器；
	var resultid = 1; //中奖id；
	/**请求超时部分**/
	var reqTime = 0; //请求超时时间；
	var reqTimer = ""; //请求超时定时器；

	/*客户端交互*/
	var u = navigator.userAgent;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

	function setupWebViewJavascriptBridge(callback) {
		if(window.WebViewJavascriptBridge) {
			callback(WebViewJavascriptBridge)
		} else {
			document.addEventListener(
				'WebViewJavascriptBridgeReady',
				function() {
					callback(WebViewJavascriptBridge)
				},
				false
			);
		}
		if(window.WebViewJavascriptBridge) {
			return callback(WebViewJavascriptBridge);
		}
		if(window.WVJBCallbacks) {
			return window.WVJBCallbacks.push(callback);
		}
		window.WVJBCallbacks = [callback];
		var WVJBIframe = document.createElement('iframe');
		WVJBIframe.style.display = 'none';
		WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
		document.documentElement.appendChild(WVJBIframe);
		setTimeout(function() {
			document.documentElement.removeChild(WVJBIframe)
		}, 0)

	}
	setupWebViewJavascriptBridge(function(bridge) {
		if(isAndroid) {
			bridge.init(function(data, responseCallback) {
				responseCallback("init");
			})
		}
		bridge.registerHandler('callJSFunction', function(data, responseCallback) {
			data = eval('(' + data + ')');
			anchor_id = String(data.anchorid); //主播ID;
			token = String(data.tokenid); //tokenID;
			client_platform = String(data.client_platform); //安卓||ios
			responseCallback(data);
		})
	})

	function stockCoolbFn(nums) {
		WebViewJavascriptBridge.callHandler('stockCoolb', nums, function(response) {});
	}

	var initTimer = setInterval(function() {
		if(anchor_id && token) {
			clearInterval(initTimer);
			init();
		}
	}, 100)

	$(".myrecord").click(function() { //我的记录
		$(".loading").show();
		getGameBetHistory(token, client_platform).then(function(data) {
			$(".loading").hide();
			var list_r = data.list; //我的记录数组；
			$(".record-list").children("li").remove();
			for(var i = 0; i < list_r.length; i++) {
				var win_rel_cob = "";
				var win_rel_zoo = "";
				if(list_r[i].compensate_amt > 0) {
					win_rel_cob = '<span class="active_y">猜中+' + million(list_r[i].compensate_amt) + '</span>';
				} else {
					win_rel_cob = '<span class="active_n">未猜中</span>';
				}
				if(list_r[i].win_info.animal_id > 0) {
					win_rel_zoo = '<span>本期开奖：' + zoons[list_r[i].win_info.animal_id].name + '，赔率：' + list_r[i].win_info.multiple + '</span>';
				} else {
					win_rel_zoo = '<span>本期正在进行中</span>';
				}
				var re_html = $('<li>' +
					'<p class="record-t"><span>购买期数</span><span>购买时间</span><span>购买内容/购买酷币</span></p>' +
					'<div class="record-c">' +
					'<div>第' + list_r[i].game_id_string + '期</div>' +
					'<div>' + list_r[i].add_time + '</div>' +
					'<div class="zoon-bet-all">' +
					'</div>' +
					'</div>' +
					'<p class="record-b">' + win_rel_zoo + win_rel_cob + '</p>' + '</li>');

				var list_b = list_r[i].bet_list;
				for(var y = 0; y < 8; y++) {
					var b_html = "";
					if(list_b[y]) {
						if(list_b[y].animal_id == list_r[i].win_info.animal_id) {
							b_html = '<span class="active">' + zoons[list_b[y].animal_id].name + '/' + million(list_b[y].total_bet_amt) + '</span>';
						} else {
							b_html = '<span>' + zoons[list_b[y].animal_id].name + '/' + million(list_b[y].total_bet_amt) + '</span>';
						}
					} else {
						b_html = '<span>--/--</span>';
					}
					re_html.find(".zoon-bet-all").append(b_html);
				}
				$(".record-list").append(re_html);
			}
		})
	})

	function init() { //初始函数；
		//初始化变量；
		totalTime = 40; //每局时间40秒
		betTime = 30; //下注时间30秒
		resultData = ""; //游戏结果；
		rollTime = 0; //记录开始旋转到结束时间；
		$(".result-pro").hide(); //关闭结果弹框；

		requestTimerOn(3); //开启请求时间检测；
		getGameInfo(token, client_platform).then(function(data) {
			console.log(data);
			$(".init-loading").hide(); //初始loading；
			requestTimerOff(); //关闭请求时间检测；
			var game_id = data.game_id_string; //game_id;
			var animals = data.animals; //可下注的8个动物;
			var bet_amt_range = data.bet_amt_range.slice(0, 5); //可选择下注的金额类型;
			var start_time = Number(data.start_time); //游戏开始时间;
			var now_time = Number(data.now_time); //游戏当前时间;
			var username = data.username; //玩家昵称;
			var giftpoint = Number(data.giftpoint); //玩家礼物点;
			var bet_list = data.bet_list; //下注金额记录;
			var last_win = data.last_win_animal_id.slice(0, 10); //往期记录;
			var status = Number(data.status); //游戏目前状态;1-下注状态;2-不可下注状态,可获取结果;3-不可下注状态可获取结果
			var zoon_psn = last_win[0]; //找到装盘的动物位置；关闭重弄开还能找到上次动物位置；

			if($(".game-loop .active").length <= 0) {
				zoon_psn = $(".game-loop").find("div[data-zoonid=" + zoon_psn + "]").eq(0).index();
				luckNum = zoon_psn;
				signCir = luckNum;
				$(".game-loop").find("div").eq(zoon_psn).addClass("active");
				console.log(zoon_psn);
			}

			/*判断服务器时间是否错乱*/
			if((now_time - start_time) > 60) {
				$(".data-crash").show();
				return false;
			}

			/*下注的动物,渲染*/
			$(".game-bets-choice").children("li").remove();
			for(var i = 0; i < animals.length; i++) {
				var bet_html = '<li data-zoonid="' + animals[i].animal_id + '">' +
					'<img class="bets-icon" src="' + zoons[animals[i].animal_id].src + '"/>' +
					'<p class="bets-num">0</p>' +
					'<p class="bets-odd">X' + animals[i].multiple + '</p>' +
					'</li>'
				$(".game-bets-choice").append(bet_html);
			}
			/*下注金额记录*/
			for(var i = 0; i < bet_list.length; i++) {
				$(".game-bets-choice").find("li[data-zoonid=" + bet_list[i].animal_id + "]").find(".bets-num").html(bet_list[i].amt);
			}
			/*可选金额，渲染*/
			$(".game-foot-r").children("span").remove();
			for(var i = 0; i < bet_amt_range.length; i++) {
				var amt_html = '<span class="amount-item amount-item-c' + (i + 1) + '">' + bet_amt_range[i] + '</span>';
				if(i == active_i) {
					amt_html = '<span class="amount-item amount-item-c' + (i + 1) + ' active">' + bet_amt_range[i] + '</span>';
				}
				$(".game-foot-r").append(amt_html);
			}
			/*用户信息*/
			$(".user-name em").html(username);
			$(".user-coolb em").html(giftpoint);

			/*游戏期数*/
			$(".bets-title-l").html("<em>" + game_id + "</em>期");
			/*往期记录*/
			$(".record-r").children("span").remove();
			for(var i = 0; i < last_win.length; i++) {
				if(Number(last_win[i])) {
					var win_html = '<span class="record-item"><img src="' + zoons[last_win[i]].src + '"/></span>';
					$(".record-r").append(win_html);
				} else {
					alerts("往期中奖纪录数据有误");
				}
			}

			if(status == 1) { //购买状态；
				console.log("购买状态");
				chooseBet(); //选择下注；
				var endBetTime = betTime - (now_time - start_time); //结束购买时间；
				$(".bets-title-r").html("结束购买：" + endBetTime + "s");
				var endBetTimer = setInterval(function() { //结束购买倒计时；
					endBetTime--;
					$(".bets-title-r").html("结束购买：" + endBetTime + "s");
					if(endBetTime <= 0) { //结束停止购买间隔器；
						clearInterval(endBetTimer);
						$(".bets-title-r").html("准备开奖");
						stopClickCoolb(); //禁止下注；
						setTimeout(function() { //延迟一秒获取游戏结果；
							requestTimerOn(3); //开启请求时间检测；
							getGameInfo(token, client_platform).then(function(data) {
								requestTimerOff(); //关闭请求时间检测；
								resultData = data;
								var isResult = resultData.win_animal_id; //确保存在结果再旋转，预防网络问题数据包丢失
								if(isResult && Number(isResult)) {
									$(".bets-title-r").html("正在开奖");
									rollTimer = setInterval(function() { //开始计时；
										rollTime++;
									}, 1000)
									speed = 50; //旋转速度；
									fastCir = 0; //记录快速旋转圈数；
									slowCir = 0; //记录慢速旋转圈数；
									resultid = resultData.win_animal_id; //中奖id；
									initroll(); //旋转后，游戏结果渲染;
								} else {
									alerts("数据异常，请重新打开");
								}
							})
						}, 1000)
					}
				}, 1000)
			} else if(status == 2) { //即将开奖；
				console.log("即将开奖");
				$(".bets-title-r").html("准备开奖");
				stopClickCoolb(); //禁止下注；
				setTimeout(function() { //延迟一秒获取游戏结果；
					requestTimerOn(3); //开启请求时间检测；
					getGameInfo(token, client_platform).then(function(data) {
						requestTimerOff(); //关闭请求时间检测；
						resultData = data;
						var isResult = resultData.win_animal_id; //确保存在结果再旋转，预防网络问题数据包丢失
						if(isResult && Number(isResult)) {
							$(".bets-title-r").html("正在开奖");
							rollTimer = setInterval(function() { //开始计时；
								rollTime++;
							}, 1000)
							speed = 50; //旋转速度；
							fastCir = 0; //记录快速旋转圈数；
							slowCir = 0; //记录慢速旋转圈数；
							resultid = resultData.win_animal_id; //中奖id；
							initroll(); //旋转后，游戏结果渲染;
						} else {
							alerts("数据异常，请重新打开");
						}
					})
				}, 1000)
			} else if(status == 3) { //开奖状态；
				console.log("游戏结束");
				stopClickCoolb(); //禁止下注；
				requestTimerOn(3); //开启请求时间检测；
				getGameInfo(token, client_platform).then(function(data) {
					requestTimerOff(); //关闭请求时间检测；
					resultData = data;
					var isResult = resultData.win_animal_id; //确保存在结果再旋转，预防网络问题数据包丢失
					if(isResult && Number(isResult)) {
						resultOpera(); //游戏结果渲染;
					}else{
						alerts("数据异常，请重新打开");
					}
					
				})
			}
		})
	}

	function resultOpera() {
		clearInterval(rollTimer); //关闭计时器；
		var start_time = Number(resultData.start_time); //游戏开始时间;
		var now_time = Number(resultData.now_time); //游戏当前时间;
		var win_animal_id = Number(resultData.win_animal_id); //中奖id；
		var compensate_amt = resultData.compensate_amt; //盈利酷币；
		var giftpoint = Number(resultData.giftpoint); //玩家礼物点;
		var is_bet = resultData.is_bet; //是否下注有；1下注，2没下注；
		var nextOpenTime = totalTime - (now_time - start_time) - rollTime + 3; //下局开始时间；

		console.log("中奖id、" + win_animal_id);

		$(".user-coolb em").html(giftpoint);
		$(".bets-title-r").html("下局开始：" + nextOpenTime + "s");
		var nextOpenTimer = setInterval(function() {
			nextOpenTime--;
			$(".bets-title-r").html("下局开始：" + nextOpenTime + "s");
			if(nextOpenTime <= 0) { //下局开始；
				clearInterval(nextOpenTimer);
				init();
			}
		}, 1000)

		if(is_bet == 1) { //有下注
			if(compensate_amt > 0) { //猜中了
				$(".result-title p").html("猜中啦！");
				$(".result-ind").html('恭喜你，获得<em>' + compensate_amt + '酷币</em>！');
			} else { //没有猜中
				$(".result-title p").html("未猜中！");
				$(".result-ind").html('很遗憾，未能获得奖励！');
			}
		} else if(is_bet == 2) { //没有下注
			$(".result-title p").html("未购买！");
			$(".result-ind").html('下期记得购买哦！');
		}
		$(".result-zoo-icon img").attr("src", zoons[win_animal_id].src);
		$(".result-zoo-exp").html("本期开奖：" + zoons[win_animal_id].name);
		setTimeout(function() {
			$(".result-pro").fadeIn();
		}, 500)
		$(".off-result").click(function() {
			$(".result-pro").hide();
		})
	}

	function initroll() { //初始旋转，快速状态；
		fastTimer = setInterval(function() {
			looprotate();
			if(luckNum == signCir) {
				fastCir++;
			} //记录快速旋转圈数
			if(fastCir >= fastCirNum) { //判断，快速圈数旋转完毕，开始减速运动
				console.log("开始减速");
				clearInterval(fastTimer);
				setTimeout(slowroll, speed);
			}
		}, speed)
	}

	function slowroll() { //减速运动；
		looprotate();
		speed += 15;
		slowCir++;
		if(slowCir >= slowCirNum) { //基本减速过程完毕；
			var selectid = $(".game-loop-item").eq(luckNum).data("zoonid"); //旋转到此处的id
			if(selectid == resultid) { //旋转到中奖id处；停止运动；出结果
				resultOpera(); //游戏结果渲染；
				signCir = luckNum;
				return false;
			}
		}
		setTimeout(slowroll, speed);
	}

	function looprotate() { //循环旋转；
		luckNum++;
		if(luckNum >= maxLength) {
			luckNum = 0;
		}
		$(".game-loop-item").removeClass("active");
		$(".game-loop-item").eq(luckNum).addClass("active");
	}

	var isClick; //控制点击过快
	function chooseBet() { //选择下注；
		isClick = true;
		$(".game-foot-r span").click(function() {
			$(".game-foot-r span").removeClass("active");
			$(this).addClass("active");
			active_i = $(this).index(); //记录选择金额数值类型；
		})
		$(".game-bets-choice li").click(function() {
			if(isClick) {
				isClick = false;
				var that = this; //变量保存该this,后边需要this；
				var objectDom = $(".game-foot-r .active"); //选中数额的关键dom对象；
				var cloneDom = objectDom.clone(); //克隆dom对象；
				var betNum = Number(objectDom.html()); //选择的下注的金额；
				var oriNum = Number($(that).find(".bets-num").html()); //已经下注了的金额;
				var stockCoolb = Number($(".user-coolb em").html()); //用户酷币余额；
				var random_top = 0.5 + Math.random() * 0.5; //随机top；
				var random_left = 0.1 + Math.random() * 0.6; //随机left；
				var animal_id = $(that).data("zoonid"); //选中下注的动物id；
				$(".game-bets-choice li").removeClass("active");
				$(that).addClass("active");

				if((stockCoolb - betNum) >= 0) { //酷币足够下此注；
					gameBet(anchor_id, betNum, animal_id, token, client_platform).then(function(data) { //下注；
						if(data.ret == 1) { //购买成功；
							alerts("购买成功！");
							var cssJson = { //获取dom对象样式，变量保存；
								marginLeft: 0,
								position: "absolute",
								top: random_top + "rem",
								left: random_left + "rem",
								transform: "scale(0.7)",
							}
							cloneDom.css(cssJson); //克隆的dom赋值样式；
							cloneDom.off("click"); //解除未知事件，预防干扰；
							$(that).append(cloneDom);
							$(that).find(".bets-num").html(oriNum + betNum);
							$(".user-coolb em").html(stockCoolb - betNum);
							if(isAndroid) {
								stockCoolbFn($(".user-coolb em").html()); //回调客户端，酷币余额
							}
						} else {
							alerts(data.msg);
						}
						isClick = true;
					})
				} else {
					console.log("该酷币不足购买，自动选择下个酷币"); //酷币不足本次下注，自动选择下一个酷币；
					var amountTab = $(".game-foot-r span");
					amountTab.each(function(i, ele) {
						if($(ele).html() <= stockCoolb) {
							$(".game-foot-r span").removeClass("active");
							$(ele).addClass("active");
						} else {
							$(ele).removeAttr("class");
							$(ele).addClass("amount-ban-item");
							$(ele).off("click");
						}
					})
					if($(".game-foot-r .active").length > 0) {
						var objectDom = $(".game-foot-r .active"); //选中数额的关键dom对象；
						var cloneDom = objectDom.clone(); //克隆dom对象；
						var betNum = Number(objectDom.html()); //选择的下注的金额；
						gameBet(anchor_id, betNum, animal_id, token, client_platform).then(function(data) { //下注；
							if(data.ret == 1) { //购买成功；
								alerts("购买成功！");
								var cssJson = { //获取dom对象样式，变量保存；
									marginLeft: 0,
									position: "absolute",
									top: random_top + "rem",
									left: random_left + "rem",
									transform: "scale(0.7)",
								}
								cloneDom.css(cssJson); //克隆的dom赋值样式；
								cloneDom.off("click"); //解除未知事件，预防干扰；
								$(that).append(cloneDom);
								$(that).find(".bets-num").html(oriNum + betNum);
								$(".user-coolb em").html(stockCoolb - betNum);
								if(isAndroid) {
									stockCoolbFn($(".user-coolb em").html()); //回调客户端，酷币余额
								}
							} else {
								alerts(data.msg);
							}
							isClick = true;
						})
					} else {
						console.log("酷币不足以购买了哦");
						alerts("酷币余额不足购买");
						isClick = true;
					}

				}
				active_i = $(".game-foot-r .active").index(); //记录选择金额数值类型；
			}

		})

	}

	function stopClickCoolb() { //禁止选择酷币；
		$(".game-foot-r span").removeAttr("class");
		$(".game-foot-r span").addClass("amount-ban-item");
		$(".game-foot-r span").off("click");
		$(".game-bets-choice li").off("click");
		isClick = false;
	}

	function onClickCoolb() { //开启选择酷币；
		$(".game-foot-r span").removeAttr("class");
		$(".game-foot-r span").each(function(i, ele) {
			$(ele).addClass("amount-item amount-item-c" + (i + 1));
		})
		chooseBet();
	}

	var boxTimer;

	function alerts(strings) { //信息弹框；
		clearTimeout(boxTimer);
		$(".pro-frame").remove();
		var html = '<div class="pro-frame"><p>' + strings + '</p></div>';
		$("body").append(html);
		boxTimer = setTimeout(function() {
			$(".pro-frame").fadeOut();
		}, 1000)
	}

	function tabFn() { //选项切换
		$(".myrecord").click(function() {
			$(".guess-container").hide();
			$(".rule-container").hide();
			$(".record-container").show();
		})
		$(".openinst").click(function() {
			$(".guess-container").hide();
			$(".rule-container").show();
			$(".record-container").hide();
		})
		$(".back").click(function() {
			$(".guess-container").show();
			$(".rule-container").hide();
			$(".record-container").hide();
			$(".loading").hide();
		})
	}

	function requestTimerOn(time_max) { //开启检测请求超时
		reqTimer = setInterval(function() {
			reqTime++;
			if(reqTime >= time_max) {
				clearInterval(reqTimer);
				reqTime = 0;
				alerts("请求超时，建议重新打开")
			}
		}, 1000)
	}

	function requestTimerOff() { //关闭检测请求超时
		clearInterval(reqTimer);
		reqTime = 0;
	}

	function million(numbers) {
		if((numbers / 10000) >= 1) {
			return(numbers / 10000).toFixed(2) + "w";
		} else {
			return numbers;
		}
	}
})