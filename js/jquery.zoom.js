;(function ($, window) {
    let ele = null,
        zoom_img_box = null,
        boxWidth = null,
        boxHeight = null,
        zoom_img_ul_outer = null,
        zoom_img_ul = null,
        zoom_img_ul_position = 0,
        zoom_img_ul_width = 0,
        zoom_img_ul_max_margin = 0,
        zoom_nav = null,
        zoom_nav_inner = null,
        navHightClass = "current",
        zoom_navSpan = null,
        navHeightWithBorder = null,
        images = null,
        zoom_prev_btn = null,
        zoom_next_btn = null,
        imgNum = 0,
        imgIndex = 0,
        imgArr = [],
        zoom_zoom = null,
        zoom_main_img = null,
        zoom_zoom_outer = null,
        zoom_preview = null,
        zoom_preview_img = null,
        autoPlayInterval = null,
        startX = 0,
        startY = 0,
        endX = 0,
        endY = 0,
        g = {},
        defaults = {
            "navWidth": 60,
            "navHeight": 60,
            "navItemNum": 5,
            "navItemMargin": 7,
            "navBorder": 1,
            "autoPlay": true,
            "autoPlayTimeout": 2000,
        };


    let methods = {
        init: function (options) {
            let opts = $.extend({}, defaults, options);

            ele = this;
            zoom_img_box = ele.find(".zoom_img_box");
            zoom_img_ul = ele.find(".zoom_img_ul");
            zoom_nav = ele.find(".zoom_nav");
            zoom_prev_btn = ele.find(".zoom_prev_btn");
            zoom_next_btn = ele.find(".zoom_next_btn");

            boxHeight = boxWidth = ele.outerWidth();

            // console.log("boxWidth::" + boxWidth);
            // console.log("ele.parent().width()::" + ele.parent().width());
            // console.log("ele.parent().outerWidth()::" + ele.parent().outerWidth());
            // console.log("ele.parent().innerWidth()::" + ele.parent().innerWidth());

    
            g.navWidth = opts.navWidth;
            g.navHeight = opts.navHeight;
            g.navBorder = opts.navBorder;
            g.navItemMargin = opts.navItemMargin;
            g.navItemNum = opts.navItemNum;
            g.autoPlay = opts.autoPlay;
            g.autoPlayTimeout = opts.autoPlayTimeout;

            images = zoom_img_box.find("img");
            imgNum = images.length;
            checkLoadedAllImages(images)
        },
        prev: function () {         
            moveLeft()
        },
        next: function () {          
            moveRight();
        },
        setImg: function () {            
            let url = arguments[0];

            getImageSize(url, function (width, height) {
                zoom_preview_img.attr("src", url);
                zoom_main_img.attr("src", url);

                
                if (zoom_img_ul.find("li").length === imgNum + 1) {
                    zoom_img_ul.find("li:last").remove();
                }
                zoom_img_ul.append('<li style="width: ' + boxWidth + 'px;">' +
                    '<img src="' + url + '"></li>');

                let image_prop = copute_image_prop(url, width, height);
                previewImg(image_prop);
            });
        },
    };

    $.fn.extend({
        "zoom": function (method, options) {
            if (arguments.length === 0 || (typeof method === 'object' && !options)) {
                if (this.length === 0) {
                    $.error('Selector is empty when call jQuery.exzomm');
                } else {
                    return methods.init.apply(this, arguments);
                }
            } else if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                
                $.error('Method ' + method + 'does not exist on jQuery.exzomm');
            }
        }
    });

        function init() {
        zoom_img_box.append("<div class='zoom_img_ul_outer'></div>");
        zoom_nav.append("<p class='zoom_nav_inner'></p>");
        zoom_img_ul_outer = zoom_img_box.find(".zoom_img_ul_outer");
        zoom_nav_inner = zoom_nav.find(".zoom_nav_inner");

       
        zoom_img_ul_outer.append(zoom_img_ul);

        for (let i = 0; i < imgNum; i++) {
            imgArr[i] = copute_image_prop(images.eq(i));
            console.log(imgArr[i]);
            let li = zoom_img_ul.find("li").eq(i);
            li.css("width", boxWidth);
            li.find("img").css({
                "margin-top": imgArr[i][5],
                "width": imgArr[i][3]
            });
        }

        zoom_navSpan = zoom_nav.find("span");
        navHeightWithBorder = g.navBorder * 2 + g.navHeight;
        g.zoom_navWidth = (navHeightWithBorder + g.navItemMargin) * g.navItemNum;
        g.zoom_nav_innerWidth = (navHeightWithBorder + g.navItemMargin) * imgNum;

        zoom_navSpan.eq(imgIndex).addClass(navHightClass);
        zoom_nav.css({
            "height": navHeightWithBorder + "px",
            "width": boxWidth - zoom_prev_btn.width() - zoom_next_btn.width(),
        });
        zoom_nav_inner.css({
            "width": g.zoom_nav_innerWidth + "px"
        });
        zoom_navSpan.css({
            "margin-left": g.navItemMargin + "px",
            "width": g.navWidth + "px",
            "height": g.navHeight + "px",
        });

      
        zoom_img_ul_width = boxWidth * imgNum;
        zoom_img_ul_max_margin = boxWidth * (imgNum - 1);
        zoom_img_ul.css("width", zoom_img_ul_width);
        
        zoom_img_box.append(`
<div class='zoom_zoom_outer'>
    <span class='zoom_zoom'></span>
</div>
<p class='zoom_preview'>
    <img class='zoom_preview_img' src='' />
</p>
            `);
        zoom_zoom = zoom_img_box.find(".zoom_zoom");
        zoom_main_img = zoom_img_box.find(".zoom_main_img");
        zoom_zoom_outer = zoom_img_box.find(".zoom_zoom_outer");
        zoom_preview = zoom_img_box.find(".zoom_preview");
        zoom_preview_img = zoom_img_box.find(".zoom_preview_img");

       
        zoom_img_box.css({
            "width": boxHeight + "px",
            "height": boxHeight + "px",
        });

        zoom_img_ul_outer.css({
            "width": boxHeight + "px",
            "height": boxHeight + "px",
        });

        zoom_preview.css({
            "width": boxHeight + "px",
            "height": boxHeight + "px",
            "left": boxHeight + 5 + "px",
        });

        previewImg(imgArr[imgIndex]);
        autoPlay();
        bindingEvent();
    }

    
    function checkLoadedAllImages(images) {
        let timer = setInterval(function () {
            let loaded_images_counter = 0;
            let all_images_num = images.length;
            images.each(function () {
                if (this.complete) {
                    loaded_images_counter++;
                }
            });
            if (loaded_images_counter === all_images_num) {
                clearInterval(timer);
                init();
            }
        }, 100)
    }

    
    function getCursorCoords(event) {
        let e = event || window.event;
        let coords_data = e, 
            x,
            y;

        if (e["touches"] !== undefined) {
            if (e["touches"].length > 0) {
                coords_data = e["touches"][0];
            }
        }

        x = coords_data.clientX || coords_data.pageX;
        y = coords_data.clientY || coords_data.pageY;

        return {'x': x, 'y': y}
    }

    
    function checkNewPositionLimit(new_position) {
        if (-new_position > zoom_img_ul_max_margin) {
            
            new_position = -zoom_img_ul_max_margin;
            imgIndex = 0;
        } else if (new_position > 0) {
            
            new_position = 0;
        }
        return new_position
    }

    
    function bindingEvent() {
        
        zoom_img_ul.on("touchstart", function (event) {
            let coords = getCursorCoords(event);
            startX = coords.x;
            startY = coords.y;

            let left = zoom_img_ul.css("left");
            zoom_img_ul_position = parseInt(left);

            window.clearInterval(autoPlayInterval);
        });

    
        zoom_img_ul.on("touchmove", function (event) {
            let coords = getCursorCoords(event);
            let new_position;
            endX = coords.x;
            endY = coords.y;

          
            new_position = zoom_img_ul_position + endX - startX;
            new_position = checkNewPositionLimit(new_position);
            zoom_img_ul.css("left", new_position);

        });

       
        zoom_img_ul.on("touchend", function (event) {
     
            console.log(endX < startX);
            if (endX < startX) {
                
                moveRight();
            } else if (endX > startX) {
              
                moveLeft();
            }

            autoPlay();
        });

        
        zoom_zoom_outer.on("mousedown", function (event) {
            let coords = getCursorCoords(event);
            startX = coords.x;
            startY = coords.y;

            let left = zoom_img_ul.css("left");
            zoom_img_ul_position = parseInt(left);
        });

        zoom_zoom_outer.on("mouseup", function (event) {
            let offset = ele.offset();

            if (startX - offset.left < boxWidth / 2) {
                
                moveLeft();
            } else if (startX - offset.left > boxWidth / 2) {
               
                moveRight();
            }
        });

       
        ele.on("mouseenter", function () {
            window.clearInterval(autoPlayInterval);
        });
       
        ele.on("mouseleave", function () {
            autoPlay();
        });

     
        zoom_zoom_outer.on("mouseenter", function () {
            zoom_zoom.css("display", "block");
            zoom_preview.css("display", "block");
        });

        
        zoom_zoom_outer.on("mousemove", function (e) {
            let width_limit = zoom_zoom.width() / 2,
                max_X = zoom_zoom_outer.width() - width_limit,
                max_Y = zoom_zoom_outer.height() - width_limit,
                current_X = e.pageX - zoom_zoom_outer.offset().left,
                current_Y = e.pageY - zoom_zoom_outer.offset().top,
                move_X = current_X - width_limit,
                move_Y = current_Y - width_limit;

            if (current_X <= width_limit) {
                move_X = 0;
            }
            if (current_X >= max_X) {
                move_X = max_X - width_limit;
            }
            if (current_Y <= width_limit) {
                move_Y = 0;
            }
            if (current_Y >= max_Y) {
                move_Y = max_Y - width_limit;
            }
            zoom_zoom.css({"left": move_X + "px", "top": move_Y + "px"});

            zoom_preview_img.css({
                "left": -move_X * zoom_preview.width() / zoom_zoom.width() + "px",
                "top": -move_Y * zoom_preview.width() / zoom_zoom.width() + "px"
            });
        });

        
        zoom_zoom_outer.on("mouseleave", function () {
            zoom_zoom.css("display", "none");
            zoom_preview.css("display", "none");
        });

        
        zoom_preview.on("mouseenter", function () {
            zoom_zoom.css("display", "none");
            zoom_preview.css("display", "none");
        });

        
        zoom_next_btn.on("click", function () {
            moveRight();
        });
        zoom_prev_btn.on("click", function () {
            moveLeft();
        });

        zoom_navSpan.hover(function () {
            imgIndex = $(this).index();
            move(imgIndex);
        });
    }

    
    function move(direction) {
        if (typeof direction === "undefined") {
            alert("zoom 中的 move 函数的 direction 参数必填");
        }
       
        if (imgIndex > imgArr.length - 1) {
            imgIndex = 0;
        }

        
        zoom_navSpan.eq(imgIndex).addClass(navHightClass).siblings().removeClass(navHightClass);

        let zoom_nav_width = zoom_nav.width();
        let nav_item_width = g.navItemMargin + g.navWidth + g.navBorder * 2; 
        let new_nav_offset = 0;

        let temp = nav_item_width * (imgIndex + 1);
        if (temp > zoom_nav_width) {
            new_nav_offset =  boxWidth - temp;
        }

        zoom_nav_inner.css({
            "left": new_nav_offset
        });

        
        let new_position = -boxWidth * imgIndex;
        
        new_position = checkNewPositionLimit(new_position);
        zoom_img_ul.stop().animate({"left": new_position}, 500);
       
        previewImg(imgArr[imgIndex]);
    }

    
    function moveRight() {
        imgIndex++;
        if (imgIndex > imgNum) {
            imgIndex = imgNum;
        }
        move("right");
    }

    
    function moveLeft() {
        imgIndex--;
        if (imgIndex < 0) {
            imgIndex = 0;
        }
        move("left");
    }

    
    function autoPlay() {
        if (g.autoPlay) {
            autoPlayInterval = window.setInterval(function () {
                if (imgIndex >= imgNum) {
                    imgIndex = 0;
                }
                imgIndex++;
                move("right");
            }, g.autoPlayTimeout);
        }
    }

    
    function previewImg(image_prop) {
        if (image_prop === undefined) {
            return
        }
        zoom_preview_img.attr("src", image_prop[0]);

        zoom_main_img.attr("src", image_prop[0])
            .css({
                "width": image_prop[3] + "px",
                "height": image_prop[4] + "px"
            });
        zoom_zoom_outer.css({
            "width": image_prop[3] + "px",
            "height": image_prop[4] + "px",
            "top": image_prop[5] + "px",
            "left": image_prop[6] + "px",
            "position": "relative"
        });
        zoom_zoom.css({
            "width": image_prop[7] + "px",
            "height": image_prop[7] + "px"
        });
        zoom_preview_img.css({
            "width": image_prop[8] + "px",
            "height": image_prop[9] + "px"
        });
    }

    /**
     * @param url
     * @param callback
     */
    function getImageSize(url, callback) {
        let img = new Image();
        img.src = url;


        if (typeof callback !== "undefined") {
            if (img.complete) {
                callback(img.width, img.height);
            } else {
                
                img.onload = function () {
                    callback(img.width, img.height);
                }
            }
        } else {
            return {
                width: img.width,
                height: img.height
            }
        }
    }

    /**
     * @param image : jquery 
     * @param width : image 
     * @param height : image 
     * @returns {Array}
     */
    function copute_image_prop(image, width, height) {
        let src;
        let res = [];

        if (typeof image === "string") {
            src = image;
        } else {
            src = image.attr("src");
            let size = getImageSize(src);
            width = size.width;
            height = size.height;
        }

        res[0] = src;
        res[1] = width;
        res[2] = height;
        let img_scale = res[1] / res[2];

        if (img_scale === 1) {
            res[3] = boxHeight;//width
            res[4] = boxHeight;//height
            res[5] = 0;//top
            res[6] = 0;//left
            res[7] = boxHeight / 2;
            res[8] = boxHeight * 2;//width
            res[9] = boxHeight * 2;//height
            zoom_nav_inner.append(`<span><img src="${src}" width="${g.navWidth }" height="${g.navHeight }"/></span>`);
        } else if (img_scale > 1) {
            res[3] = boxHeight;//width
            res[4] = boxHeight / img_scale;
            res[5] = (boxHeight - res[4]) / 2;
            res[6] = 0;//left
            res[7] = res[4] / 2;
            res[8] = boxHeight * 2 * img_scale;//width
            res[9] = boxHeight * 2;//height
            let top = (g.navHeight - (g.navWidth / img_scale)) / 2;
            zoom_nav_inner.append(`<span><img src="${src}" width="${g.navWidth }" style='top:${top}px;' /></span>`);
        } else if (img_scale < 1) {
            res[3] = boxHeight * img_scale;//width
            res[4] = boxHeight;//height
            res[5] = 0;//top
            res[6] = (boxHeight - res[3]) / 2;
            res[7] = res[3] / 2;
            res[8] = boxHeight * 2;//width
            res[9] = boxHeight * 2 / img_scale;
            let top = (g.navWidth - (g.navHeight * img_scale)) / 2;
            zoom_nav_inner.append(`<span><img src="${src}" height="${g.navHeight}" style="left:${top}px;"/></span>`);
        }

        return res;
    }

  
})(jQuery, window);