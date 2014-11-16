/*******************************************************************************
* KindEditor - WYSIWYG HTML Editor for Internet
* Copyright (C) 2006-2011 kindsoft.net
*
* @author Roddy <luolonghao@gmail.com>
* @site http://www.kindsoft.net/
* @licence http://www.kindsoft.net/license.php
*******************************************************************************/

KindEditor.plugin('filemanager', function(K) {
	var self = this, name = 'filemanager',
		fileManagerJson,
		imgPath = self.pluginsPath + name + '/images/',
		lang = self.lang(name + '.');
	function makeFileTitle(filename, filesize, datetime) {
		return filename + ' (' + Math.ceil(filesize / 1024) + 'KB, ' + datetime + ')';
	}
	function bindTitle(el, data) {
		if (data.is_dir) {
			el.attr('title', data.filename);
		} else {
			el.attr('title', makeFileTitle(data.filename, data.filesize, data.datetime));
		}
	}
	self.plugin.filemanagerDialog = function(options) {
		var width = K.undef(options.width, 650),
			height = K.undef(options.height, 510),
			dirName = K.undef(options.dirName, ''),
			viewType = K.undef(options.viewType, 'VIEW').toUpperCase(), // "LIST" or "VIEW"
			clickFn = options.clickFn;
			//图片和文件管理目录不一样
			if(dirName == "image") {
				fileManagerJson = K.undef(self.fileManagerJson, '/nodejs/manage_image_json');
			} else {
				fileManagerJson = K.undef(self.fileManagerJson, '/nodejs/manage_file_json');
			}			
		var html = [
			'<div style="padding:10px 20px;">',
			// header start
			'<div class="ke-plugin-filemanager-header">',
			// left start
			'<div class="ke-left">',
			'<img class="ke-inline-block" name="moveupImg" src="' + imgPath + 'go-up.gif" width="16" height="16" border="0" alt="" /> ',
			'<a class="ke-inline-block" name="moveupLink" href="javascript:;">' + lang.moveup + '</a>',
			'</div>',
			// right start
/*			'<div class="ke-right">',
			lang.viewType + ' <select class="ke-inline-block" name="viewType">',
			'<option value="VIEW">' + lang.viewImage + '</option>',
			'<option value="LIST">' + lang.listImage + '</option>',
			'</select> ',
			lang.orderType + ' <select class="ke-inline-block" name="orderType">',
			'<option value="NAME">' + lang.fileName + '</option>',
			'<option value="SIZE">' + lang.fileSize + '</option>',
			'<option value="TYPE">' + lang.fileType + '</option>',
			'</select>',
			'</div>',
			*/
			'<div class="ke-clearfix"></div>',
			'</div>',
			// body start
			'<div class="ke-plugin-filemanager-body"></div>',
			'</div>'
		].join('');
		var dialog = self.createDialog({
			name : name,
			width : width,
			height : height,
			title : self.lang(name),
			body : html
		}),
		div = dialog.div,
		bodyDiv = K('.ke-plugin-filemanager-body', div),
		moveupImg = K('[name="moveupImg"]', div),
		moveupLink = K('[name="moveupLink"]', div),
		viewServerBtn = K('[name="viewServer"]', div),
		viewTypeBox = K('[name="viewType"]', div),
		orderTypeBox = K('[name="orderType"]', div);
		function reloadPage(path, order, func) {
			var param = 'path=' + path + '&order=' + order + '&dir=' + dirName;
			dialog.showLoading(self.lang('ajaxLoading'));
			K.ajax(K.addParam(fileManagerJson, param + '&' + new Date().getTime()), function(data) {
				dialog.hideLoading();
				func(data);
			});
		}
		var elList = [];
		function bindEvent(el, result, data, createFunc) {
			var fileUrl = K.formatUrl(result.current_url + data.filename, 'absolute'),
				dirPath = encodeURIComponent(result.current_dir_path + data.filename + '/');
			if (data.is_dir) {
				el.click(function(e) {
					reloadPage(dirPath, orderTypeBox.val(), createFunc);
				});
			} else if (data.is_photo) {
				el.click(function(e) {
					clickFn.call(this, fileUrl, data.filename);
				});
			} else {
				el.click(function(e) {
					clickFn.call(this, fileUrl, data.filename);
				});
			}
			elList.push(el);
		}
		function createCommon(result, createFunc) {
			// remove events
			K.each(elList, function() {
				this.unbind();
			});
			moveupLink.unbind();
			viewTypeBox.unbind();
			orderTypeBox.unbind();
			// add events
			if (result.current_dir_path) {
				moveupLink.click(function(e) {
					reloadPage(result.moveup_dir_path, orderTypeBox.val(), createFunc);
				});
			}
			function changeFunc() {
				if (viewTypeBox.val() == 'VIEW') {
					reloadPage(result.current_dir_path, orderTypeBox.val(), createView);
				} else {
					reloadPage(result.current_dir_path, orderTypeBox.val(), createList);
				}
			}
			viewTypeBox.change(changeFunc);
			orderTypeBox.change(changeFunc);
			bodyDiv.html('');
		}
		function createList(result) {
			createCommon(result, createList);
			var table = document.createElement('table');
			table.className = 'ke-table';
			table.cellPadding = 0;
			table.cellSpacing = 0;
			table.border = 0;
			bodyDiv.append(table);
			var fileList = result.file_list;
			for (var i = 0, len = fileList.length; i < len; i++) {
				var data = fileList[i], row = K(table.insertRow(i));
				row.mouseover(function(e) {
					K(this).addClass('ke-on');
				})
				.mouseout(function(e) {
					K(this).removeClass('ke-on');
				});
				var iconUrl = imgPath + (data.is_dir ? 'folder-16.gif' : 'file-16.gif'),
					img = K('<img src="' + iconUrl + '" width="16" height="16" alt="' + data.filename + '" align="absmiddle" />'),
					cell0 = K(row[0].insertCell(0)).addClass('ke-cell ke-name').append(img).append(document.createTextNode(' ' + data.filename));
				if (!data.is_dir || data.has_file) {
					row.css('cursor', 'pointer');
					cell0.attr('title', data.filename);
					bindEvent(cell0, result, data, createList);
				} else {
					cell0.attr('title', lang.emptyFolder);
				}
				if(data.is_dir == false){
					(function(data) { 
						//删除文件 文件管理使用
					/*	K(row[0].insertCell(1)).addClass('tdDelete').html("删除").click(function(event) {
							var $this=K(this);
						    if(!confirm('确定删除吗 ?')) {//提示，如果点击取消则直接退出
						        return false;
						    }
						    $.post('/nodejs/delete_json',{action:"delete",url: '/' + result.current_url+data.filename, _csrf:document.getElementById("wCsrfId").value},function(res){//jquery的post，action为指定的配合后端用，url是获取刚才存在删除按钮上的图片路径，你完全可以用别的来写，因为用不好kindeditor的js库才用的jquery
								if(res.result == 0) {
									alert("删除出现错误");
								} else if(res.result == 1){
									$this.parent().remove();
								} else{
									alert("删除文件夹出现错误");
								}
						        //res.result==1?$this.parent().remove():alert("删除出现错误");//如果返回1则直接删除 图片，名字的Div达到即时删除，否则提示
						        if(K(".ke-plugin-filemanager-body .ke-table tbody").children().length<1){K(".ke-plugin-filemanager-body").html("文件了")}//检查是否没有图片了
						    })							
						}); */

						//修改文件
						K(row[0].insertCell(1)).addClass('tdEditor').html("修改文件").click(function(event) {
							//$("#mioEditorFileId").trigger('click');
							//关闭所有对话框
							$(".ke-button-common .ke-button[value='关闭']").trigger("click");
							$(".ke-dialog-icon-close").trigger("click");
							//后台请求修改的文件
							$.ajax({
								url: '/nodejs/read_file_json',
								type: 'get',
								dataType: 'json',
								data: {url: '/' + result.current_url+data.filename},
							})
							.done(function(param) {
								console.log(param);
								if(param.result == "success") {
									var dialog = K.dialog({
									        width : 500,
									        title : '修改文件',
									        body : '<div style="margin:10px;"> <textarea id = "mioReadFileId" style="width:100%;height:200px;">'+
									        param.data+'</textarea></div>',
									        closeBtn : {
									                name : '关闭',
									                click : function(e) {
									                        dialog.remove();
									                }
									        },
									        yesBtn : {
									                name : '确定',
									                click : function(e) {
									                		console.log(data.filename);
									                        $.ajax({
									                        	url: '/nodejs/editor_file_json',
									                        	type: 'post',
									                        	dataType: 'json',
									                        	data: {
									                        		fileAera: $("#mioReadFileId").val(),
									                        		 _csrf: document.getElementById("wCsrfId").value,
									                        		 url: '/' + result.current_url+data.filename
									                        	},
									                        })
									                        .done(function() {
									                        	console.log("success");
									                        	dialog.remove();
									                        })
									                        .fail(function() {
									                        	console.log("error");
									                        })
									                        .always(function() {
									                        	console.log("complete");
									                        });
									                        
									                }
									        },
									        noBtn : {
									                name : '取消',
									                click : function(e) {
									                        dialog.remove();
									                }
									        }
									});							

								}								
								console.log("success");
							})
							.fail(function() {
								console.log("error");
							})
							.always(function() {
								console.log("complete");
							});
							
						});						
					})(data);
				}

				//K(row[0].insertCell(1)).addClass('ke-cell ke-size').html(data.is_dir ? '-' : Math.ceil(data.filesize / 1024) + 'KB');
				//K(row[0].insertCell(2)).addClass('ke-cell ke-datetime').html(data.datetime);
			}
		}
		function createView(result) {
			createCommon(result, createView);
			var fileList = result.file_list;
			for (var i = 0, len = fileList.length; i < len; i++) {
				var data = fileList[i],
					div = K('<div class="ke-inline-block ke-item" style="position:relative;"></div>');
				bodyDiv.append(div);
var photoDiv = K('<div class="ke-inline-block ke-photo"></div>');//创建图片div
div.append(photoDiv);//插入到循环div里
div.mouseover(function(e) {//滑过这个div的时候
    K(this).children().eq(0).addClass('ke-on');//给下面的第一个div也就说图片div添加ke-on
    data.is_photo&&K(this).children().eq(2).css("display","block");//如果是图片格式就查找当前下面的第3个标签元素设置为可见
	//data.is_photo&&K(this).children().eq(3).css("display","block");//如果是图片格式就查找当前下面的第4个标签元素设置为可见 删除图片放到文件管理
})
.mouseout(function(e) {//划出这个循环div时
    K(this).children().eq(0).removeClass('ke-on');//删除ke-on类
    data.is_photo&&K(this).children().eq(2).css("display","none");//如果是图片格式设置当前下第3个标签为隐藏
	//data.is_photo&&K(this).children().eq(3).css("display","none");//如果是图片格式设置当前下第4个标签为隐藏 删除图片放到文件管理
});
				div.append(photoDiv);
				var fileUrl = result.current_url + data.filename,
					iconUrl = data.is_dir ? imgPath + 'folder-64.gif' : (data.is_photo ? fileUrl : imgPath + 'file-64.gif');
				var img = K('<img src="' + iconUrl + '" width="80" height="80" alt="' + data.filename + '" />');
				if (!data.is_dir || data.has_file) {
					photoDiv.css('cursor', 'pointer');
					bindTitle(photoDiv, data);
					bindEvent(photoDiv, result, data, createView);
				} else {
					photoDiv.attr('title', lang.emptyFolder);
				}
				photoDiv.append(img);
				div.append('<div class="ke-name" title="' + data.filename + '">' + data.filename + '</div>');
if(data.is_photo){//如果是图片
    var _span=K('<span class="xl_span" data-url="'+K.formatUrl(result.current_url + data.filename, 'absolute')+'" style="position:absolute;display:none;width:102px;background:#0690d2;color:#FFF;text-align:center; cursor: pointer;line-height:20px;bottom:-3px;left:0;">删除</span>');
	var _span2 = K('<span class="xl_span2" data-url="'+K.formatUrl(result.current_url + data.filename, 'absolute')+'" style="position:absolute;display:none;width:102px;background:#0610d2;color:#FFF;text-align:center; cursor: pointer;line-height:20px;bottom:-3px;left:0;">引图</span>');
    //div.append(_span); 删除图片放到文件管理
	div.append(_span2);
}				
			}
K(".xl_span").click(function(){//这里的.xl_span对应着刚才插入的删除按钮上的class
    var $this=K(this);
    if(!confirm('确定删除吗 ?')) {//提示，如果点击取消则直接退出
        return false;
    }
    $.post('/nodejs/delete_json',{action:"delete",url:$this.attr("data-url"), _csrf:document.getElementById("wCsrfId").value},function(res){//jquery的post，action为指定的配合后端用，url是获取刚才存在删除按钮上的图片路径，你完全可以用别的来写，因为用不好kindeditor的js库才用的jquery
		if(res.result == 0) {
			alert("删除出现错误");
		} else if(res.result == 1){
			$this.parent().remove();
		} else{
			alert("删除文件夹出现错误");
		}
        //res.result==1?$this.parent().remove():alert("删除出现错误");//如果返回1则直接删除 图片，名字的Div达到即时删除，否则提示
        if(K(".ke-plugin-filemanager-body").children().length<1){K(".ke-plugin-filemanager-body").html("没有图片了")}//检查是否没有图片了
    })
})
//引图
K(".xl_span2").click(function(){
	var $this=K(this);
	$('#mioblogImageId').val($this.attr("data-url"));
	$('.mioblogImage').addClass('on');
	$('.mioyingtu').addClass('on');
});	
//引图
K("#mioyingtu").click(function(){
	$('#mioblogImageId').val("");
	$('.mioblogImage').removeClass('on');
	$('.mioyingtu').removeClass('on');
});		
			
		}

		viewTypeBox.val(viewType);
		reloadPage('', orderTypeBox.val(), viewType == 'VIEW' ? createView : createList);
		return dialog;
	}

});
