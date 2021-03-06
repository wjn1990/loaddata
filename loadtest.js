﻿
var MyLoadData = (function () {
    function loaddata(options,callback) {
        this.hidpageid = options && options.hidpageid || "hidpage";//当前页码隐藏域id
        this.hidtotalpageid = options && options.hidtotalpageid || "hidtotalpage";//总页数隐藏域id
        this.totalcountid = options && options.totalcountid || "lbltotalcount";//总数量标签id
        this.loadingid = options && options.loadingid || "loading";//加载中标签id
        this.loadmoreid = options && options.loadmoreid || "loadmore";//加载更多按钮id
        this.listid = options && options.listid || "list";//数据列表id
        this.nodataid = options && options.nodataid || "nodata";//无数据内容id
        this.tmpleteid = options && options.tmpleteid || "templete";//模板id
        this.ajaxurl = options && options.ajaxurl || "/common/ajax_common.aspx/GetData";//数据源请求url
        this.ajaxtype = options && options.ajaxtype || "post";//请求方式
        this.ajaxdatatype = options && options.ajaxdatatype || "json";//ajax数据类型
        this.ajaxdata = options && options.ajaxdata || null;//请求参数对象
        this.queryinfo = options && options.queryinfo || null;//查询信息数组，每个查询对象包含一个key和一个id,key是请求参数的name,id是参数源控件id，例：[{key:"cityid",id:"hidcityid"},{key:"roomtype",id:"hidroomtype"}]
        this.isdefaulthandle = options && options.isdefaulthandle || true;//调用成功后是否默认处理方式
        this.resultdatatype = options && options.resultdatatype || "json";//返回结果解析类型 
        this.listdatatype = options && options.listdatatype || "json";//返回数据列表解析类型 
        /*
           datastruct：数据结构，根据此结构解析返回数据，为null时采用默认结构，即{"page":1,"totalpage":10,"list":[]}
           例如：{"verify":{"errcode":0,"ret":true},msg:"errMsg",data:"data.list",totalpage:"data.totalpage",totalcount:"data.totalcount"}
           其中，verify用于校验数据是否返回成功，如果为空或不存在则不校验；msg为返回的描述性文字，比如错误说明；data为数据列表路径，用.分隔，
           示例中调用结构应为：json["data"]["list"];totalpage和totalcount分别为数据总页数和总条目数路径
       */
        this.datastruct = options && options.datastruct || null;
        this.istemplete = options && options.istemplete || true;//是否使用模板
        this.showlistfunc = options && options.showlist || true;//展示数据的方法（listdatatype为json并且不使用模板时起作用）

        this.successcallback = callback && callback.success || null;//请求成功后的回调
        this.errorcallback = callback && callback.error || null;//请求失败后的回调
        this._init();
    }
    loaddata.prototype = {
        load: function () {
            var that = this;
            var hidpageid = this.hidpageid;
            var hidtotalpageid = this.hidtotalpageid;
            var totalcountid = this.totalcountid;
            var loadingid = this.loadingid;
            var loadmoreid = this.loadmoreid;
            var listid = this.listid;
            var nodataid = this.nodataid;
            var tmpleteid = this.tmpleteid;
            var ajaxurl = this.ajaxurl;
            var ajaxtype = this.ajaxtype;
            var ajaxdatatype = this.ajaxdatatype;
            var ajaxdata = this.ajaxdata;
            var queryinfo = this.queryinfo;
            var isdefaulthandle = this.isdefaulthandle;
            var resultdatatype = this.resultdatatype;
            var listdatatype = this.listdatatype;
            /*
               datastruct：数据结构，根据此结构解析返回数据，为null时默认返回数据格式为{"page":1,"totalpage":10,"list":[]}
               例如：{"verify":{"errcode":0,"ret":true},msg:"errMsg",data:"data.list",totalpage:"data.totalpage",totalcount:"data.totalcount"}
               其中，verify用于校验数据是否返回成功，如果为空或不存在则不校验；msg为返回的描述性文字，比如错误说明；data为数据列表路径，用.分隔，
               示例中调用结构应为：json["data"]["list"];totalpage和totalcount分别为数据总页数和总条目数路径
           */
            var datastruct = this.datastruct;
            var istemplete = this.istemplete;
            var showlistfunc = this.showlistfunc;

            var successcallback = this.successcallback;
            var errorcallback = this.errorcallback;
            $("#" + nodataid).hide();
            var curpage = parseInt($("#" + hidpageid).val());
            var totalpage = parseInt($("#" + hidtotalpageid).val());
            var page = curpage + 1;
            if (page <= totalpage) {
                var options = ajaxdata;
                if (options == null) {
                    options = { page: page, pagesize: 10 };
                }
                if (queryinfo != null && queryinfo.length > 0) {//查询信息数组，例：[{key:"cityid",id:"hidcityid"},{key:"roomtype",id:"hidroomtype"}]
                    var queryoptions = {};
                    for (var i = 0; i < queryinfo.length; i++) {
                        var key = queryinfo[i].key;
                        var id = queryinfo[i].id;
                        var val = $("#" + id).val();
                        queryoptions[key] = val;
                    }
                    options = Object.assign(options, queryoptions);//合并查询条件
                }
                $.ajax({
                    data: JSON.stringify({ options: options }),
                    type: ajaxtype,
                    url: ajaxurl,
                    dataType: ajaxdatatype,
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function () {
                        if ($("#" + loadingid) != undefined)
                        { $("#" + loadingid).show(); }
                    },
                    complete: function () {
                        if ($("#" + loadingid) != undefined)
                        { $("#" + loadingid).hide(); }
                    },
                    success: function (data) {
                        if (isdefaulthandle)//默认处理方式
                        {
                            var result = null;
                            if (ajaxdatatype === "json") {
                                result = data.d;
                            }
                            else {
                                result = data;
                            }
                            if (result != "" && result != null) {
                                if (resultdatatype == "json") {
                                    var json = $.parseJSON(result);
                                    var totalpage = 0;
                                    var totalcount = 0;
                                    var list = null;
                                    var msg = "";
                                    if (datastruct == null) {
                                        list = json.list;
                                        totalpage = json.totalpage;
                                    }
                                    else {
                                        var struct_verify = datastruct.verify;
                                        var struct_msg = datastruct.msg;
                                        var struct_data = datastruct.data;
                                        var struct_pages = datastruct.totalpage;
                                        var struct_count = datastruct.totalcount;
                                        var b = true;
                                        if (struct_verify != undefined && struct_verify != null) {//返回结果校验
                                            for (var key in struct_verify) {
                                                if (json[key] != struct_verify[key]) {
                                                    b = false;
                                                }
                                            }
                                        }
                                        if (b) {

                                            //数据列表
                                            if (struct_data != undefined && struct_data != null) {
                                                var struct_data_arr = struct_data.split(".");
                                                var temp = json;
                                                for (var i = 0; i < struct_data_arr.length; i++) {
                                                    temp = temp[struct_data_arr[i]];
                                                    if (temp == undefined) {
                                                        break;
                                                    }
                                                }
                                                if (temp != undefined) {
                                                    list = temp;
                                                }
                                            }
                                            //总页数
                                            if (struct_pages != undefined && struct_pages != null) {
                                                var struct_pages_arr = struct_pages.split(".");
                                                temp = json;
                                                for (var i = 0; i < struct_pages_arr.length; i++) {
                                                    temp = temp[struct_pages_arr[i]];
                                                    if (temp == undefined) {
                                                        break;
                                                    }
                                                }
                                                if (temp != undefined) {
                                                    totalpage = temp;
                                                }
                                            }
                                            //总条目数
                                            if (struct_count != undefined && struct_count != null) {
                                                var struct_count_arr = struct_count.split(".");
                                                temp = json;
                                                for (var i = 0; i < struct_count_arr.length; i++) {
                                                    temp = temp[struct_count_arr[i]];
                                                    if (temp == undefined) {
                                                        break;
                                                    }
                                                }
                                                if (temp != undefined) {
                                                    totalcount = temp;
                                                }
                                            }
                                        }
                                        else {
                                            msg = json[struct_msg];
                                        }
                                    }
                                    if (list != undefined && list != null && list.length > 0) {
                                        if (listdatatype == "json") {
                                            if (istemplete && $("#" + tmpleteid).length > 0) {
                                                $("#" + tmpleteid).tmpl(list).appendTo("#" + listid);
                                            }
                                            else {
                                                that.showlistfunc(list);
                                            }
                                        }
                                        else {
                                            $("#" + listid).append(list);
                                        }
                                        that.setpage(page, totalpage, totalcount);

                                    }
                                    else {
                                        if (page == 1)
                                        { $("#" + nodataid).show(); }
                                    }
                                }
                                else if (resultdatatype == "html") {
                                    $("#" + listid).append(result);
                                }
                            }
                            else {
                                if (page == 1)
                                { $("#" + nodataid).show(); }
                            }
                            that.successcall(data);
                           
                        }
                        else {
                            that.successcall(data);
                        }

                    },
                    error: function (e) {
                        if (page == 1)
                        { $("#" + nodataid).show(); }
                        that.errorcall(e);
                    }
                });
            }
        },
        showlistfunc: function (data) {
            if (this.showlistfunc != null) {
                if ("function" == typeof this.showlistfunc)
                { this.showlistfunc(data); }
                else if ("string" == typeof this.showlistfunc) {
                    var func = window[this.showlistfunc];
                    if ("function" == typeof func)
                    { func(data); }
                }
            }
        },
        setpage: function (page, totalpage, totalcout) {
            $("#" + this.hidpageid).val(page);
            $("#" + this.hidtotalpageid).val(totalpage);
            if ($("#" + this.totalcountid).length > 0) {
                if ($("#" + this.totalcountid).is('input')) {
                    $("#" + this.totalcountid).val(totalcout);
                }
                else { $("#" + this.totalcountid).html(totalcout); }
            }
            if (page < totalpage) {
                $("#" + this.loadmoreid).show();
            }
            else {
                $("#" + this.loadmoreid).hide();
            }
        },
        successcall: function (data) {
            if (this.successcallback != null) {
                if ("function" == typeof this.successcallback)
                { this.successcallback(data); }
                else if ("string" == typeof this.successcallback) {
                    var func = window[this.successcallback];
                    if ("function" == typeof func)
                    { func(data); }
                }
            }
        },
        errorcall: function (e) {
            if (this.errorcallback != null) {
                if ("function" == typeof this.errorcallback)
                { this.errorcallback(e); }
                else if ("string" == typeof this.errorcallback) {
                    var func = window[this.errorcallback];
                    if ("function" == typeof func)
                    { func(e); }
                }
            }
        },
        reload: function () {
            $("#" + this.hidpageid).val(0);
            $("#" + this.hidtotalpageid).val(1);
            $("#" + this.listid).html("");
            this.load();
        },
        _init: function () {
            var that = this;
            if ($("#" + this.loadmoreid).length > 0)
            {
                $("#" + this.loadmoreid).click(function () {
                    that.load();
                })
            }          
            $("#" + this.hidpageid).val(0);
            $("#" + this.hidtotalpageid).val(1);
            $("#" + this.listid).html("");
            this.load();
        }
    }
    return loaddata;
})();