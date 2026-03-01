//----------------------------------------------------------------
// >>> TABLE OF CONTENTS:
//----------------------------------------------------------------

// 01. Mobile Menu
// 02. UI Animation
// 03. Masonry
// 04. Select List (Dropdown)
// 05. Vertical Tabs Home 1 latest blog post
// 06. Facts Counter
// 07. Category Filter (MixItUp Plugin)
// 08. Owl Carousel
// 09. Blog Tags (Tooltip)
// 10. Owl Carousel
// 11. Sidebar Accordion
// 12. Range slider for sidebar filter
// 13. All expandable Tabs Books & Media Detail Version 3
// 14. Count Down Timmer for days News & Event Detail
// 15. Date Picker for News & Events detail page
// 16. Form Fields (Value Disappear on Focus)
// 17. Bootstrap Carousel Swipe (Testimonials Carousel)
// 18. Testimonial Slider for Home Page V3
// 19. Star Rating
// 20. Product Quantity Input
// 21. Scroll to top

//----------------------------------------------------------------

$(function () {
  'use strict';

  //Mobile Menu
  //--------------------------------------------------------
  var bodyObj = $('body');
  var MenuObj = $("#menu");
  var mobileMenuObj = $('#mobile-menu');

  bodyObj.wrapInner('<div id="wrap"></div>');

  var toggleMenu = {
    elem: MenuObj,
    mobile: function () {
      //activate mmenu
      mobileMenuObj.mmenu({
        slidingSubmenus: false,
        position: 'right',
        zposition: 'front'
      }, {
        pageSelector: '#wrap'
      });

      //hide desktop top menu
      this.elem.hide();
    },
    desktop: function () {
      //close the menu
      mobileMenuObj.trigger("close.mm");

      //reshow desktop menu
      this.elem.show();
    }
  };

  Harvey.attach('screen and (max-width:991px)', {
    setup: function () {
      //called when the query becomes valid for the first time
    },
    on: function () {
      //called each time the query is activated
      toggleMenu.mobile();
    },
    off: function () {
      //called each time the query is deactivated
    }
  });

  Harvey.attach('screen and (min-width:992px)', {
    setup: function () {
      //called when the query becomes valid for the first time
    },
    on: function () {
      //called each time the query is activated
      toggleMenu.desktop();
    },
    off: function () {
      //called each time the query is deactivated
    }
  });

  //Ui Animation
  AOS.init({
    easing: 'ease-in-out-sine'
  });

  hljs.initHighlightingOnLoad();
  $('.hero__scroll').on('click', function (e) {
    $('html, body').animate({
      scrollTop: $(window).height()
    }, 1200);
  });
  //Ui Animation end

  $(".carousel").swipe({
    swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
      if (direction == 'left') $(this).carousel('next');
      if (direction == 'right') $(this).carousel('prev');
    },
    allowPageScroll: "vertical"
  });

  //Masonry
  //--------------------------------------------------------
  var girdFieldObj = $('.grid');
  girdFieldObj.masonry({
    itemSelector: '.grid-item',
    percentPosition: true
  });

  //Select List (Dropdown)
  //--------------------------------------------------------
  var selectObj = $('select');
  var selectListObj = $('ul.select-list');
  selectObj.each(function () {
    var $this = $(this), numberOfOptions = $(this).children('option').length;

    $this.addClass('select-hidden');
    $this.wrap('<div class="select"></div>');
    $this.after('<div class="select-styled"></div>');

    var $styledSelect = $this.next('div.select-styled');
    $styledSelect.text($this.children('option').eq(0).text());

    var $list = $('<ul />', {
      'class': 'select-list'
    }).insertAfter($styledSelect);

    for (var i = 0; i < numberOfOptions; i++) {
      $('<li />', {
        text: $this.children('option').eq(i).text(),
        rel: $this.children('option').eq(i).val()
      }).appendTo($list);
    }

    var $listItems = $list.children('li');

    $styledSelect.on('click', function (e) {
      e.stopPropagation();
      $('div.select-styled.active').not(this).each(function () {
        $(this).removeClass('active').next(selectListObj).hide();
      });
      $(this).toggleClass('active').next(selectListObj).toggle();
    });

    $listItems.on('click', function (e) {
      e.stopPropagation();
      $styledSelect.text($(this).text()).removeClass('active');
      $this.val($(this).attr('rel'));
      $list.hide();
    });

    $(document).on('click', function () {
      $styledSelect.removeClass('active');
      $list.hide();
    });

  });

  //Vertical Tabs Home 1 latest blog post
  //--------------------------------------------------------
  var tabObject = $(".tabs-menu li");
  var tabContent = $(".tabs-list .tab-content");
  tabObject.on('click', function (e) {
    e.preventDefault();
    $(this).siblings('li.active').removeClass("active");
    $(this).addClass("active");
    var index = $(this).index();
    tabContent.removeClass("active");
    tabContent.eq(index).addClass("active");
  });

  //Facts Counter
  //--------------------------------------------------------
  var counterObj = $('.fact-counter');
  counterObj.counterUp({
    delay: 10,
    time: 500
  });

  //Category Filter (MixItUp Plugin)
  //--------------------------------------------------------
  var folioFilterObj = $('#category-filter, #category-filter-v2');
  folioFilterObj.mixItUp();

  //Owl Carousel
  //--------------------------------------------------------

  //Home Page Testimonial slider
  var owlObj = $('.owl-carousel');
  owlObj.owlCarousel({
    loop: false,
    margin: 30,
    nav: false,
    dots: true,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 1
      },
      1000: {
        items: 2
      }
    }
  });

  //Carousel For Book Media detail page 1
  var owlEventObj = $('.books-media-grid-carousel');
  owlEventObj.owlCarousel({
    loop: false,
    margin: 30,
    nav: true,
    dots: false,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 2
      },
      1000: {
        items: 3
      }
    }
  });

  //Books & Media Detail Page version 2
  var owlObj = $('.owl-carousel-full');
  owlObj.owlCarousel({
    loop: false,
    margin: 30,
    nav: true,
    dots: false,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 2
      },
      1000: {
        items: 6
      }
    }
  });

  var owlEventObj = $('.owl-carousel-v3');
  owlEventObj.owlCarousel({
    loop: false,
    margin: 30,
    nav: true,
    dots: false,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 2
      },
      1200: {
        items: 3
      },
      1400: {
        items: 4
      }
    }
  });

  // Books & Media Version 1
  var owlObj = $('.staffpick-carousel');
  owlObj.owlCarousel({
    loop: false,
    margin: 0,
    nav: false,
    dots: true,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 2
      },
      1000: {
        items: 4
      }
    }
  });

  //Sidebar Accordion
  //--------------------------------------------------------
  var secondaryObj = $('#secondary [data-accordion]');
  var multipleObj = $('#multiple [data-accordion]');
  var singleObj = $('#single[data-accordion]');

  secondaryObj.accordion({
    singleOpen: true
  });

  multipleObj.accordion({
    singleOpen: false
  });

  singleObj.accordion({
    transitionEasing: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
    transitionSpeed: 200
  });

  //Range slider for sidebar filter
  //--------------------------------------------------------
  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 500,
    values: [75, 300],
    slide: function (event, ui) {
      $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
    }
  });
  $("#amount").val("$" + $("#slider-range").slider("values", 0) +
    " - $" + $("#slider-range").slider("values", 1));

  //All expandable Tabs Books & Media Detail Version 3
  //--------------------------------------------------------

  var headers = $('#accordion .accordion-header');
  var contentAreas = $('#accordion .ui-accordion-content ').hide();
  var expandLink = $('.accordion-expand-all');

  // add the accordion functionality
  headers.click(function () {
    var panel = $(this).next();
    var isOpen = panel.is(':visible');

    // open or close as necessary
    panel[isOpen ? 'slideUp' : 'slideDown']()
      // trigger the correct custom event
      .trigger(isOpen ? 'hide' : 'show');

    // stop the link from causing a pagescroll
    return false;
  });

  // hook up the expand/collapse all
  expandLink.click(function () {
    $(".ui-accordion-content").show();
  });

  // Count Down Timmer for days News & Event Detail
  //--------------------------------------------------------  
  if ($('#countdown').length > 0) {
    const second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;
    let birthday = "Sep 30, 2021 00:00:00",

      countDown = new Date(birthday).getTime(),
      x = setInterval(function () {

        let now = new Date().getTime(),
          distance = countDown - now;

        document.getElementById("days").innerText = Math.floor(distance / (day)),
          document.getElementById("hours").innerText = Math.floor((distance % (day)) / (hour)),
          document.getElementById("minutes").innerText = Math.floor((distance % (hour)) / (minute)),
          document.getElementById("seconds").innerText = Math.floor((distance % (minute)) / second);

        //do something later when date is reached
        if (distance < 0) {
          let headline = document.getElementById("headline"),
            countdown = document.getElementById("countdown"),
            content = document.getElementById("content");

          headline.innerText = "It's my birthday!";
          countdown.style.display = "none";
          content.style.display = "block";

          clearInterval(x);
        }
        //seconds
      }, 0)
  }
  //Date Picker for News & Events detail page
  //--------------------------------------------------------
  $("#start-date").datepicker();
  $("#end-date").datepicker();
  $("#startdate").datepicker();
  $("#enddate").datepicker();


  //Form Fields (Value Disappear on Focus)
  //--------------------------------------------------------
  var requiredFieldObj = $('.input-required');

  requiredFieldObj.find('input').on('focus', function () {
    if (!$(this).parent(requiredFieldObj).find('label').hasClass('hide')) {
      $(this).parent(requiredFieldObj).find('label').addClass('hide');
    }
  });

  requiredFieldObj.find('input').on('blur', function () {
    if ($(this).val() === '' && $(this).parent(requiredFieldObj).find('label').hasClass('hide')) {
      $(this).parent(requiredFieldObj).find('label').removeClass('hide');
    }
  });

  //Bootstrap Carousel Swipe (Testimonials Carousel)
  //--------------------------------------------------------
  var testimonialsObj = $("#testimonials");
  testimonialsObj.swiperight(function () {
    $(this).carousel('prev');
  });
  testimonialsObj.swipeleft(function () {
    $(this).carousel('next');
  });

  //Testimonial Slider for Home Page V3
  //--------------------------------------------------------
  if ($('div').hasClass('slider'))
    window.slider = $('.slider').cardSlider({
      slideTag: 'div',
      slideClass: 'slide',
      current: 1,
      followingClass: 'slider-content',
      delay: 500,
      transition: 'ease',
      onBeforeMove: function (slider, onMove) {
        console.log('onBeforeMove');
        onMove();
      },
      onMove: function (slider, onAfterMove) {
        onAfterMove();
      },
      onAfterMove: function () {
        console.log('onAfterMove');
      },
      onAfterTransition: function () {
        console.log('onAfterTransition');
      },
      onCurrent: function () {
        console.log('onCurrent');
      },
      onInit: function (slider) {
        $(".slideNext").bind('click', function () {
          slider.next();
        });

        $(".slidePrev").bind('click', function () {
          slider.prev();
        });
      }
    });

  // Strar rating
  var $star_rating = $('.star-rating-v2 .fa');

  var SetRatingStar = function () {
    return $star_rating.each(function () {
      if (parseInt($star_rating.siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
        return $(this).removeClass('fa-star-o').addClass('fa-star');
      } else {
        return $(this).removeClass('fa-star').addClass('fa-star-o');
      }
    });
  };
  $star_rating.on('click', function () {
    $star_rating.siblings('input.rating-value').val($(this).data('rating'));
    return SetRatingStar();
  });
  SetRatingStar();

  // Product Quantity Input
  var jQueryPlugin = (window.jQueryPlugin = function (ident, func) {
    return function (arg) {
      if (this.length > 1) {
        this.each(function () {
          var $this = $(this);

          if (!$this.data(ident)) {
            $this.data(ident, func($this, arg));
          }
        });

        return this;
      } else if (this.length === 1) {
        if (!this.data(ident)) {
          this.data(ident, func(this, arg));
        }

        return this.data(ident);
      }
    };
  });

  function Guantity($root) {
    const element = $root;
    const quantity = $root.first("data-quantity");
    const quantity_target = $root.find("[data-quantity-target]");
    const quantity_minus = $root.find("[data-quantity-minus]");
    const quantity_plus = $root.find("[data-quantity-plus]");
    var quantity_ = quantity_target.val();
    $(quantity_minus).click(function () {
      quantity_target.val(--quantity_);
    });
    $(quantity_plus).click(function () {
      quantity_target.val(++quantity_);
    });
  }
  $.fn.Guantity = jQueryPlugin("Guantity", Guantity);
  $("[data-quantity]").Guantity();
  // Product Quantity Input End

  $('.accordion-expand-all').click(function (e) {
    $('#accordion').find('.accordion-collapse').each(function () {
      if ($(this).hasClass('open')) {
        $(this).slideUp();
        $(this).removeClass('open');
        $(this).removeClass('active');
      } else {
        $(this).addClass('open');
        $(this).slideDown();
      }
    })
  });

  // Scroll to top
  var mybutton = document.getElementById("myBtn");
  // When the user scrolls down 20px from the top of the document, show the button
  window.onscroll = function () { scrollFunction() };
  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      mybutton.style.display = "block";
    } else {
      mybutton.style.display = "none";
    }
  }
  // When the user clicks on the button, scroll to the top of the document
  $('#myBtn').click(function (e) {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
  })

});