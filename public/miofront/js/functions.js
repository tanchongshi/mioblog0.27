// Start Wrapper
jQuery(document).ready(function($) {

    // Mobile Nav Menu
    $(function menuToggle() {

        $('#nav-primary-mobile .menu-toggle').click(function() {
            $('#nav-primary-mobile ul').slideToggle('slow', function() {});
            return false;
        });
    });

    //博客栏目
    $.ajax({
        url: '/postblocategory',
        type: 'get',
        success: function(doc) {
            var liBody = "";
            var str = [8, 9, 10, , 11, 12, 13];
            $.each(doc.data, function(index) {
                var random = Math.floor(Math.random() * str.length);
                liBody += '<a class="tag-link-5" style = "font-size: ' + str[random] + 'pt" href = "/categoryblog/' + this._id + '">' + this.categoryName + ' (' + this.article.length + ')</a>';
            });
            $('#collapseOne').html($(liBody));
        }
    });

    $("#nav-category").on('click', function() {
        $("#footer-widgets").toggle("slow");
    })

    $("#nav-category-mb").on('click', function() {
        $("#footer-widgets").toggle("slow");
    })

    //首页显示照片
    if(document.getElementById('mioHome')){
        $("#mioImageMe").addClass('on');
         $("#nav-home").addClass('active');
    } else if(document.getElementById('mioCategory')){
        $("#nav-category").addClass('active');
    } else if(document.getElementById('mioAboutme')){
        $("#nav-aboutme").addClass('active');
    } else if(document.getElementById('mioBlog')) {
        $("#nav-blog").addClass('active');
    }else {

    }



    //	End Wrapper
});
