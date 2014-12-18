/**
 * Created by Administrator on 14-5-19.
 */



jQuery(document).ready(function($){

    function b(){
        h = $(window).height();
        t = $(document).scrollTop()+$(window).height();
        if(t > h){
            $('#shangxia').show();
        }else{
            $('#shangxia').hide();
        }
    }
    b();
    var s = $(window).height()/2+100;
    //http://www.yesure.net/archives/4410.html http://www.yzznl.cn/


    $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
    $('#shang').click(function(){$body.animate({scrollTop: '0px'}, 800);});
    $('#xia').click(function(){$body.animate({scrollTop:$('#footer-bottom').offset().top}, 800);});
    //$('#comt').click(function(){$body.animate({scrollTop:$('#comments').offset().top}, 800);});
    //
    
    var userAgent = navigator.userAgent;
    if(userAgent){
        userAgent = userAgent.toUpperCase();
        var mobilePhoneList = ["IOS","IPHONE","ANDROID","WINDOWS PHONE"];
    }
    
    for(var i=0, len=mobilePhoneList.length;i<len;i++){
        if(userAgent.indexOf(mobilePhoneList[i])>-1){
            return;
        }
    }    

    $(window).scroll(function (){
        b();
//        var s= $('#shangxia').offset().top;
        $("#shangxia").animate({top : $(window).scrollTop() + s + "px" },{queue:false,duration:500});
    });    
});